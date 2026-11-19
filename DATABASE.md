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

## 2. Entity model (19 tables)

Grouped by concern:

- **Identity & organisation:** `users` (1:1 with `auth.users`, role field), `classes`, `class_members` (membership status), `representative_assignments` (rep ↔ class).
- **Academic content:** `courses`, `documents` (processing status), `document_chunks` (with `halfvec(384)` embedding + content hash), `generated_content` (summaries/quizzes/revision sheets).
- **Schedule & tasks:** `timetable_slots`, `tasks_events` (assignments, exams, opportunities), `user_task_state` (per-student completion).
- **Community:** `channels`, `messages`, `push_subscriptions`, `notifications`.
- **AI:** `ai_usage` (daily quota counter), `ai_conversations`, `ai_messages`.
- **Governance:** `audit_logs` (append-only).

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

Typed RPC signatures for these functions live in `src/lib/supabase/database.types.ts`. **Keep that hand-authored contract in sync when migrations change** (a generated-types step is planned for a later phase).

---

## 5. Embedding dimension contract

Decision A3: embeddings default to **384** dimensions using a local multilingual-e5-small model. `EMBEDDING_DIMENSION` and `EMBEDDING_PROVIDER` are validated config; the actual model output dimension is validated at ingestion. The schema uses `halfvec(384)` accordingly. **Never assume 768** and never silently change the dimension without a migration and re-index.

---

## 6. Current state (Phase 1)

- Migrations and seed are written and statically reviewed.
- They have **not** been applied to a live Supabase project in this workspace (no credentials supplied).
- Passing `npm run build` does not validate SQL; applying migrations to a scratch DB and running multi-role RLS tests are outstanding acceptance items.
