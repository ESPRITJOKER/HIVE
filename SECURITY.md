# HIVE — Security Control Status (implementation companion)

This document records the **current implementation status** of the controls designed in `SECURITY_REVIEW.md`. The threat model there remains the authoritative design reference; this file is the evidence log that must be updated each phase. **No feature is considered complete based on a rendering UI alone.**

---

## 1. Enforcement layers — where they live today

| Layer | Implemented in | Status |
|---|---|---|
| Database (primary) | `supabase/migrations/0002_rls_policies.sql`, `0003_triggers_and_functions.sql`, `0004_role_grants.sql` | ✅ Written and applied to the live project: RLS on all sensitive tables, 40 `authenticated`-scoped policies, role-self-change guard, append-only audit trigger, explicit API-role grants. ⛔ Not yet exercised with multi-role test accounts. |
| Server (secondary) | `src/proxy.ts`, `src/lib/supabase/server.ts`, `src/lib/permissions/*`, `src/lib/validations/*` | ✅ Session refresh + route protection; role resolved from the `users` table (not client claims); Zod validation; consistent API responses. |
| Client (UX only) | `src/components/layout/*`, role dashboards | ✅ Role-based nav and dashboards; roadmap controls disabled with "Soon" labels. Explicitly **not** a security boundary. |

---

## 2. Controls verified by code / tests at Phase 1

- **Privileged keys are server-only.** `src/lib/env.ts` exposes only `NEXT_PUBLIC_*` values; `env.server.ts` is documented server-only and validates with Zod. `.env.example` is names-only; no secrets are committed.
- **No mock backend.** `getBrowserSupabase()` / `getServerSupabase()` return `null` when unconfigured and the UI shows a configuration notice; dashboards never fabricate data.
- **Live Supabase connected.** Public URL + publishable key are configured locally and on Vercel; anonymous REST reads return `200 []`, confirming RLS blocks rows for unauthenticated callers. The DB password is command-only and never stored; no service-role secret has been supplied.
- **Role separation.** `tests/unit/permissions.test.ts` asserts students and representatives are denied all admin permissions, students cannot upload/publish/manage/moderate, representatives cannot manage users, and null roles deny everything. Roles are not hierarchical for admin powers.
- **Route protection.** `src/proxy.ts` redirects unauthenticated users from `/student`, `/representative`, `/admin` areas; mismatched roles are redirected to their own home path; unconfigured backend redirects to `/login?reason=not_configured` (covered by Playwright).
- **Role self-change blocked at DB.** `prevent_role_self_change()` trigger in migration 0003.
- **Append-only audit log.** `write_audit_log()` + `prevent_audit_mutation()` triggers; audit reads are an admin-only permission.
- **AI anti-hallucination contract locked by test.** `INSUFFICIENT_CONTEXT_MESSAGE` is enforced verbatim and quoted by `tests/unit/security.test.ts`; zero-cost default quota is 20/day.
- **Upload allow-list.** Extension/MIME/size constants are locked by tests; magic-byte verification is a documented Phase 2/6 requirement (not yet implemented).
- **Headers.** `next.config.ts` sets security headers including CSP. ⛔ **TD-001:** CSP currently uses `'unsafe-inline'`; nonce-based CSP is pending.

---

## 3. Open / deferred security work

| Item | Phase | Notes |
|---|---|---|
| Apply migrations + multi-role RLS bypass tests on scratch project | 1 (when keys) / 6 | No cross-class reads/writes must be provable |
| Magic-byte upload validation, private bucket, safe viewer | 2 / 3 / 6 | Extension+MIME allow-list exists; byte checks pending |
| XSS-safe rendering of untrusted doc/discussion text | 2 | No raw HTML from untrusted input |
| AI provider abstraction with no paid fallback; citation integrity | 4 | Retrieval-scoped, real citations, fixed refusal |
| PWA per-user cache partition + clear on logout | 5 | Prevents shared-device leakage |
| Secret scan of built bundles, security headers review, Lighthouse | 6 | Includes replacing CSP `'unsafe-inline'` (TD-001) |
| Full privilege-escalation / IDOR test matrix | 6 | — |

---

## 4. Secrets incident policy

- `.env.example` — names only. `.env.local` is git-ignored.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `VAPID_PRIVATE_KEY`.
- Client-safe (`NEXT_PUBLIC_`): Supabase URL, Supabase anon key, VAPID public key only.
- No secrets in logs, errors, or AI prompts. If a secret is exposed, rotate it immediately and scan git history/bundles.

---

## 5. Review cadence

Update this file with concrete evidence (test names, results, file references) at the end of every phase. Re-review the full threat model in Phase 6 before final delivery.
