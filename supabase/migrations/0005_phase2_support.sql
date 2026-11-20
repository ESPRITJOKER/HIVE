-- HIVE — Phase 2 support objects
-- (1) Saved resources: a per-student bookmark on documents.
-- (2) Realtime publication for discussion messages.
-- RLS remains the authorization boundary; the API-role grants in 0004 also
-- apply to these new objects via default privileges, but are repeated here
-- explicitly so this migration is self-contained.

-- ---------------------------------------------------------------------------
-- Saved resources
-- ---------------------------------------------------------------------------
create table if not exists public.saved_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, document_id)
);

create index if not exists idx_saved_resources_user
  on public.saved_resources (user_id, created_at desc);

alter table public.saved_resources enable row level security;

drop policy if exists saved_resources_select on public.saved_resources;
create policy saved_resources_select on public.saved_resources for select to authenticated
using (user_id = auth.uid());

drop policy if exists saved_resources_insert on public.saved_resources;
create policy saved_resources_insert on public.saved_resources for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.documents d
    where d.id = document_id
      and public.can_access_class(public.course_class_id(d.course_id))
  )
);

drop policy if exists saved_resources_delete on public.saved_resources;
create policy saved_resources_delete on public.saved_resources for delete to authenticated
using (user_id = auth.uid());

grant select, insert, delete on public.saved_resources to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: stream only discussion messages, never documents or private rows.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
