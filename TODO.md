# HIVE — TODO TRACKER

**Legend:** ✅ Completed · 🔄 In progress · ⛔ Blocked · 🐛 Known bug · 📌 Technical debt

_Last updated: 2026-11-20 (Phase 3 implemented; migrations `0006`–`0007` applied live and verified; pending smoke test + owner gate)_

---

## Phase 0 — Project audit ✅ COMPLETE
- ✅ Inspect entire repository (5 files found; no codebase; no Git)
- ✅ Read design README; note PNGs unviewable by this model (direction taken from text)
- ✅ Note attached PDF unreadable by this model (spec text used instead)
- ✅ Check env vars (names only) — none present
- ✅ Check toolchain — Node 22.23.4 / npm 10.9.9 available
- ✅ Produce `PROJECT_AUDIT.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `SECURITY_REVIEW.md`, `TODO.md`

## ✅ Owner decisions confirmed (2026-11-19)
- ✅ **A1** — Greenfield scaffold at workspace root `HIVE/`; `HIVE_design_phase_1/` preserved unchanged.
- ✅ **A2** — Build credential-independent layers first (schema, RLS, typed clients, UI, integration seams). No mock data; live auth/DB wiring deferred until keys supplied.
- ✅ **A3** — Embedding dimension: validated config, default **384** (local multilingual-e5-small); model output validated at ingestion.
- ✅ **A4** — Phase-gated execution with owner review between phases.

## Phase 1 — Foundation ✅ IMPLEMENTED (awaiting owner gate)
- ✅ 1.1 Record owner confirmations
- ✅ 1.2 Scaffold Next.js 16 + TS 5.9 + Tailwind 4 + ESLint 10 + Prettier (compatible stable versions); conventions/configs in place
- ✅ 1.3 Git init + `.gitignore` + conventions; baseline commit `abbc77a` (108 files, secret scan clean)
- ✅ 1.4 Design tokens, dark/light theme, Manrope/Inter fonts, global styles
- ✅ 1.5 Shared UI kit (button, input, card, dialog, dropdown, select, tabs, badge, states, pagination, toaster, skeletons, spinners, form fields)
- ✅ 1.6 Supabase clients + validated env + `.env.example` (names only); privileged keys server-only; explicit "not configured" state
- ✅ 1.7 Auth screens + flows (splash, onboarding, login, register, Google button, forgot/reset password, verify, class join, pending) wired to real Supabase calls
- ✅ 1.8 Route guards + role-based navigation (`src/proxy.ts`, role-scoped dashboards, disabled "Soon" roadmap items)
- ✅ 1.9 SQL migrations: 19 entities, constraints, indexes, `halfvec(384)` pgvector column
- ✅ 1.10 Initial RLS policies + role/permission tables + append-only audit trigger + helper functions
- ✅ 1.11 Core docs: `README.md`, `ENVIRONMENT.md`, `DATABASE.md`, `SECURITY.md`, `TESTING.md`; `SECURITY_REVIEW.md` status updated
- ✅ 1.12 Test harness (Vitest + Playwright config + sample RBAC/validation/security/component/public-page tests)
- **Verification:** `npx tsc --noEmit`, `npx eslint .`, `npm run build` clean; `npm test` 4 files / 16 tests passing; `npm run test:e2e` 4 tests passing on both `chromium` and `mobile` (8 runs), configured and unconfigured
- **Live DB:** ✅ Supabase project `hsdaclpcjpdmgrqmpspn` linked via pooler (`eu-west-1`); migrations `0001`–`0004` applied; seed intentionally not applied (dev-only); REST verified `200 []` with RLS
- **Admin account:** ✅ `admin@hive.app` created with `administrator` role; password generated locally and delivered to owner only (never stored in repo/env/docs); direct Auth API login + authenticated RLS read + full browser UI login → `/admin/dashboard` all verified
- **Exit gate:** build passes ✅; auth/RBAC unit + E2E verified ✅; single-role live RLS verified ✅; cross-class multi-role RLS matrix ⛔ (student/rep test accounts not requested); owner review ✅ (owner approved continuation 2026-11-20)

## Phase 2 — Core academic platform ✅ IMPLEMENTED (awaiting owner gate)
- ✅ 2.1 Server-only scoping helpers (`viewerClassIds`, `getScopedCourseIds`, `canAccessCourse`) + shared DTO format helpers
- ✅ 2.2 Courses: directory + detail (documents & weekly schedule), search/filter client UI
- ✅ 2.3 Documents: library + detail viewer with short-lived signed URLs, status badges, bookmarks
- ✅ 2.4 Timetable: weekly slots grouped by day, coloured per subject
- ✅ 2.5 Assignments/exams + personal task tracker: server-rendered lists, private per-student completion via Server Actions
- ✅ 2.6 Opportunities board: category/course filters, archived/expired items hidden automatically
- ✅ 2.7 Discussions: class channels, realtime `postgres_changes` subscription with reconnect + graceful offline, author derived from session
- ✅ 2.8 Notifications (read/unread, mark-all), saved resources, profile/settings (display name only)
- ✅ 2.9 Student dashboard replaced with real aggregated data (courses, deadlines, documents, opportunities, unread count) — no placeholder copy
- ✅ 2.10 `0005_phase2_support.sql`: `saved_resources` RLS + realtime publication for `messages`; applied to live DB
- ✅ 2.11 Every mutation re-authenticates (`requireRole`), validates (Zod), re-checks class scope, and revalidates paths
- ✅ 2.12 Navigation enables only implemented student routes; AI/revision/quizzes stay disabled "Soon"
- **Verification:** `npx tsc --noEmit` ✅; `npx eslint .` ✅; `npm test` 16 → **32 tests** (new pure-helper + Zod suites) ✅; `npm run test:e2e` 8 → **30 runs** (new protected-route suite) ✅; `npm run build` clean, all 13 student routes compiled ✅
- **Live smoke:** temporary student account provisioned and removed; all 11 student pages rendered after real login; all RLS-scoped REST reads returned `200 []` for the class-less student, including the new `saved_resources` policy (no cross-class leakage)
- **Exit gate:** build ✅; unit/E2E ✅; live read-path RLS ✅; cross-class multi-role RLS matrix ⛔ (needs two classes + student/rep/admin accounts); owner review ⏳

## Phase 3 — Representative & administration 🔄 IMPLEMENTED, migration applied, pending smoke test + owner gate
- ✅ 3.1 Representative dashboard + assigned-class and student overview (`/representative/dashboard`, `/representative/class`)
- ✅ 3.2 Document management: private storage upload with server-side magic-byte/type/size checks, external HTTPS references, real processing status from `documents`, delete removes both DB row and stored object
- ✅ 3.3 Course-scoped timetable and assignment/opportunity CRUD; all writes recheck class scope on the server
- ✅ 3.4 Discussion moderation (hide/show/index) using real `messages` rows and `message_class_id()` scope recheck
- ✅ 3.5 Real class activity dashboard from `documents`, `messages`, `tasks_events`, `class_members` (no fabricated metrics); shared AI generation remains Phase 4
- ✅ 3.6 Admin users, classes, membership decisions, representative assignments and role changes with self-change/last-admin guards
- ✅ 3.7 Admin dashboard aggregates, AI usage monitoring, append-only audit log viewer, DB-backed system setting (`max_upload_mb`) with real runtime effect on uploads
- ✅ 3.8 Tests: privilege-escalation + cross-class authorization unit suite, Phase 3 Zod suite, E2E protected-route coverage for all new staff routes
- ✅ `0006_phase3_support.sql`: admin-only `platform_settings` + definer getter, private `documents` bucket and class-scoped storage policies, document-status guard (clients cannot mark indexed), audit triggers for courses/channels/class_members, revoke anon access to `archive_expired_opportunities()`
- ✅ `0007_revoke_public_function_execute.sql`: corrective migration removing the default `PUBLIC` EXECUTE grant that let `anon` still call `archive_expired_opportunities()`; live grants now limited to `postgres`/`authenticated`
- ✅ Navigation: only implemented Phase 3 routes enabled; HIVE AI / revision / quizzes remain disabled "Soon"
- **Verification:** `npm run typecheck` ✅; `npm run lint` ✅ (0 errors, 0 warnings); `npm test` 32 → **47 tests** ✅; `npm run test:e2e` 30 → **56 runs** ✅; `npm run build` ✅ (all new staff routes compiled)
- **Live DB:** `0006` + `0007` applied via the transaction pooler; verified table/RLS/RPC/bucket/policies/triggers and revocation. No seed data applied.
- **Live smoke test ✅:** throwaway admin and representative accounts (created by GoTrue signup, promoted via SQL, deleted afterwards) rendered every Phase 3 admin/rep route with 200 and real content; cross-role access redirected to the correct home path; RLS returned empty scoped rows for non-owners and the definer settings RPC stayed callable without exposing the table. No credentials were stored.
- **Pending:** owner review before push/deploy
- **Exit gate:** role separation and scope guards unit-tested ✅; sensitive writes audited ✅; cross-class multi-role RLS matrix with seeded data ⛔ (Phase 6); owner review ⏳

## Phases 4–7 ⬜ NOT STARTED
- ⬜ Phase 4 — HIVE AI (RAG, citations, quotas, fallback)
- ⬜ Phase 5 — PWA & offline
- ⬜ Phase 6 — Security & optimisation (full test matrix)
- ⬜ Phase 7 — Final delivery (9 docs, guides, deployment)

## 🐛 Known bugs
- None currently observed. (The initial `DiscussionRoom` `isOwn` expression bug was fixed before compilation.)

## 📌 Technical debt / risks
- **TD-001** — CSP uses `'unsafe-inline'`; replace with nonce-based CSP before final delivery (Phase 6).
- PNG concept boards could not be visually inspected by this model; textual README used as design source of truth.
- Attached specification PDF could not be read; pasted spec text used as source of truth.
- Supabase URL + publishable key are configured locally and on Vercel; no service-role secret, AI provider keys, or VAPID keys have been supplied — administration cannot invite/create Auth users (role updates work), and PWA/AI features remain deferred. Admin user provisioning still requires a one-off Auth-admin operation.
- `src/lib/supabase/database.types.ts` is hand-authored (now includes `saved_resources`, `tasks_events.archived_at`, `platform_settings` and the new RPC signatures); generate types from the live schema in a later phase to avoid drift.
- Storage monitoring and AI-provider settings are intentionally **not** exposed: there is no storage-size column and no configured provider, so those controls would be decorative.
- Cross-class multi-role RLS matrix and per-student task-isolation write tests still require seeded academic data and representative/student accounts (Phase 6).
- E2E suite requires `npx playwright install chromium` once per machine (installed and verified here).

## Preservation note
Do **not** modify or delete: `HIVE_design_phase_1/01-brand-and-authentication.png`,
`02-platform-screen-overview.png`, `HIVE Academic Platform Showcase-2.png`,
`HIVE Futuristic Learning App Showcase-1.png`, `README.txt`.
