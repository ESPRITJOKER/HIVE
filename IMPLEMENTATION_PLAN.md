# HIVE — IMPLEMENTATION PLAN

**Version:** 0.1 (Phase 0)
**Status:** Proposed. Execution is phase-gated: each phase is implemented → tested → inspected → reported before the next begins. Critical defects block progression.

---

## Guiding rules (from the specification)

- Inspect before modifying; never invent existing files/routes/tables.
- Preserve the 5 existing design-asset files unchanged.
- No mock data as a substitute for real backend integration.
- Never bypass RLS; never expose secrets; never fabricate citations; never introduce paid services.
- No decorative buttons — every screen has realistic functionality.
- Maintain `TODO.md` continuously.

---

## Phase 0 — Project audit ✅ COMPLETE

Deliverables produced:
- `PROJECT_AUDIT.md` — full 12-point audit.
- `ARCHITECTURE.md` — target architecture and decisions.
- `IMPLEMENTATION_PLAN.md` — this plan.
- `SECURITY_REVIEW.md` — threat model and controls.
- `TODO.md` — living tracker.

Outcome: greenfield project confirmed; three decisions raised for owner confirmation (app root, credentials strategy, embedding dimension).

---

## Phase 1 — Foundation (NEXT — blocking)

**Objective:** Establish a secure, typed, testable backbone and the design system.

| # | Task | Depends on | Acceptance criteria |
|---|---|---|---|
| 1.1 | Confirm open decisions A1–A5 with owner | — | Written confirmations recorded in `TODO.md` |
| 1.2 | Initialise Git repo + ignore rules + commit conventions | 1.1 | `git status` clean baseline; secrets ignored |
| 1.3 | Scaffold Next.js + TS + Tailwind + ESLint/Prettier with compatible stable versions | 1.2 | `npm run build` passes; zero TS errors |
| 1.4 | Design tokens, dark/light theme provider, fonts, global styles | 1.3 | Tokens match palette; theme toggle works; a11y contrast checked |
| 1.5 | Shared UI kit (button, input, card, modal, dialog, select, badge, toast, skeleton, empty/error/success states, dropdown, table, pagination) | 1.4 | Components typed, a11y-labelled, story/tests present |
| 1.6 | Supabase clients (browser/server/middleware) + validated env access | 1.3 | No privileged key exposed to client; `.env.example` names only |
| 1.7 | Auth flows: splash, onboarding, login, register, Google OAuth, recovery, reset, verification, class join, pending approval | 1.5, 1.6 | Forms validated; server actions wired; errors handled |
| 1.8 | Route guards + role-based navigation (student/rep/admin) | 1.7 | Unauthenticated/role-mismatch redirects verified in tests |
| 1.9 | Initial SQL migrations: 19 entities, constraints, indexes, pgvector-ready column | 1.1 | Migration applies cleanly to a scratch DB; schema documented |
| 1.10 | Initial RLS policies + role/permission tables + append-only audit trigger | 1.9 | RLS tested with multiple auth roles; no cross-class reads |
| 1.11 | Core docs: README, ENVIRONMENT, DATABASE, SECURITY, TESTING | 1.3–1.10 | Docs accurate to implementation |
| 1.12 | Test harness (Vitest + Playwright config + sample auth/RLS/route tests) | 1.3 | `npm test` and `npm run test:e2e` runnable |

**Exit gate:** app builds, auth + RBAC + RLS work against a real (or owner-approved scratch) Supabase project; no critical/high defects.

---

## Phase 2 — Core academic platform

Student-facing functionality and the shared data layer.

- 2.1 Student dashboard (aggregated, role-scoped data)
- 2.2 Course directory + course details
- 2.3 Academic document library + safe document viewer
- 2.4 Timetable: daily + weekly views, subject colours, offline-ready data
- 2.5 Assignment board + details + per-student completion state
- 2.6 Personal task tracker + D-3/D-1/H-2 reminders
- 2.7 Events/OPPORTUNITIES board with filters + auto-archive
- 2.8 General + subject discussion channels (Supabase Realtime, reconnect, moderation basics)
- 2.9 Notifications (in-app) + saved resources
- 2.10 Profile + settings
- 2.11 Tests: component, route, realtime, per-student task isolation

**Exit gate:** all student screens functional against real data; data isolation verified.

---

## Phase 3 — Representative & administration

- 3.1 Representative dashboard + class/student overview
- 3.2 Document management: upload, processing status, validation pipeline
- 3.3 Course, timetable (import/review/correct/publish), assignment, announcement, opportunity management
- 3.4 Discussion moderation + AI Notebook indexing (approved messages only)
- 3.5 Summary/quiz generation triggers + class activity dashboard
- 3.6 Admin dashboard: users, students, classes, courses, representatives, roles, permissions
- 3.7 AI usage + storage monitoring, system settings, security/audit logs
- 3.8 Tests: privilege escalation, IDOR, cross-class admin boundaries

**Exit gate:** reps cannot gain admin rights; students cannot reach admin/rep writes; all sensitive ops audited.

---

## Phase 4 — HIVE AI

- 4.1 Provider abstraction (Gemini primary, Groq fallback, local embed option), no paid calls
- 4.2 Document extraction for PDF/DOCX/PPTX/TXT/URL/notes + page/section preservation
- 4.3 Cleaning + semantic chunking + dedupe by content hash + idempotent ingestion
- 4.4 Embedding generation with validated dimension + pgvector storage/index
- 4.5 Scoped retrieval + reranking + class isolation
- 4.6 Grounded streaming chat + real citations + conversation history
- 4.7 Subject-specific sessions, source viewer, revision sheets, summaries, quizzes (with corrections)
- 4.8 Quotas (default 20/day, admin-configurable), rate limits, queue, retry, fallback, monitoring
- 4.9 Privacy disclosure UI
- 4.10 Tests: retrieval correctness, citation accuracy, unsupported questions, cross-class isolation, dedupe, quota exhaustion, provider failure, retry

**Exit gate:** zero fabricated citations; cross-class isolation proven; no paid fallback path.

---

## Phase 5 — PWA & offline

- 5.1 Manifest + adaptive/maskable icons + install prompt
- 5.2 Service worker (Serwist) + cache-first shell + network-first timetable/assignments/sheets
- 5.3 Offline indicator + per-user cache partition + logout clearing
- 5.4 Web Push (VAPID server-side) + subscription UX + in-app fallback
- 5.5 Background sync + pg_cron/Edge/GitHub Actions scheduler
- 5.6 Tests: installability, offline routes, cache isolation, push delivery

---

## Phase 6 — Security & optimisation

- Full RLS bypass attempts, IDOR, malicious uploads, secret scan, session tests
- API validation/rate-limit tests, scheduler tests
- Lighthouse (perf/a11y/PWA), responsive matrix, error-handling review
- Fix all critical/high findings; re-test

---

## Phase 7 — Final delivery

- Complete source, migrations, RLS, seed data, `.env.example`
- 9 required docs + representative/admin user guides + diagrams
- Deployment instructions, CI, final test report

---

## Execution note

This plan is intentionally phase-gated. The owner's confirmation of decisions A1–A3 (see `PROJECT_AUDIT.md` / `ARCHITECTURE.md`) is required before large-scale scaffolding, because those choices materially change the product and the specification forbids silently changing requirements or substituting mock backends.
