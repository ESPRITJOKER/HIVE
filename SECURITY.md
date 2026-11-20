# HIVE — Security Control Status (implementation companion)

This document records the **current implementation status** of the controls designed in `SECURITY_REVIEW.md`. The threat model there remains the authoritative design reference; this file is the evidence log that must be updated each phase. **No feature is considered complete based on a rendering UI alone.**

---

## 1. Enforcement layers — where they live today

| Layer | Implemented in | Status |
|---|---|---|
| Database (primary) | `supabase/migrations/0002_rls_policies.sql`, `0003_triggers_and_functions.sql`, `0004_role_grants.sql`, `0005_phase2_support.sql`, `0006_phase3_support.sql`, `0007_revoke_public_function_execute.sql` | ✅ Applied to the live project: RLS on all sensitive tables, 40 `authenticated`-scoped policies (+3 for `saved_resources`), role-self-change guard, append-only audit trigger, explicit API-role grants, realtime limited to `messages`, admin-only settings, private class-scoped document storage, and no anonymous maintenance-function access. ⛔ Not yet exercised with a multi-role cross-class matrix. |
| Server (secondary) | `src/proxy.ts`, `src/lib/supabase/server.ts`, `src/lib/permissions/*`, `src/lib/validations/*`, `src/features/*/actions/*`, `src/features/shared/scope.ts` | ✅ Session refresh + route protection; role resolved from the `users` table (not client claims); every Phase 2 mutation re-authenticates, validates with Zod, re-checks class scope server-side, and revalidates; consistent API responses. |
| Client (UX only) | `src/components/layout/*`, student screens and dashboards | ✅ Role-based nav and dashboards; roadmap controls disabled with "Soon" labels. Explicitly **not** a security boundary. |

---

## 2. Controls verified by code / tests at Phase 1

- **Privileged keys are server-only.** `src/lib/env.ts` exposes only `NEXT_PUBLIC_*` values; `env.server.ts` is documented server-only and validates with Zod. `.env.example` is names-only; no secrets are committed.
- **No mock backend.** `getBrowserSupabase()` / `getServerSupabase()` return `null` when unconfigured and the UI shows a configuration notice; dashboards never fabricate data.
- **Live Supabase connected.** Public URL + publishable key are configured locally and on Vercel; anonymous REST reads return `200 []`, confirming RLS blocks rows for unauthenticated callers. The DB password is command-only and never stored; no service-role secret has been supplied.
- **Admin account verified end-to-end.** A DB-seeded admin user (`admin@hive.app`, role `administrator`) authenticates via the Auth API, reads its own row through RLS, and signs in through the browser UI to `/admin/dashboard`. Its password was generated at runtime and delivered only to the owner — it appears in no file or commit.
- **Role separation.** `tests/unit/permissions.test.ts` asserts students and representatives are denied all admin permissions, students cannot upload/publish/manage/moderate, representatives cannot manage users, and null roles deny everything. Roles are not hierarchical for admin powers.
- **Route protection.** `src/proxy.ts` redirects unauthenticated users from `/student`, `/representative`, `/admin` areas; mismatched roles are redirected to their own home path; unconfigured backend redirects to `/login?reason=not_configured` (covered by Playwright).
- **Role self-change blocked at DB.** `prevent_role_self_change()` trigger in migration 0003.
- **Append-only audit log.** `write_audit_log()` + `prevent_audit_mutation()` triggers; audit reads are an admin-only permission.
- **AI anti-hallucination contract locked by test.** `INSUFFICIENT_CONTEXT_MESSAGE` is enforced verbatim and quoted by `tests/unit/security.test.ts`; zero-cost default quota is 20/day.
- **Upload allow-list + byte checks.** Extension/MIME/size constants are locked by tests. Phase 3 verifies magic bytes server-side (PDF `%PDF`, DOCX/PPTX ZIP header, plain text has no NUL bytes), enforces the DB-backed upload cap through a definer RPC, writes to a private bucket with class-scoped storage RLS, and removes the object if the document row insert fails. A DB trigger prevents clients from marking a document `indexed`.
- **Phase 3 write boundary.** Every rep/admin mutation re-authenticates with `requireRole`, validates with Zod, re-resolves course/class scope from the database before the write (`canManageClass` / `message_class_id()`), and revalidates affected paths. Students are denied all rep/admin actions even if a Server Action is called directly.
- **Admin escalation guards.** Role changes cannot target the signed-in admin, cannot demote the last administrator, and are additionally blocked by the DB trigger. Storage/AI settings with no runtime effect are not exposed.
- **Phase 2 read-path isolation verified live.** A temporary class-less student account authenticated successfully and every class-scoped REST read (including the new `saved_resources` table) returned `200 []`. The account was deleted after the check. All 11 student pages also rendered through a real browser login with honest empty states, not fabricated data.
- **Phase 2 mutation boundary.** Server Actions call `requireRole(["student"])` themselves — a direct action call from another role is redirected/denied even if a UI control were bypassed. `toggleTaskCompletionAction`, `postMessageAction`, `setNotificationsReadAction`, `setDocumentSavedAction`, and `updateProfileAction` all validate input and re-check scope; discussion authors and task-completion user ids are derived from the session, never from client payloads.
- **XSS-safe rendering.** Untrusted document/message/notification text is rendered as React text nodes (no `dangerouslySetInnerHTML`); document preview uses a short-lived signed URL inside an iframe, and external links use `rel="noopener noreferrer"`.
- **Headers.** `next.config.ts` sets security headers including CSP. ⛔ **TD-001:** CSP currently uses `'unsafe-inline'`; nonce-based CSP is pending.

---

## 3. Open / deferred security work

| Item | Phase | Notes |
|---|---|---|
| Multi-role RLS matrix across two seeded classes | 6 | Single-role live RLS + class-less student read path verified; cross-class reads/writes with student/rep/admin accounts still to be proven |
| Magic-byte upload validation, private bucket, safe viewer | 3 ✅ | Implemented in Phase 3: byte checks, private bucket + scoped storage RLS, short-lived signed viewer URLs |
| XSS-safe rendering of untrusted doc/discussion text | 2 ✅ | React text nodes only; no raw HTML; iframe + `noopener noreferrer` |
| AI provider abstraction with no paid fallback; citation integrity | 4 | Retrieval-scoped, real citations, fixed refusal |
| PWA per-user cache partition + clear on logout | 5 | Prevents shared-device leakage |
| Secret scan of built bundles, security headers review, Lighthouse | 6 | Includes replacing CSP `'unsafe-inline'` (TD-001) |
| Full privilege-escalation / IDOR test matrix | 6 | Phase 3 adds pure authorization + Zod regression suites; live cross-class write attempts still need seeded accounts |

---

## 4. Secrets incident policy

- `.env.example` — names only. `.env.local` is git-ignored.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `VAPID_PRIVATE_KEY`.
- Client-safe (`NEXT_PUBLIC_`): Supabase URL, Supabase anon key, VAPID public key only.
- No secrets in logs, errors, or AI prompts. If a secret is exposed, rotate it immediately and scan git history/bundles.

---

## 5. Review cadence

Update this file with concrete evidence (test names, results, file references) at the end of every phase. Re-review the full threat model in Phase 6 before final delivery.
