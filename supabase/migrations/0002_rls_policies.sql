-- HIVE — helper functions + Row Level Security
-- Enforcement model: DB is the primary authorization boundary.
-- SECURITY DEFINER helpers deliberately bypass RLS to avoid recursive policies.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public, pg_temp
as $$ select role from public.users where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$ select coalesce((select role = 'administrator' from public.users where id = auth.uid()), false) $$;

create or replace function public.current_user_class_ids()
returns uuid[]
language sql stable security definer set search_path = public, pg_temp
as $$
  select coalesce(array_agg(class_id), '{}'::uuid[])
  from public.class_members
  where user_id = auth.uid() and membership_status = 'active'
$$;

create or replace function public.is_representative_of(target_class_id uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_admin() or exists (
    select 1 from public.representative_assignments
    where user_id = auth.uid() and class_id = target_class_id
  )
$$;

create or replace function public.can_access_class(target_class_id uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_admin()
    or target_class_id = any (public.current_user_class_ids())
    or exists (
      select 1 from public.representative_assignments
      where user_id = auth.uid() and class_id = target_class_id
    )
$$;

create or replace function public.course_class_id(target_course_id uuid)
returns uuid
language sql stable security definer set search_path = public, pg_temp
as $$ select class_id from public.courses where id = target_course_id $$;

create or replace function public.message_class_id(target_message_id uuid)
returns uuid
language sql stable security definer set search_path = public, pg_temp
as $$
  select coalesce(
    (select c.class_id from public.courses c join public.messages m on m.course_id = c.id where m.id = target_message_id),
    (select ch.class_id from public.channels ch join public.messages m on m.channel_id = ch.id where m.id = target_message_id)
  )
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table holding user or class data
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.representative_assignments enable row level security;
alter table public.courses enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.generated_content enable row level security;
alter table public.timetable_slots enable row level security;
alter table public.tasks_events enable row level security;
alter table public.user_task_state enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_usage enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- users — role changes are admin-only (trigger in 0003 blocks self-escalation)
-- ---------------------------------------------------------------------------
drop policy if exists users_select on public.users;
create policy users_select on public.users for select to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.class_members cm
    join public.representative_assignments ra on ra.class_id = cm.class_id
    where cm.user_id = public.users.id and ra.user_id = auth.uid()
  )
);

drop policy if exists users_update on public.users;
create policy users_update on public.users for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- classes / membership / representative assignments
-- ---------------------------------------------------------------------------
drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes for select to authenticated
using (
  public.is_admin()
  or public.can_access_class(id)
  or exists (select 1 from public.class_members cm where cm.class_id = classes.id and cm.user_id = auth.uid())
);

drop policy if exists classes_admin_write on public.classes;
create policy classes_admin_write on public.classes for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists class_members_select on public.class_members;
create policy class_members_select on public.class_members for select to authenticated
using (user_id = auth.uid() or public.is_admin() or public.is_representative_of(class_id));

drop policy if exists class_members_admin_write on public.class_members;
create policy class_members_admin_write on public.class_members for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists rep_assignments_select on public.representative_assignments;
create policy rep_assignments_select on public.representative_assignments for select to authenticated
using (user_id = auth.uid() or public.is_admin() or public.can_access_class(class_id));

drop policy if exists rep_assignments_admin_write on public.representative_assignments;
create policy rep_assignments_admin_write on public.representative_assignments for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select to authenticated
using (public.can_access_class(class_id));

drop policy if exists courses_rep_write on public.courses;
create policy courses_rep_write on public.courses for all to authenticated
using (public.is_representative_of(class_id)) with check (public.is_representative_of(class_id));

-- ---------------------------------------------------------------------------
-- documents & chunks — only representatives upload official documents
-- ---------------------------------------------------------------------------
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents for select to authenticated
using (public.can_access_class(public.course_class_id(course_id)));

drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents for insert to authenticated
with check (
  uploader_id = auth.uid()
  and public.is_representative_of(public.course_class_id(course_id))
);

drop policy if exists documents_write on public.documents;
create policy documents_write on public.documents for update to authenticated
using (public.is_representative_of(public.course_class_id(course_id)))
with check (public.is_representative_of(public.course_class_id(course_id)));

drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents for delete to authenticated
using (public.is_representative_of(public.course_class_id(course_id)));

-- Chunk reads are class-scoped. Writes are service-role only (indexing pipeline).
drop policy if exists chunks_select on public.document_chunks;
create policy chunks_select on public.document_chunks for select to authenticated
using (
  exists (
    select 1 from public.documents d
    where d.id = document_id and public.can_access_class(public.course_class_id(d.course_id))
  )
);

drop policy if exists generated_select on public.generated_content;
create policy generated_select on public.generated_content for select to authenticated
using (public.can_access_class(public.course_class_id(course_id)));

drop policy if exists generated_rep_write on public.generated_content;
create policy generated_rep_write on public.generated_content for all to authenticated
using (public.is_representative_of(public.course_class_id(course_id)))
with check (public.is_representative_of(public.course_class_id(course_id)));

-- ---------------------------------------------------------------------------
-- timetable, tasks & per-student state
-- ---------------------------------------------------------------------------
drop policy if exists timetable_select on public.timetable_slots;
create policy timetable_select on public.timetable_slots for select to authenticated
using (public.can_access_class(public.course_class_id(course_id)));

drop policy if exists timetable_rep_write on public.timetable_slots;
create policy timetable_rep_write on public.timetable_slots for all to authenticated
using (public.is_representative_of(public.course_class_id(course_id)))
with check (public.is_representative_of(public.course_class_id(course_id)));

drop policy if exists tasks_select on public.tasks_events;
create policy tasks_select on public.tasks_events for select to authenticated
using (public.can_access_class(public.course_class_id(course_id)));

drop policy if exists tasks_rep_write on public.tasks_events;
create policy tasks_rep_write on public.tasks_events for all to authenticated
using (public.is_representative_of(public.course_class_id(course_id)))
with check (public.is_representative_of(public.course_class_id(course_id)));

drop policy if exists task_state_select on public.user_task_state;
create policy task_state_select on public.user_task_state for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists task_state_insert on public.user_task_state;
create policy task_state_insert on public.user_task_state for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.tasks_events t
    where t.id = task_id and public.can_access_class(public.course_class_id(t.course_id))
  )
);

drop policy if exists task_state_update on public.user_task_state;
create policy task_state_update on public.user_task_state for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists task_state_delete on public.user_task_state;
create policy task_state_delete on public.user_task_state for delete to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- discussions
-- ---------------------------------------------------------------------------
drop policy if exists channels_select on public.channels;
create policy channels_select on public.channels for select to authenticated
using (public.can_access_class(class_id));

drop policy if exists channels_rep_write on public.channels;
create policy channels_rep_write on public.channels for all to authenticated
using (public.is_representative_of(class_id)) with check (public.is_representative_of(class_id));

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select to authenticated
using (
  public.can_access_class(public.message_class_id(id))
  and moderation_status <> 'hidden'
);

-- NOTE: message_class_id(id) cannot be used in an INSERT check because the row
-- does not exist yet. Resolve class directly from the referenced target instead.
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
with check (
  user_id = auth.uid()
  and (
    (course_id is not null and public.can_access_class(public.course_class_id(course_id)))
    or (
      channel_id is not null
      and public.can_access_class((select ch.class_id from public.channels ch where ch.id = channel_id))
    )
  )
);

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages for update to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or public.is_representative_of(public.message_class_id(id))
)
with check (
  user_id = auth.uid()
  or public.is_admin()
  or public.is_representative_of(public.message_class_id(id))
);

drop policy if exists messages_delete on public.messages;
create policy messages_delete on public.messages for delete to authenticated
using (public.is_admin() or public.is_representative_of(public.message_class_id(id)));

-- ---------------------------------------------------------------------------
-- notifications, subscriptions & AI
-- ---------------------------------------------------------------------------
drop policy if exists push_select on public.push_subscriptions;
create policy push_select on public.push_subscriptions for select to authenticated
using (user_id = auth.uid());

drop policy if exists push_insert on public.push_subscriptions;
create policy push_insert on public.push_subscriptions for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists push_delete on public.push_subscriptions;
create policy push_delete on public.push_subscriptions for delete to authenticated
using (user_id = auth.uid());

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated
using (user_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists ai_usage_select on public.ai_usage;
create policy ai_usage_select on public.ai_usage for select to authenticated
using (user_id = auth.uid() or public.is_admin());
-- No client write policies: quota counters are mutated only by the
-- SECURITY DEFINER function increment_ai_usage() in 0003.

drop policy if exists conversations_all on public.ai_conversations;
create policy conversations_all on public.ai_conversations for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Administrators intentionally cannot read private student conversations.

drop policy if exists ai_messages_all on public.ai_messages;
create policy ai_messages_all on public.ai_messages for all to authenticated
using (
  exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
)
with check (
  exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);

-- Audit logs: read-only for administrators; writes only via definer triggers/functions.
drop policy if exists audit_select on public.audit_logs;
create policy audit_select on public.audit_logs for select to authenticated
using (public.is_admin());
