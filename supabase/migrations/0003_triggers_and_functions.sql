-- HIVE — triggers, audit functions, quota counter and maintenance helpers

-- ---------------------------------------------------------------------------
-- Supporting constraint / column added after initial design review
-- ---------------------------------------------------------------------------
alter table public.tasks_events add column if not exists archived_at timestamptz;
create index if not exists idx_tasks_archived on public.tasks_events (archived_at, due_date);

alter table public.messages drop constraint if exists messages_target_present;
alter table public.messages add constraint messages_target_present
  check (course_id is not null or channel_id is not null);

-- ---------------------------------------------------------------------------
-- Profile provisioning: every Supabase Auth user gets a student profile
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role escalation guard: users cannot change their own role.
-- A NULL auth.uid() means a trusted service-role/background operation.
-- ---------------------------------------------------------------------------
create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only administrators may change user roles';
  end if;
  return new;
end $$;

drop trigger if exists users_role_guard on public.users;
create trigger users_role_guard
before update on public.users for each row execute function public.prevent_role_self_change();

-- ---------------------------------------------------------------------------
-- Generic audit writer. Sensitive operations are recorded with the actor.
-- ---------------------------------------------------------------------------
create or replace function public.write_audit_log()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  insert into public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
  values (
    auth.uid(),
    tg_op || ':' || tg_table_name,
    tg_table_name,
    (case when tg_op = 'DELETE' then old.id else new.id end)::uuid,
    jsonb_build_object('table', tg_table_name, 'operation', tg_op)
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

drop trigger if exists audit_users on public.users;
create trigger audit_users after update on public.users
for each row execute function public.write_audit_log();

drop trigger if exists audit_documents on public.documents;
create trigger audit_documents after insert or update or delete on public.documents
for each row execute function public.write_audit_log();

drop trigger if exists audit_timetable on public.timetable_slots;
create trigger audit_timetable after insert or update or delete on public.timetable_slots
for each row execute function public.write_audit_log();

drop trigger if exists audit_tasks on public.tasks_events;
create trigger audit_tasks after insert or update or delete on public.tasks_events
for each row execute function public.write_audit_log();

drop trigger if exists audit_rep_assignments on public.representative_assignments;
create trigger audit_rep_assignments after insert or update or delete on public.representative_assignments
for each row execute function public.write_audit_log();

-- Append-only audit log: no UPDATE or DELETE for anyone, including administrators.
create or replace function public.prevent_audit_mutation()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  raise exception 'Audit logs are append-only';
end $$;

drop trigger if exists audit_logs_immutable on public.audit_logs;
create trigger audit_logs_immutable
before update or delete on public.audit_logs
for each row execute function public.prevent_audit_mutation();

-- ---------------------------------------------------------------------------
-- Timestamp maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists task_state_touch on public.user_task_state;
create trigger task_state_touch before update on public.user_task_state
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Class joining via code (no direct client writes to class_members)
-- ---------------------------------------------------------------------------
create or replace function public.join_class(p_code text)
returns uuid
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_class_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  select id into v_class_id from public.classes where upper(code) = upper(trim(p_code));
  if v_class_id is null then raise exception 'Invalid class code'; end if;

  insert into public.class_members (user_id, class_id, membership_status)
  values (auth.uid(), v_class_id, 'pending')
  on conflict (user_id, class_id) do nothing;

  return v_class_id;
end $$;

revoke all on function public.join_class(text) from public;
grant execute on function public.join_class(text) to authenticated;

-- ---------------------------------------------------------------------------
-- AI quota counter. Atomic; increments only while under the configured limit.
-- p_limit is supplied by the server from admin configuration (never by client).
-- ---------------------------------------------------------------------------
create or replace function public.increment_ai_usage(p_limit integer default 20)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  if auth.uid() is null or p_limit is null or p_limit <= 0 then return false; end if;

  insert into public.ai_usage (user_id, day, request_count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set request_count = public.ai_usage.request_count + 1
  where public.ai_usage.request_count < p_limit
  returning request_count into v_count;

  return v_count is not null and v_count <= p_limit;
end $$;

revoke all on function public.increment_ai_usage(integer) from public;
grant execute on function public.increment_ai_usage(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Opportunity archiving (invoked by pg_cron / scheduled workflow)
-- ---------------------------------------------------------------------------
create or replace function public.archive_expired_opportunities()
returns integer
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_count integer;
begin
  update public.tasks_events
  set archived_at = now()
  where due_date is not null
    and due_date < now()
    and archived_at is null
    and category in ('hackathon', 'internship', 'scholarship', 'event');
  get diagnostics v_count = row_count;
  return v_count;
end $$;
