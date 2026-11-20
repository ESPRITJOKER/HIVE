-- HIVE — Phase 3 support: admin settings, document storage, integrity guards.
--
-- Everything here is enforced in the database. Application checks are defence
-- in depth only; RLS remains the authoritative authorization boundary.

-- ---------------------------------------------------------------------------
-- Platform settings (administrator-only, persisted — never local UI state)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (char_length(key) between 1 and 80),
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null
);

alter table public.platform_settings enable row level security;

drop policy if exists platform_settings_select on public.platform_settings;
create policy platform_settings_select on public.platform_settings for select to authenticated
using (public.is_admin());

drop policy if exists platform_settings_write on public.platform_settings;
create policy platform_settings_write on public.platform_settings for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop trigger if exists platform_settings_touch on public.platform_settings;
create trigger platform_settings_touch before update on public.platform_settings
for each row execute function public.touch_updated_at();

drop trigger if exists audit_platform_settings on public.platform_settings;
create trigger audit_platform_settings after insert or update or delete on public.platform_settings
for each row execute function public.write_audit_log();

-- Values must be readable by any signed-in user (e.g. to enforce the upload
-- cap), but the settings table itself stays administrator-only. This definer
-- RPC exposes one key at a time and never the whole table.
create or replace function public.platform_setting(p_key text)
returns jsonb
language sql stable security definer set search_path = public, pg_temp
as $$ select value from public.platform_settings where key = p_key $$;

revoke all on function public.platform_setting(text) from public, anon;
grant execute on function public.platform_setting(text) to authenticated;

-- Sensitive writes that were previously unlogged.
drop trigger if exists audit_courses on public.courses;
create trigger audit_courses after insert or update or delete on public.courses
for each row execute function public.write_audit_log();

drop trigger if exists audit_channels on public.channels;
create trigger audit_channels after insert or update or delete on public.channels
for each row execute function public.write_audit_log();

drop trigger if exists audit_class_members on public.class_members;
create trigger audit_class_members after insert or update or delete on public.class_members
for each row execute function public.write_audit_log();

-- ---------------------------------------------------------------------------
-- Document processing integrity
-- Only the ingestion pipeline (service role / background job with no auth.uid)
-- may advance a document beyond 'uploaded' or 'failed'. A client cannot mark a
-- document as 'indexed' and thereby fake AI grounding.
-- ---------------------------------------------------------------------------
create or replace function public.guard_document_status()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null
     and new.processing_status is distinct from old.processing_status
     and new.processing_status not in ('uploaded', 'failed') then
    raise exception 'Document processing status is managed by the ingestion pipeline';
  end if;
  return new;
end $$;

drop trigger if exists guard_document_status on public.documents;
create trigger guard_document_status before update on public.documents
for each row execute function public.guard_document_status();

-- ---------------------------------------------------------------------------
-- Private document storage.
-- Object paths MUST begin with the owning class id:
--   <class_id>/<course_id>/<document_id-or-draft>/<file_name>
-- Storage RLS resolves that prefix with definer helpers so representatives
-- can only write inside classes they are assigned to, and students can only
-- read material for classes they belong to.
-- ---------------------------------------------------------------------------
create or replace function public.storage_object_class_id(p_path text)
returns uuid
language plpgsql immutable
set search_path = public, pg_temp
as $$
declare
  v_class_id uuid;
begin
  v_class_id := nullif(split_part(coalesce(p_path, ''), '/', 1), '')::uuid;
  return v_class_id;
exception when others then
  return null;
end $$;

create or replace function public.can_access_storage_path(p_path text)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$ select public.can_access_class(public.storage_object_class_id(p_path)) $$;

create or replace function public.can_manage_storage_path(p_path text)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$ select public.is_representative_of(public.storage_object_class_id(p_path)) $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  26214400,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown'
  ]::text[]
)
on conflict (id) do update set
  "public" = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists storage_documents_select on storage.objects;
create policy storage_documents_select on storage.objects for select to authenticated
using (bucket_id = 'documents' and public.can_access_storage_path(name));

drop policy if exists storage_documents_insert on storage.objects;
create policy storage_documents_insert on storage.objects for insert to authenticated
with check (bucket_id = 'documents' and public.can_manage_storage_path(name));

drop policy if exists storage_documents_update on storage.objects;
create policy storage_documents_update on storage.objects for update to authenticated
using (bucket_id = 'documents' and public.can_manage_storage_path(name))
with check (bucket_id = 'documents' and public.can_manage_storage_path(name));

drop policy if exists storage_documents_delete on storage.objects;
create policy storage_documents_delete on storage.objects for delete to authenticated
using (bucket_id = 'documents' and public.can_manage_storage_path(name));

-- ---------------------------------------------------------------------------
-- Hardening: 0004 granted every function to anon. This maintenance function
-- has no auth check of its own, so remove that unintended grant.
-- ---------------------------------------------------------------------------
-- EXECUTE is also granted to PUBLIC by default when a function is created, so
-- both grants must be removed or anon inherits access through PUBLIC.
revoke all on function public.archive_expired_opportunities() from public, anon;
