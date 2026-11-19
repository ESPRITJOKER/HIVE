-- HIVE — initial schema
-- 17 required entities from the specification + 2 supporting entities
-- (representative_assignments, notifications).
-- All primary keys are UUIDs. No manual production schema changes: migrations only.

create extension if not exists pgcrypto;
create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Enums (guarded so the migration is re-runnable on a fresh scratch DB)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('student', 'representative', 'administrator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.membership_status as enum ('pending', 'active', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_processing_status as enum
    ('uploaded', 'extracting', 'chunking', 'embedding', 'indexed', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.timetable_slot_type as enum
    ('lecture_cm', 'tutorial_td', 'practical_tp', 'examination');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.task_event_category as enum
    ('assignment', 'exam', 'hackathon', 'internship', 'scholarship', 'event');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.channel_type as enum ('general', 'subject');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.generated_content_type as enum
    ('summary', 'revision_sheet', 'quiz', 'explanation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ai_message_role as enum ('user', 'assistant');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Identity & organisation
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null check (char_length(full_name) between 1 and 120),
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  code text not null unique check (char_length(code) between 3 and 40),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  membership_status public.membership_status not null default 'pending',
  joined_at timestamptz not null default now(),
  unique (user_id, class_id)
);

create table if not exists public.representative_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, class_id)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  code text not null check (char_length(code) between 1 and 40),
  title text not null check (char_length(title) between 1 and 200),
  description text,
  created_at timestamptz not null default now(),
  unique (class_id, code)
);

-- ---------------------------------------------------------------------------
-- Documents & AI knowledge base
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  file_path text,
  drive_url text,
  uploader_id uuid not null references public.users (id) on delete restrict,
  version integer not null default 1 check (version > 0),
  processing_status public.document_processing_status not null default 'uploaded',
  content_hash text,
  error_message text,
  created_at timestamptz not null default now(),
  constraint documents_source_present check (file_path is not null or drive_url is not null),
  constraint documents_drive_url_https check (drive_url is null or drive_url like 'https://%')
);

-- Embedding dimension is a validated configuration value (default 384 for
-- multilingual-e5-small). Changing it REQUIRES a migration — see ADR in
-- AI_ARCHITECTURE.md. Model output is validated before write at ingestion time.
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  content text not null check (char_length(content) > 0),
  embedding halfvec(384),
  page_number integer check (page_number is null or page_number > 0),
  section_title text,
  chunk_index integer not null check (chunk_index >= 0),
  token_count integer check (token_count is null or token_count > 0),
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table if not exists public.generated_content (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  type public.generated_content_type not null,
  content jsonb not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (course_id, type, content_hash)
);

-- ---------------------------------------------------------------------------
-- Timetable, tasks & opportunities
-- ---------------------------------------------------------------------------
create table if not exists public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  subject text not null,
  room text,
  teacher text,
  day text not null check (day in
    ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  start_time time not null,
  end_time time not null,
  type public.timetable_slot_type not null default 'lecture_cm',
  created_at timestamptz not null default now(),
  constraint timetable_time_order check (end_time > start_time)
);

create table if not exists public.tasks_events (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  category public.task_event_category not null,
  attachment text,
  created_at timestamptz not null default now()
);

-- Per-student state: one row per (user, task). Never shared between students.
create table if not exists public.user_task_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  task_id uuid not null references public.tasks_events (id) on delete cascade,
  is_completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

-- ---------------------------------------------------------------------------
-- Discussions
-- ---------------------------------------------------------------------------
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  course_id uuid references public.courses (id) on delete cascade,
  name text not null,
  channel_type public.channel_type not null default 'general',
  created_at timestamptz not null default now(),
  unique (class_id, name)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  course_id uuid references public.courses (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 10000),
  moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'hidden', 'indexed')),
  is_indexed boolean not null default false,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AI usage, conversations & audit
-- ---------------------------------------------------------------------------
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  day date not null default current_date,
  request_count integer not null default 0 check (request_count >= 0),
  unique (user_id, day)
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null default 'New conversation',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  role public.ai_message_role not null,
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (pagination-friendly, scoped to common access paths)
-- ---------------------------------------------------------------------------
create index if not exists idx_class_members_user on public.class_members (user_id);
create index if not exists idx_class_members_class on public.class_members (class_id);
create index if not exists idx_rep_assignments_user on public.representative_assignments (user_id);
create index if not exists idx_rep_assignments_class on public.representative_assignments (class_id);

create index if not exists idx_courses_class on public.courses (class_id);

create index if not exists idx_documents_course on public.documents (course_id, created_at desc);
create index if not exists idx_documents_uploader on public.documents (uploader_id);
create index if not exists idx_documents_status on public.documents (processing_status);
create index if not exists idx_documents_hash on public.documents (content_hash);

create index if not exists idx_chunks_document on public.document_chunks (document_id, chunk_index);
create index if not exists idx_chunks_hash on public.document_chunks (content_hash);
-- Vector index: cosine distance on halfvec(384). Maintainers: dimension change = migration.
create index if not exists idx_chunks_embedding on public.document_chunks
  using hnsw (embedding halfvec_cosine_ops);

create index if not exists idx_generated_course_type on public.generated_content (course_id, type);

create index if not exists idx_timetable_course_day on public.timetable_slots (course_id, day, start_time);
create index if not exists idx_tasks_course_due on public.tasks_events (course_id, due_date);
create index if not exists idx_task_state_user on public.user_task_state (user_id, is_completed);
create index if not exists idx_task_state_task on public.user_task_state (task_id);

create index if not exists idx_channels_class on public.channels (class_id);
create index if not exists idx_messages_channel on public.messages (channel_id, created_at desc);
create index if not exists idx_messages_course on public.messages (course_id, created_at desc);
create index if not exists idx_messages_moderation on public.messages (moderation_status, is_indexed);

create index if not exists idx_push_user on public.push_subscriptions (user_id);
create index if not exists idx_notifications_user on public.notifications (user_id, read_at, created_at desc);

create index if not exists idx_ai_usage_user_day on public.ai_usage (user_id, day);
create index if not exists idx_conversations_user on public.ai_conversations (user_id, created_at desc);
create index if not exists idx_ai_messages_conversation on public.ai_messages (conversation_id, created_at);

create index if not exists idx_audit_actor on public.audit_logs (actor_id, created_at desc);
create index if not exists idx_audit_resource on public.audit_logs (resource_type, resource_id);
