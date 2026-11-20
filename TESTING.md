# HIVE — Testing

Test strategy: fast unit/component tests with Vitest, browser-level smoke tests with Playwright, and database/RLS integration tests against a scratch Supabase project. Live Supabase credentials are configured; a read-path RLS smoke check was performed in Phase 2, with the full multi-role matrix deferred to Phase 6.

---

## 1. Commands

| Command | What it runs |
|---|---|
| `npm test` | All Vitest unit + component tests (single run) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright specs in `tests/e2e/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint over the project |
| `npm run build` | Production Next.js build |

Playwright needs a browser binary once per machine:

```bash
npx playwright install chromium
```

The Playwright config starts `npm run dev -- --hostname 127.0.0.1` automatically (and reuses an existing server locally). Projects: `chromium` (desktop) and `mobile` (Pixel 7 viewport).

---

## 2. Current suites

### Vitest (`vitest.config.mts`, environment: jsdom, setup: `tests/setup.ts`)

- `tests/unit/permissions.test.ts` — verifies the permission matrix: students/reps never receive admin permissions; students cannot upload docs, publish timetables, manage assignments, moderate discussions, or generate shared AI content; reps get class powers but not admin powers; null roles deny everything; home paths are distinct.
- `tests/unit/validations.test.ts` — Zod auth schemas (login, registration with matching passwords, password strength) and common schemas (pagination bounds/coercion, text sanitisation).
- `tests/unit/security.test.ts` — locks in the zero-cost AI quota (20/day), the exact insufficient-context refusal string, and document upload allow-lists/size limit.
- `tests/unit/phase2-format.test.ts` — reminder buckets and their exclusive edges, due labels, opportunity visibility (archived/expired), timetable day grouping and time sorting, subject colour stability, labels, and date/time formatting.
- `tests/unit/phase2-validations.test.ts` — Phase 2 mutation schemas: task completion, message emptiness/size/control-character sanitisation, notification selections, saved-resource toggles, and profile names.
- `tests/components/button.test.tsx` — accessible label, click handling, disabled state.

**Result at Phase 2 check:** 6 files, 32 tests passing.

### Playwright (`tests/e2e/`)

- `public-pages.spec.ts` — landing identity/CTAs, login form fields, protected dashboard redirect, mobile CTA visibility.
- `student-routes.spec.ts` — all 11 implemented student routes plus both staff areas redirect unauthenticated visitors to the login page.

**Result at Phase 2 check:** 15 tests passing on both `chromium` and `mobile` projects (30 total runs). Protected-route tests accept either `reason=auth_required` (configured) or `reason=not_configured` (unconfigured).

---

## 3. What is intentionally not tested yet

| Area | Why deferred | Phase |
|---|---|---|
| Google OAuth | Provider not configured | 6 |
| RLS matrix with real student/rep/admin accounts across two seeded classes | Requires seeded academic data and representative accounts | 6 |
| Per-student task-completion isolation and unauthorized write attempts | Requires seeded classes/tasks; read-path already verified live | 6 |
| Document extraction, chunking, embeddings, citations | Feature not implemented | 4 |
| Offline/PWA install, cache isolation, push delivery | Feature not implemented | 5 |
| Lighthouse a11y/perf/PWA, secret scan of built bundles | Final hardening | 6 |

Deferred tests are **not** skipped silently: they are listed here and in `TODO.md`, and the corresponding features are visibly marked "Soon" in the UI rather than faked.

---

## 4. Conventions

- Prefer testing behaviour over implementation details; query by accessible role/label.
- Pure logic (permissions, validation, constants) belongs in `tests/unit/`; React components in `tests/components/`; browser flows in `tests/e2e/`.
- Keep RBAC regressions covered: any new admin-only power must have a unit test asserting students and representatives are denied.
- The exact refusal string and the 20/day default are contractual — tests fail if they change unintentionally.
- Never add a test that requires real credentials to the default `npm test` run; integration tests will be gated behind explicit env checks.
