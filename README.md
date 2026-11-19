# HIVE — Learn Together. Grow Smarter.

HIVE is a secure, zero-cost collaborative academic platform with a grounded AI study assistant, delivered as an installable Progressive Web App. It is being built phase-by-phase with review gates between phases. This repository currently contains **Phase 1 (Foundation)**; feature phases 2–7 are planned but not yet implemented.

> **Version:** 0.1.0 · **Status:** Phase 1 in progress · **Node:** ≥ 20.9 (developed on Node 22)

---

## 1. What is implemented today

| Layer | Status | Notes |
|---|---|---|
| Next.js 16 App Router + TypeScript + Tailwind 4 | ✅ | Stable pinned versions; `npm run build` passes |
| Design tokens, dark/light theme, fonts | ✅ | Manrope + Inter via `next/font`; accessible toggle |
| Shared UI kit | ✅ | Button, input, card, dialog, dropdown, select, tabs, badge, states, pagination, toaster, skeletons, spinners, form fields |
| Supabase typed clients (browser / server / admin) | ✅ | Explicit "not configured" state — **no mock backend** |
| Auth screens & flows | ✅ | Splash, onboarding, login, register, Google button, forgot/reset password, verify, join class, pending |
| Route protection & RBAC | ✅ | `src/proxy.ts` refreshes sessions and enforces per-role areas; client permission helpers |
| SQL schema (19 tables), RLS, triggers/functions | ✅ | Written and reviewed; **not yet applied to a live Supabase project** |
| Role dashboards | ✅ | Render scoped data via real queries when configured; explicit empty/config states otherwise |
| Test harness | ✅ | Vitest (16 unit/component tests passing) + Playwright config and public-page E2E specs |
| PWA / offline / push / AI | ⛔ | Planned for phases 4–5; not implemented |

**Important:** Without Supabase credentials the app does **not** invent data. Auth and dashboards show an honest "backend not configured" state. Live integration is deferred until an owner supplies keys (decision A2).

---

## 2. Quick start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure a backend — see ENVIRONMENT.md
cp .env.example .env.local
# edit .env.local with your own Supabase project values

# 3. Run the development server
npm run dev            # http://localhost:3000

# 4. Quality gates
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm test               # Vitest unit + component tests
npm run build          # production build
npm run test:e2e       # Playwright (requires npx playwright install chromium)
```

If no `.env.local` exists, the public pages still render, and protected routes redirect to `/login?reason=not_configured`.

---

## 3. Repository layout

```
src/
  app/                     App Router pages (public, auth, student, representative, admin)
  components/
    ui/                    Reusable, typed, accessible UI primitives
    layout/                App shell, sidebar, bottom nav, user menu, navigation model
    providers/             TanStack Query provider
    theme/                 Theme provider + toggle
  features/
    authentication/        Auth shells, config notice, password input, auth service
    dashboard/             Metric grid + scoped overview service
  lib/
    api/                   Consistent API response helpers
    permissions/           Role definitions, permission matrix, guards
    supabase/              Typed clients + hand-authored Database contract
    validations/           Zod schemas (auth, common)
    constants.ts           Product constants (quotas, upload rules, refusal text)
    env.ts / env.server.ts Client-safe vs server-only environment access
  styles/tokens.css        Design tokens
  types/                   Domain and shared types
  proxy.ts                 Next.js 16 Proxy: session refresh + route protection
supabase/
  migrations/              0001 schema · 0002 RLS · 0003 triggers/functions
  seed.sql                 Non-secret seed data
  config.toml              Local Supabase config
tests/
  unit/                    Pure logic tests (RBAC, validation, constants)
  components/              React Testing Library component tests
  e2e/                     Playwright public-page specs
HIVE_design_phase_1/       Original design assets — preserved unchanged
```

Documentation: `PROJECT_AUDIT.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `SECURITY_REVIEW.md`, `SECURITY.md`, `ENVIRONMENT.md`, `DATABASE.md`, `TESTING.md`, `TODO.md`.

---

## 4. Guiding constraints (non-negotiable)

1. **Zero cost only** — no paid models, hosting, subscriptions, or upgrade prompts. On quota exhaustion the app degrades gracefully; it never switches to a paid fallback.
2. **Grounded AI only** — answers must cite real class materials; insufficient context returns a fixed refusal (see `INSUFFICIENT_CONTEXT_MESSAGE`). No fabricated citations.
3. **Server-enforced authorization** — roles and permissions are resolved from the database and enforced by RLS and server code. The client is UX only, never a security boundary.
4. **Strict role separation** — Student / Representative / Administrator have distinct powers; no self-escalation.
5. **No mock data as a backend substitute** — missing configuration is shown explicitly.
6. **No decorative buttons** — roadmap items are visibly disabled with a "Soon" label rather than fake interactions.
7. **Migrations only** — no manual production schema edits.

---

## 5. Decisions & phase gates

- **A1** Greenfield app at the workspace root; design assets preserved.
- **A2** Credential-independent layers first; live Supabase integration when keys are supplied.
- **A3** Embedding dimension is validated config, default **384** (local multilingual-e5-small); never assume 768.
- **A4** Phase-gated execution with owner review between phases.

See `IMPLEMENTATION_PLAN.md` for the full phase plan and exit criteria. **Phase 2 begins only after owner approval of Phase 1.**

---

## 6. Configuration & deployment

See `ENVIRONMENT.md` for every variable and `DATABASE.md` for migration/apply instructions. Never commit `.env.local`. `.env.example` contains names only.

## 7. Testing & security

See `TESTING.md` for how to run and extend the suites, and `SECURITY.md` / `SECURITY_REVIEW.md` for the threat model and the current control status.
