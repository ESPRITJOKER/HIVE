# HIVE — Database

HIVE uses Supabase (PostgreSQL) as its single source of truth. Authorization is enforced primarily in the database with Row Level Security (RLS). **All schema changes go through migrations — never manual production edits.**

---

## 1. Migrations

Located in `supabase/migrations/`, applied in filename order:

| File | Contents |
|---|---|
| `0001_initial_schema.sql` | Extensions (`pgcrypto`, `vector`), enums, 19 tables, constraints, indexes. Encrypted/row-level columns where relevant; `halfvec(384)` column for embeddings. |
| `0002_rls_policies.sql` | Enables RLS on every sensitive table and defines role/class-scoped policies plus security-definer helper functions used by policies. |
| `0003_triggers_and_functions.sql` | New-user bootstrap, role-self-change guard, append-only audit log, `updated_at` maintenance, `join_class`, `increment_ai_usage`, `archive_expired_opportunities`. |
| `0004_role_grants.sql` | Table/sequence/function privileges for `anon` and `authenticated` plus default privileges for future tables. RLS remains the authorization boundary; all 40 policies target `authenticated` only. |
| `0005_phase2_support.sql` | Phase 2 support: `saved_resources` table with per-user SELECT/INSERT/DELETE RLS (insert additionally requires access to the document's class), plus `messages` added to the `supabase_realtime` publication. |
| `0006_phase3_support.sql` | Phase 3 support: admin-only `platform_settings` + `platform_setting(text)` definer RPC, private `documents` bucket with class-scoped storage policies, `guard_document_status()`, audit triggers for courses/channels/class_members/platform_settings, and revocation of anon access to `archive_expired_opportunities()`. |
| `0007_revoke_public_function_execute.sql` | Corrective migration: removes the default `PUBLIC` EXECUTE grant on `archive_expired_opportunities()` as well as the `anon` grant, closing an inheritance path left by `0006`. |

`supabase/seed.sql` contains non-secret seed data for local/scratch environments. `supabase/config.toml` holds local Supabase CLI settings.

### Applying migrations

```bash
# Option A — Supabase CLI against a local stack
supabase start
supabase db reset          # applies all migrations + seed.sql

# Option B — against a hosted project
supabase db push           # requires a linked project (supabase link)

# Option C — paste each migration into the Supabase SQL editor, in order
```

The migrations are written to be re-runnable on a fresh scratch database (enum creation is guarded with `do $$ ... exception when duplicate_object`). Verify in the Supabase dashboard that RLS is enabled on every table in `public` after applying.

---

## 2. Entity model (21 tables)

Grouped by concern:

- **Identity & organisation:** `users` (1:1 with `auth.users`, role field), `classes`, `class_members` (membership status), `representative_assignments` (rep ↔ class).
- **Academic content:** `courses`, `documents` (processing status), `document_chunks` (with `halfvec(384)` embedding + content hash), `generated_content` (summaries/quizzes/revision sheets).
- **Schedule & tasks:** `timetable_slots`, `tasks_events` (assignments, exams, opportunities), `user_task_state` (per-student completion).
- **Community:** `channels`, `messages`, `push_subscriptions`, `notifications`, `saved_resources` (per-student document bookmarks, added in Phase 2).
- **AI:** `ai_usage` (daily quota counter), `ai_conversations`, `ai_messages`.
- **Governance:** `audit_logs` (append-only), `platform_settings` (administrator-only JSON settings, added in Phase 3).

All primary keys are UUIDs. Foreign keys, uniqueness, and check constraints are declared in `0001_initial_schema.sql`.

---

## 3. Row Level Security

- RLS is enabled on every sensitive table; there is no "RLS later" table.
- Reads/writes are scoped by `class_members` and `representative_assignments`, so:
  - Students see only their own class's courses, documents, timetable, assignments, opportunities, discussions, and their own AI/tasks/messages.
  - Representatives are constrained to their assigned classes.
  - Administrators have platform-wide supervision but private student AI conversations remain protected.
- Security-definer helper functions are used where policies need to resolve role/class membership without recursive RLS.
- The service-role key bypasses RLS and is reserved for trusted background jobs (e.g. `archive_expired_opportunities`).

**Testing requirement:** RLS must be exercised with real authenticated student/rep/admin accounts across at least two classes (cross-class reads/writes denied). This is deferred until credentials are available (decision A2) and is part of the Phase 6 exit gate.

---

## 4. Database functions & triggers

| Function | Purpose |
|---|---|
| `handle_new_user()` | Bootstrap a `public.users` row when an auth user is created. |
| `prevent_role_self_change()` | Blocks clients from changing their own `role`. |
| `write_audit_log()` / `prevent_audit_mutation()` | Append-only audit trail for sensitive operations. |
| `touch_updated_at()` | Maintains `updated_at` columns. |
| `join_class(p_code)` | Secure class-join by code with membership status handling. |
| `increment_ai_usage(p_limit)` | Atomic daily quota check/increment with a hard cap. |
| `archive_expired_opportunities()` | Moves past opportunities out of the active board. |
| `platform_setting(p_key)` | Definer getter for one settings value; readable by any authenticated user so the upload cap can be enforced without exposing the admin-only table. |
| `storage_object_class_id(p_path)` | Extracts the owning class id from the first segment of a document storage path. |
| `can_access_storage_path(p_path)` / `can_manage_storage_path(p_path)` | Map storage RLS to the same class boundaries as table policies. |
| `course_class_id(id)` / `message_class_id(id)` | Resolve a course/message to its class for scope rechecks. |
| `guard_document_status()` | Prevents clients from marking documents `extracting`/`chunking`/`embedding`/`indexed`; only the ingestion pipeline may advance status. |

Typed RPC signatures for these functions live in `src/lib/supabase/database.types.ts`. **Keep that hand-authored contract in sync when migrations change** (a generated-types step is planned for a later phase).

### Phase 3 storage contract
Private bucket `documents` (25 MB hard cap, allow-listed MIME types). Object paths are
`<class_id>/<course_id>/<document_id>/<file_name>`. Storage RLS permits representatives/admins to
write only inside classes they manage and students to read only their own classes. Document rows
and objects are written together; a failed row insert removes the uploaded object.

---

## 5. Embedding dimension contract

Decision A3: embeddings default to **384** dimensions using a local multilingual-e5-small model. `EMBEDDING_DIMENSION` and `EMBEDDING_PROVIDER` are validated config; the actual model output dimension is validated at ingestion. The schema uses `halfvec(384)` accordingly. **Never assume 768** and never silently change the dimension without a migration and re-index.

---

## 6. Live project status (Phase 3)

- Migrations `0001`–`0007` have been applied to the live Supabase project `hsdaclpcjpdmgrqmpspn` (region `eu-west-1`) via the transaction pooler. Live verification confirmed `platform_settings` with RLS, the definer getter granted only to `authenticated`, the private `documents` bucket with all four scoped storage policies, the document-status guard, all four audit triggers, and no `PUBLIC`/`anon` EXECUTE on `archive_expired_opportunities()`.
- `seed.sql` was **not** applied — it is explicitly marked development-only and must never run against a live project.
- REST check with the publishable key returns `200 []` for `public.users`: tables are reachable and anonymous reads return no rows because RLS policies are scoped to `authenticated`.
- Phase 2 live read-path check: a temporary class-less student account was authenticated and all class-scoped reads (`courses`, `documents`, `saved_resources`, `notifications`, `user_task_state`, `channels`, `tasks_events`, `timetable_slots`, `messages`) returned `200 []`. The account was deleted afterwards. This confirms the new `saved_resources` policy works and no cross-class rows leak to a student with no memberships.
- **Network note:** this project's DB host resolves to IPv6 only. Where IPv6 is unavailable, use the transaction pooler instead:
  `postgresql://postgres.<ref>:<password>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`
- Outstanding acceptance item: multi-role RLS matrix with seeded academic data across two classes and real student/rep/admin accounts (Phase 6).
