# HIVE — TARGET ARCHITECTURE

**Version:** 0.1 (Phase 0 — design, not yet implemented)
**Status:** Proposed. No code exists yet; this document defines the target to build toward.
**Source of truth:** The HIVE specification supplied by the project owner + `HIVE_design_phase_1/README.txt`.

---

## 1. Architectural principles

1. **Zero-cost by construction.** Only free-tier / open-source services. No paid API, no fallback that could incur cost. Quota exhaustion degrades gracefully (queue → cache → limit → notify → retry on reset).
2. **Security at the data layer.** RLS + server-side authorization are the enforcement points; the UI only reflects permissions. Client-supplied roles are never trusted.
3. **Generate once, reuse many.** Summaries, quizzes, and embeddings are persisted and reused; identical content is never regenerated.
4. **Grounded AI only.** Answers derive from retrieved class material with real citations; insufficient context yields a fixed "not found" response.
5. **Modular, typed, documented.** Clear module boundaries; TypeScript end-to-end; Zod validation at boundaries; decisions recorded.
6. **Mobile-first, offline-capable PWA.** Installable, responsive, accessible; timetable and downloaded revision sheets available offline.

---

## 2. System context

```
                    ┌────────────────────────────────────────────┐
                    │              HIVE Client (PWA)             │
                    │  Next.js App Router · RSC + selective CSR  │
                    │  Tailwind + shadcn/ui · Manrope/Inter      │
                    │  Service Worker · IndexedDB · Web Push     │
                    └───────────────┬────────────────────────────┘
                                    │ HTTPS
                    ┌───────────────▼────────────────────────────┐
                    │        Next.js Route Handlers (BFF)        │
                    │  Zod validation · auth · authorization     │
                    │  rate limiting · audit · consistent errors │
                    └───────┬───────────────────────┬────────────┘
                            │ service-role (server)│ user-context
            ┌───────────────▼───────────┐   ┌──────▼──────────────────┐
            │   Supabase Edge Functions │   │  Supabase Platform      │
            │  · document processing    │   │  · Auth (email+Google)  │
            │  · AI retrieval/chat      │   │  · Postgres + pgvector  │
            │  · summary/quiz gen       │   │  · Storage              │
            │  · notification scheduler │   │  · Realtime             │
            └───────┬───────────────────┘   └──────┬──────────────────┘
                    │                              │
        ┌───────────▼───────────┐        ┌──────────▼──────────┐
        │  AI Provider Adapter  │        │  Free-tier LLM/emb  │
        │  Gemini (primary)     │◄──────►│  Groq (fallback)    │
        │  local e5-small option│        │  no paid calls      │
        └───────────────────────┘        └─────────────────────┘
```

---

## 3. Frontend architecture

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Lucide · React Hook Form · Zod · TanStack Query · Recharts · Serwist (PWA).

```
src/
├── app/
│   ├── (auth)/            splash, onboarding, login, register, oauth callback,
│   │                      forgot-password, reset-password, verify, join-class, pending
│   ├── (student)/         dashboard, courses, documents, timetable, assignments,
│   │                      tasks, opportunities, discussions, ai, revision, quizzes,
│   │                      notifications, saved, profile, settings, offline
│   ├── (representative)/  dashboard, class, students, documents, courses,
│   │                      timetable, assignments, announcements, opportunities,
│   │                      moderation, notebook, generation, activity
│   ├── (admin)/           dashboard, users, students, classes, courses,
│   │                      representatives, roles, permissions, ai-monitoring,
│   │                      storage, settings, audit
│   └── api/               typed route handlers (BFF)
├── components/
│   ├── ui/                reusable primitives (no business logic)
│   ├── shared/            cards, modals, toasts, states, filters, pagination
│   ├── layout/            sidebar, topbar, mobile/bottom nav, app shell
│   ├── forms/             form field wrappers (RHF + Zod)
│   └── dashboard/         dashboard-specific composed widgets
├── features/              feature modules (co-located components/hooks/services)
├── hooks/                 shared React hooks
├── lib/
│   ├── supabase/          browser, server, middleware clients
│   ├── validations/       Zod schemas shared client/server
│   ├── permissions/       role → permission matrix, server checks
│   ├── utilities/         pure helpers
│   └── env.ts             validated environment access (no secret leakage)
├── services/              typed API clients + business services
├── types/                 shared domain types
└── styles/                design tokens, theme, global styles
```

**Rendering policy:** Server Components by default for data fetching and static UI; Client Components only where interaction is required (forms, realtime chat, AI streaming, modals, theme toggle, PWA install prompt).

**State policy:** TanStack Query for server state (cache, pagination, invalidation); React state for ephemeral UI; no global store unless a real cross-cutting need is proven.

---

## 4. Design system

- Dark glassmorphism + light theme, driven by CSS custom properties so theme switching never recompiles Tailwind.
- Tokens (from `README.txt`): primary `#7028F5`, secondary `#A855F7`, accent `#F5B942`, background `#080817`, surface `#17162B`, border `#373052`, text `#FFFFFF`, muted `#A6A1BC`, success `#22C58B`, danger `#F16B78`.
- Typography: Manrope (headings), Inter (body), loaded via `next/font`.
- Motion: short, restrained transitions; blur used sparingly for performance on low-end mobile.
- Accessibility: WCAG AA contrast, keyboard-navigable controls, focus-visible rings, reduced-motion support, semantic landmarks, labelled forms.

---

## 5. Backend architecture

**Supabase** is the primary backend: Postgres (pgvector), Auth, Storage, Realtime, Edge Functions, plus Next.js route handlers as a backend-for-frontend.

Backend services (independent, typed): authentication; user management; class management; course management; document management; document processing; AI retrieval; AI conversations; summary generation; quiz generation; timetable management; timetable parsing; assignments; opportunities; discussions; notifications; user activity; AI quota management; audit logging.

**Endpoint contract:** every endpoint implements input validation (Zod), authentication check, authorization check, consistent error shape, correct status codes, and sensitive-data-free logging. Rate limiting on sensitive and resource-intensive endpoints. Privileged operations (service-role key, admin actions, AI provider keys) never reachable from the browser.

**Business rules (enforced server-side):**
- Students read academic resources, discuss, use AI, take quizzes, track *their own* tasks; cannot create official assignments, upload official documents, or edit the timetable.
- Representatives upload/manage documents, official assignments, timetable, moderate discussions, index approved messages, generate shared summaries/quizzes — **only for assigned classes**.
- Administrators manage users, representatives, roles, classes, and supervision. Students can never reach admin functions; representatives never gain admin privileges.

---

## 6. Data architecture

- PostgreSQL with UUID primary keys, FKs with appropriate cascades, unique constraints, indexes, timestamps, and versioned migrations only (no manual production schema changes).
- All 19 required entities (see `DATABASE.md`, to be authored in Phase 1) plus supporting tables where justified (e.g., permissions, announcements, saved resources, notification records, timetable change alerts).
- **pgvector:** embeddings stored as `halfvec` with a **validated** dimension. The dimension is a config constant checked against actual model output at ingestion; 768 only if the chosen provider is confirmed to emit 768 (local `multilingual-e5-small` emits 384). Vector index (HNSW/IVFFLAT) created after dimension is fixed.
- **RLS enabled on all sensitive tables.** Policies for student/representative/admin; students isolated to enrolled classes; representatives limited to assigned classes; users cannot change their own roles; audit logs append-only.
- Transactions for multi-step writes; pagination-friendly queries; no duplicated derived data beyond intentional caches (generated content).

---

## 7. AI architecture (Phase 4 target)

```
Upload → validate (ext/MIME/magic/size) → store (or Drive ref)
       → extract text (pdf.js/unpdf, mammoth, JSZip PPTX, URL, notes)
       → preserve page/section → clean → semantic chunk (500–1000 tok, ~10% overlap)
       → embed (validated dimension) → store chunks + vectors → mark indexed
       → available to RAG   [idempotent: dedupe by content hash]

Question → resolve class/subject → scoped vector retrieval → rerank
        → context-limited grounded prompt → stream answer → attach real citations
        → persist conversation   [class_id/course_id filter at DB + query level]
```

- **Provider abstraction:** `AIProvider` interface (embed, generate, generateStream, multimodalParse). Gemini Flash primary; Groq free-tier fallback; local embedding option. No provider coupling in feature code.
- **Anti-hallucination:** system contract forbids unsupported facts, fabricated pages/citations; fixed fallback string: *"I cannot find sufficient information to answer this question in the academic materials currently available."* Distinguishes source facts from interpretation.
- **Reuse:** content-addressed cache for chunks/embeddings/generated summaries & quizzes.
- **Quotas:** per-student daily counter (default 20, admin-configurable), rate limits, request queue, retry with backoff, provider fallback, friendly exhaustion UI, monitoring. Never a paid fallback.
- **Privacy:** send only academic context; disclose free-provider data policies to users.

---

## 8. Timetable engine (Phase 2/4 target)

Inputs: manual entry, pasted text, CSV, Excel (browser parsing), screenshots/photos (Gemini multimodal when available, Tesseract.js offline fallback). Extract subject, day, start/end, room, lecturer, type (CM/TD/TP/Examination). **AI never publishes automatically** — parsed output goes to a representative review/correction screen; only an authorised representative publishes the official timetable. Daily/weekly views, subject colours, reminders, room-change/cancellation alerts, offline access.

---

## 9. Realtime, notifications, PWA

- **Realtime:** Supabase Realtime channels for general + subject discussions; reconnection handling; representative indexing of approved messages only (source + moderation status retained, duplicate prevention).
- **Notifications:** Web Push with VAPID (keys server-side), pg_cron/Edge Functions + GitHub Actions backup, in-app fallback; D-3/D-1/H-2 assignment reminders; urgent timetable alerts.
- **PWA:** manifest + adaptive/maskable icons; service worker (Serwist or maintained equivalent); cache-first for shell/assets/fonts/icons; network-first-with-cache for timetable/assignments/downloaded sheets; background sync; offline indicator; no caching of admin/private data; per-user cache partition cleared on logout.

---

## 10. Security architecture

See `SECURITY_REVIEW.md`. Summary: Supabase Auth (email + Google), DB-enforced RBAC, RLS isolation, Zod validation, parameterised queries, security headers, rate limiting, file validation (extension + MIME + magic bytes + size), server-only secrets, append-only audit logs, secure PWA caching, and a full adversarial test matrix.

---

## 11. Performance strategy

RSC by default; route-level code splitting; lazy images; indexed + paginated queries; TanStack Query caching; streaming AI; generated-content reuse; `next/font`; measured with Lighthouse/Playwright after first deployable build. Targets are goals, not guarantees, and never override security/correctness.

---

## 12. Key architectural decisions (to confirm)

| ID | Decision | Recommendation | Rationale |
|---|---|---|---|
| A1 | App root | Workspace root `HIVE/`, preserve `HIVE_design_phase_1/` | Greenfield; keeps design assets as reference |
| A2 | Credentials | Build credential-independent layers first if keys unavailable | Spec forbids mock backend; real integration needs real project |
| A3 | Embedding dimension | Config-validated; 768 only if provider confirmed, else 384 (e5-small) | Spec explicitly warns not to assume 768 |
| A4 | PWA library | Serwist (maintained) | Spec-approved, actively maintained |
| A5 | Git | Initialise repo in Phase 1 | No VCS currently; needed for review/rollback |
