# HIVE — PHASE 0 PROJECT AUDIT

**Date:** 2026-11-19
**Auditor:** Senior Implementation Engineer (acting engineering team)
**Scope:** Full repository inspection prior to any code generation
**Status:** COMPLETE

---

## 0. How this audit was performed

| Step | Action | Result |
|---|---|---|
| 1 | Listed workspace root `/home/thementalist/Desktop/HIVE` | One entry: `HIVE_design_phase_1/` |
| 2 | `find . -type f` (all files, incl. hidden) | Exactly 5 files total |
| 3 | Checked for `package.json`, `*.ts/tsx/js/jsx`, config, SQL, migrations | **None found** |
| 4 | Checked Git status / history | **Not a Git repository** |
| 5 | Read `HIVE_design_phase_1/README.txt` | Design direction + product constraints documented |
| 6 | Attempted to read the 4 PNG concept boards | **Blocked: this model cannot consume image input.** Design direction was therefore taken from the textual `README.txt`, which matches the supplied specification exactly. |
| 7 | Checked environment variables (names only, values redacted) | No Supabase / Gemini / Groq / VAPID / database variables present |
| 8 | Checked local toolchain | Node v22.23.4, npm 10.9.9, npx 10.9.9, git 2.43.0 available |

> **Limitation stated for the record:** The attached specification PDF
> (`~/Downloads/Specification Collaborative Class Platform & AI Study Assistant (Zero-Cost Editi.pdf`)
> could not be opened by this model (no PDF input support). The full specification pasted into the
> request was used as the authoritative source. The 4 design PNGs could not be visually inspected;
> the textual README was used instead. If either source contains material not reproduced in the
> request, it must be supplied as text before those details can be implemented.

---

## 1. Existing project architecture

There is **no software architecture** to audit. The workspace is a greenfield design hand-off:

```
/home/thementalist/Desktop/HIVE/
└── HIVE_design_phase_1/
    ├── 01-brand-and-authentication.png   (1536×1024, 1.7 MB)
    ├── 02-platform-screen-overview.png   (1536×1024, 1.8 MB)
    ├── HIVE Academic Platform Showcase-2.png (1536×1024, 1.8 MB)
    ├── HIVE Futuristic Learning App Showcase-1.png (1536×1024, 1.7 MB)
    └── README.txt                        (design direction + constraints)
```

- No framework, no build system, no dependency manifest, no entry point.
- No `src/`, `app/`, `pages/`, `components/`, `lib/`, `services/`, `types/`, `styles/`.
- No version control. No CI/CD. No environment templates.
- The `README.txt` explicitly describes these PNGs as **"concept boards, not final editable Figma files or production vector assets"** and states the next sequence: finalise logo → high-fidelity screens → implement in React/Next.js → connect to Supabase after screen flows are validated.

**Conclusion:** HIVE is a **greenfield project with a completed visual-direction phase**, not an existing application to preserve or refactor.

---

## 2. Current implementation status

| Layer | Status | Evidence |
|---|---|---|
| Visual design direction | ✅ Defined | `README.txt`: palette, typography, glass/layered style, product constraints |
| Brand concept boards | ✅ Produced (PNG only) | 4 image files |
| Logo as scalable vector / app icon | ❌ Missing | README lists as next step |
| Frontend application | ❌ 0% | No code |
| Backend / API | ❌ 0% | No code |
| Database schema & migrations | ❌ 0% | No SQL |
| RLS policies | ❌ 0% | No SQL |
| AI / RAG pipeline | ❌ 0% | No code |
| PWA (manifest, SW, push) | ❌ 0% | No code |
| Authentication & RBAC | ❌ 0% | No code |
| Tests | ❌ 0% | No test files |
| Documentation (9 required docs) | ❌ 0% | Only the design README exists |
| Deployment / environment | ❌ 0% | No `.env.example`, no config |

Overall software implementation: **0%**. Design direction: **phase 1 complete**.

---

## 3. Missing modules

Every module in the specification is missing. Grouped by spec section:

**Frontend (§5):** all auth screens (splash, onboarding, login, register, Google OAuth, recovery, reset, email verification, class joining, pending approval); all 26 student screens; all 20 representative screens; all 12 administrator screens; shared UI kit (cards, modals, forms, skeletons, empty/error/success states, toasts, confirmation dialogs, dropdowns, search/filter, pagination); theme system; responsive sidebar + mobile/bottom nav; route guards; role-aware navigation.

**Backend (§6):** all 19 backend services; all typed/validated endpoints with auth, authorization, error handling, rate limiting; server-side business-rule enforcement for the three roles.

**Database (§7):** all 19 required entities plus any supporting tables; UUID keys, FKs, constraints, indexes, timestamps, pgvector + `halfvec(768)`, migration versioning; **all RLS policies and RLS isolation tests**.

**AI (§8):** provider abstraction (Gemini Flash primary, Groq fallback); embeddings (Gemini or local multilingual-e5-small); document extraction (PDF/DOCX/PPTX/TXT/URL/text notes); cleaning + semantic chunking (500–1000 tokens, ~10% overlap); embedding storage; idempotent ingestion; pgvector retrieval + ranking; context-limited grounded prompting; citations; streaming; conversation persistence; summaries; quizzes; daily quotas (default 20), queues, retries, graceful degradation; usage monitoring.

**Timetable (§9):** manual/pasted/CSV/Excel parsing, screenshot OCR (Gemini multimodal) + Tesseract.js fallback, review-before-publish workflow, daily/weekly views, subject colours, reminders, room-change/cancellation alerts, offline access.

**Discussions (§10):** Supabase Realtime channels (general + subject), messages, links, attachments, code snippets with syntax highlighting, editing, moderation, representative indexing into AI Notebook with source + moderation status, duplicate prevention, reconnection.

**Assignments & opportunities (§11):** official assignments, per-student completion state, D-3/D-1/H-2 reminders, central filterable notice board, auto-archive after deadline.

**Notifications (§12):** Web Push with VAPID, subscriptions, class/assignment/timetable/announcement alerts, in-app fallback, pg_cron/Edge Function scheduling + GitHub Actions backup.

**Security (§13):** Supabase Auth (email + Google), RBAC with DB enforcement, input validation, parameterised queries, security headers, rate limiting, file validation (extension + MIME + magic bytes + size), secrets kept server-side, audit logging, RLS bypass testing.

**PWA (§14):** manifest, adaptive/maskable icons, service worker, install prompt, cache strategies, offline fallback, background sync, offline indicator, per-user cache isolation.

**Testing & docs (§16–17):** full test matrix; 9 required documents; seed scripts; user guides; diagrams.

---

## 4. Database assessment

- **No database exists.** No Supabase project is linked, no connection string, no env vars, no schema, no migrations, no seed data.
- `pgvector` availability is unknown (no project to inspect). `halfvec` support depends on the Supabase Postgres version; this must be verified against the actual project before relying on it.
- **Embedding dimension risk:** the spec says use `halfvec(768)` *where compatible* and explicitly warns not to assume the model outputs 768 dimensions. `multilingual-e5-small` produces **384**-dimensional embeddings. Gemini `text-embedding-004` outputs **768** by default but can be configured lower. **Decision required** (see audit questions): either (a) fix the schema at 768 and require a 768-dim model, or (b) make the dimension a validated config constant and choose 384 with `multilingual-e5-small`. Recommendation: **validate model output at ingestion and store the dimension in config**, with `halfvec(768)` used only if the chosen provider is confirmed to emit 768.
- All 19 required tables, their constraints, indexes, and RLS policies must be authored from scratch as versioned SQL migrations. No manual production schema changes (per spec) — migrations only.

---

## 5. Frontend assessment

- No frontend code. The only frontend artefact is design guidance in `README.txt`:
  - Dark glass / layered interface, soft blur, subtle borders, violet glow, restrained gold status accents.
  - Palette: primary `#7028F5`, secondary `#A855F7`, accent `#F5B942`, background `#080817`, surface `#17162B`, border `#373052`, text `#FFFFFF`, muted `#A6A1BC`, success `#22C58B`, danger `#F16B78`.
  - Typography: **Manrope** headings, **Inter** body.
  - Tagline: "Learn Together. Grow Smarter."
  - Constraints: no subscriptions/payments/ads/upgrade prompts; grounded AI with citations; distinct Student/Representative/Administrator permissions; mobile-first PWA with offline timetable + revision sheets; zero-cost with graceful quota degradation.
- This matches the supplied specification exactly, so the design tokens can be encoded directly into the theme without further interpretation of the (unviewable) PNGs.
- **Decision required:** target app root. Recommendation: create the Next.js application at the workspace root `/home/thementalist/Desktop/HIVE` and preserve `HIVE_design_phase_1/` as reference assets (do not delete or overwrite).

---

## 6. Backend assessment

- No backend code, no API, no server route handlers, no Edge Functions.
- No Supabase project configuration. No service-role key, no database URL, no Auth config, no Storage buckets, no Realtime setup.
- **Blocker:** a working, non-mock backend (explicitly required — "do not use mock data as a substitute for a completed backend feature") cannot be delivered without a real Supabase project and credentials. This is raised as an audit question below. Everything that does **not** require live credentials (schema/migrations, RLS SQL, typed clients that read env vars, service interfaces, validation schemas, UI) can still be built now.

---

## 7. AI architecture assessment

- No AI code and no provider abstraction. No API keys (Gemini/Groq) in the environment.
- No document pipeline, no embeddings, no vector store, no retrieval, no generation, no quota system, no caching/reuse layer.
- Key design risks to address during Phase 4:
  - **Free-tier quota exhaustion** must degrade gracefully (queue/cache/limit/notify/retry) and must **never** fall back to a paid API.
  - **Cross-class leakage** must be prevented at the database/RLS layer *and* in retrieval filters.
  - **Anti-hallucination** prompt contract with a fixed "insufficient information" response and no fabricated citations.
  - **Zero-cost embedding choice** is unresolved (768 Gemini vs 384 local e5-small) — see §4.
  - **Privacy notice** required for free-tier provider data policies; only academic context should be sent.

---

## 8. Security vulnerabilities or risks

No code exists, so there are no vulnerabilities *in code*. The following are **greenfield design risks** that must be designed out from day one:

| # | Risk | Required mitigation |
|---|---|---|
| S1 | Secrets leaked into frontend bundle | All keys server-side only; `.env.example` with names only; no `NEXT_PUBLIC_` on privileged keys; CI secret scanning |
| S2 | Broken access control / IDOR | DB-enforced RLS + server-side authorization on every endpoint; never trust client role claims |
| S3 | Privilege escalation (student → rep → admin) | Role changes only via admin service + audit log; immutable role column from client; trigger to block self-role-change |
| S4 | Cross-class data access | RLS policies scoped by `class_members`; retrieval filtered by `class_id`/`course_id` |
| S5 | Malicious document upload | Extension + MIME + magic-byte + size validation; storage bucket policies; non-executable storage; safe viewer |
| S6 | API abuse / brute force | Rate limiting on sensitive + AI endpoints; Supabase Auth abuse controls |
| S7 | XSS via messages/documents/code snippets | Safe rendering, sanitisation, no `dangerouslySetInnerHTML` on untrusted content, CSP headers |
| S8 | Audit log tampering | Append-only policies; no ordinary-user write access |
| S9 | Shared-device data exposure in PWA cache | No caching of admin/private data; per-user cache partition + clear on logout |
| S10 | Fabricated AI citations | Grounded generation only; citations derived from retrieved chunk metadata, never from the model |
| S11 | No Git / no review trail | Initialise repository, branching + commit discipline, CI checks |
| S12 | Unverified embedding dimension / pgvector support | Validate at runtime against real project before finalising schema |

---

## 9. Performance concerns

- No code to profile; all targets (FCP < 1.2 s, AI TTFT < 1.5 s, ~4 s responses, discussion < 300 ms, Lighthouse > 90) are **unmeasured targets**.
- Greenfield decisions that protect these targets:
  - App Router with React Server Components by default; client components only for interaction.
  - Route-level code splitting and lazy loading; no barrel-file bundle bloat.
  - Pagination + indexed queries; avoid N+1; select only needed columns.
  - Streaming AI responses; cache generated content (generate-once-reuse-many).
  - Self-host or next/font-optimised fonts; optimised images; restrained blur (glassmorphism is expensive on low-end mobile).
  - Measure with Lighthouse/Playwright once a deployable build exists; do not sacrifice security/correctness for targets.

---

## 10. Recommended implementation order

Follow the specification's phases, with a hard gate between them:

1. **Phase 0 — Audit (this document set)** ✅ complete.
2. **Phase 1 — Foundation** (blocking for everything else): repo init, Next.js + TS + Tailwind scaffold, design tokens/theme, shared UI kit, Supabase client config, auth flows, protected routes, RBAC navigation, SQL migrations + initial RLS, `.env.example`, core docs.
3. **Phase 2 — Core academic platform:** dashboards, courses, documents, timetable, assignments, opportunities, discussions, notifications.
4. **Phase 3 — Representative & admin:** management screens, moderation, user/role management, monitoring.
5. **Phase 4 — HIVE AI:** extraction → chunking → embeddings → pgvector → grounded RAG → citations → summaries/quizzes → quotas/fallback.
6. **Phase 5 — PWA & offline:** manifest, SW, caching, install, push, background sync.
7. **Phase 6 — Security & optimisation:** RLS/API/security tests, performance, a11y, responsive, PWA validation; fix all critical/high findings.
8. **Phase 7 — Final delivery:** docs, guides, tests, deployment instructions.

**Rule:** do not advance to the next major phase while critical defects remain in the current one.

---

## 11. Exact files that need to be created or modified

**Phase 0 (this audit):** `PROJECT_AUDIT.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `SECURITY_REVIEW.md`, `TODO.md`. *(Preserve all 5 existing files in `HIVE_design_phase_1/` untouched.)*

**Phase 1 (foundation) — to create:**
- Tooling: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`, `.env.example`, `.npmrc`
- App: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/(auth)/**`, `src/app/(student)/**`, `src/app/(representative)/**`, `src/app/(admin)/**`, `src/app/api/**`
- UI kit: `src/components/ui/**` (button, input, card, modal, select, toast, skeleton, badge, dropdown, dialog, table, pagination, empty/error states)
- Layout: `src/components/layout/**` (sidebar, topbar, mobile-nav, bottom-nav, app-shell)
- Features: `src/features/authentication/**` initially, then the remaining feature folders per §5
- Lib: `src/lib/supabase/{client,server,middleware}.ts`, `src/lib/validations/**`, `src/lib/permissions/**`, `src/lib/utilities/**`, `src/lib/env.ts`
- Types: `src/types/**`
- Hooks: `src/hooks/**`
- Styles/theme: `src/styles/tokens.css`, dark + light theme provider
- Database: `supabase/migrations/0001_initial_schema.sql`, `0002_rls_policies.sql`, `0003_indexes.sql`, `supabase/seed.sql`, `supabase/config.toml`
- Middleware: `src/middleware.ts` (session refresh + route protection)
- Tests: `tests/**` + `vitest.config.ts` / `playwright.config.ts`
- Docs: `README.md`, `DATABASE.md`, `SECURITY.md`, `AI_ARCHITECTURE.md`, `API_DOCUMENTATION.md`, `DEPLOYMENT.md`, `ENVIRONMENT.md`, `TESTING.md`, plus representative/admin user guides

**Later phases:** additional feature modules, Edge Functions (`supabase/functions/**`), PWA (`public/manifest.webmanifest`, `public/sw.js`, `public/icons/**`), AI services (`src/services/ai/**`), and corresponding tests — enumerated in `IMPLEMENTATION_PLAN.md`.

---

## 12. Estimated complexity of each phase

| Phase | Scope | Complexity | Notes |
|---|---|---|---|
| 0 — Audit | Inspect + 4 audit docs | **Low** (done) | Greenfield simplifies "preserve vs replace" decisions |
| 1 — Foundation | Scaffold, design system, auth, RBAC, base schema+RLS | **High** | 19 tables + RLS + auth is the backbone; ~1–2 focused build cycles |
| 2 — Core academic | ~26 student screens + realtime discussions + CRUD | **Very high** | Largest UI surface; depends on Phase 1 data layer |
| 3 — Rep/admin | ~32 management screens, moderation, user/role admin | **Very high** | Heavy RBAC surface; depends on Phase 1–2 |
| 4 — HIVE AI | Extraction, embeddings, RAG, quotas, fallback | **Very high** | Highest engineering risk; external free-tier dependencies |
| 5 — PWA/offline | Manifest, SW, push, caching, background sync | **Medium–high** | iOS PWA push constraints; cache isolation |
| 6 — Security/optimisation | Full test matrix, RLS tests, perf/a11y | **High** | Cross-cutting; must not be deferred into "done" claims |
| 7 — Final delivery | 9 docs, guides, CI, deployment | **Medium** | Documentation quality gate |

**Overall: a large, multi-phase programme.** It cannot be truthfully completed in a single response. Each phase will be implemented, tested, inspected, and reported before the next begins.

---

## Audit conclusion & decisions required

The premise of "inspect the existing codebase and preserve working features" **does not apply**: no codebase exists. The safest, simplest interpretation consistent with the specification is to treat HIVE as a **greenfield build** using the approved design direction, preserving the design assets folder.

Three decisions materially affect the product and are raised as blocking questions before large-scale scaffolding:
1. Confirm greenfield scaffold at the workspace root (design folder preserved).
2. Confirm availability of a Supabase project + free-tier Gemini/Groq + VAPID keys, or authorise building all credential-independent layers first with integration seams ready.
3. Confirm embedding dimension strategy (768 Gemini vs 384 local e5-small) and that phase-by-phase execution with explicit approval gates is acceptable.
