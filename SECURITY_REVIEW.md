# HIVE — SECURITY REVIEW (Phase 0)

**Version:** 0.1 — threat model and design controls. No implementation exists yet.
**Status:** Baseline security design; must be re-reviewed against code in Phase 6.

---

## 1. Scope and assumptions

- Trust boundary: the browser is **untrusted**. All authorization decisions are made server-side and in Postgres RLS.
- Supabase Auth issues JWTs; role/permissions are resolved from database records, **never** from client claims alone.
- All keys (Gemini, Groq, Supabase service-role, VAPID private) are server-only. `.env.example` contains names only.
- Zero-cost constraint is a security-adjacent requirement: no paid fallback may be introduced under any failure mode.

---

## 2. Threat model (STRIDE-aligned)

| Threat | Scenario | Control (to implement) | Phase |
|---|---|---|---|
| Spoofing | Attacker signs in as another student | Supabase Auth (email + Google), secure session cookies, email verification where configured | 1 |
| Tampering | Student edits `role` in client state / request | Role stored in DB; client role never trusted; DB trigger blocks self-role-change; admin-only service | 1, 3 |
| Repudiation | Rep deletes document, no trace | Append-only audit logs (role changes, user mgmt, doc upload/delete, timetable/assignment changes, admin actions) | 1, 3 |
| Information disclosure | Student reads another class's docs/chunks/AI answers | RLS scoped by `class_members`; retrieval filtered by `class_id`/`course_id` at DB + query; no cross-class vector search | 1, 4 |
| Information disclosure | Secrets shipped to browser | Server-only env; no `NEXT_PUBLIC_` on privileged keys; CI secret scan; build output inspection | 1, 6 |
| Information disclosure | PWA cache leaks another user's data on shared device | No admin/private caching; per-user cache partition; clear on logout | 5, 6 |
| DoS | AI quota abuse / API flooding | Per-user daily quota (default 20), rate limits, request queue, retry with backoff | 1, 4 |
| Elevation of privilege | Student → rep → admin | Distinct roles; admin-only grant service; RLS + server checks; automated escalation tests | 1, 3, 6 |
| Elevation of privilege | Rep manages unassigned class | RLS policies constrain reps to assigned classes; tests per class | 1, 3 |
| Malicious upload | Executable/polyglot file as document | Validate extension + MIME + **magic bytes** + size; non-executable bucket; safe viewer; scan where feasible | 2, 3, 6 |
| Injection | SQL injection via filters/search | Parameterised queries only (Supabase client / prepared statements); Zod validation | 1, 6 |
| XSS | Malicious discussion message / doc text / code snippet | Safe rendering; no raw HTML from untrusted input; CSP; syntax highlighting via safe lib; sanitisation | 2, 6 |
| CSRF | State-changing request via cross-site origin | SameSite cookies, origin checks on route handlers where cookie auth used | 1, 6 |
| Session theft | Token exfiltration | Secure/HttpOnly cookies, HTTPS, short-lived tokens, rotation | 1 |

---

## 3. Role model

| Role | May read | May write | Must never |
|---|---|---|---|
| Student | Own class's courses, documents, timetable, assignments, opportunities, discussions, own AI/tasks | Own task state, own messages, own AI conversations | Create official assignments/docs, edit timetable, admin functions, other users' data |
| Representative | Own assigned class(es) fully | Docs, assignments, timetable, announcements, opportunities, moderation, AI Notebook indexing, shared summaries/quizzes | Admin functions, other classes, self-escalation to admin |
| Administrator | Platform-wide supervision, users, roles, classes, audit, monitoring | User/role/class management, system config | Read/modify private student AI conversations unnecessarily; tamper with audit logs |

---

## 4. Enforcement layers

1. **Database (primary):** RLS on every sensitive table; policies per role; FK/unique constraints; triggers for immutable `role` from clients and append-only audit log.
2. **Server (secondary):** every route handler / Edge Function performs auth → authorization (resolve role from DB) → Zod validation → business-rule check → audit where required → consistent error response.
3. **Client (UX only):** hide/disable unauthorized controls; role-based nav; never a security boundary.

---

## 5. File-upload security checklist

- [ ] Allow-list extensions per supported type (PDF/DOCX/PPTX/TXT)
- [ ] Validate MIME **and** magic bytes (do not trust browser MIME or filename)
- [ ] Enforce size limits before processing
- [ ] Store in dedicated private bucket; no public execution; content-disposition safe
- [ ] URLs for external Drive references stored as metadata only
- [ ] Extracted text treated as untrusted; safe rendering; no script execution
- [ ] Idempotent processing; errors tracked; controlled retries
- [ ] Upload/delete audited

---

## 6. Secrets policy

- `.env.example` — variable **names only**, never values.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `VAPID_PRIVATE_KEY`.
- Client-safe (`NEXT_PUBLIC_`): Supabase URL, Supabase anon key, VAPID **public** key only.
- No secrets in logs, error messages, or AI prompts; log redaction enforced.
- Verify no privileged key appears in built client bundles (Phase 1 + 6 check).

---

## 7. AI security & academic integrity

- Grounded generation only; retrieval restricted to selected class/subject.
- Citations constructed from retrieved chunk metadata (document name, page/section) — never generated by the model.
- Fixed refusal for insufficient context; no general-knowledge answers presented as syllabus content.
- Prompt/context minimisation: send only academic text needed; disclose free-provider data policies.
- Provider abstraction enforces: free model only; quota exhaustion → degrade/queue/notify, **never** paid fallback.

---

## 8. Testing requirements (Phase 6)

- RLS bypass attempts with student/rep/admin test accounts; cross-class read/write denials.
- Privilege escalation, IDOR on every ID-bearing endpoint, unauthenticated access.
- Malicious file uploads (polyglot, wrong MIME, oversized, script payload).
- Secret exposure scan of source + built bundles.
- Rate limit / quota exhaustion; provider failure and retry; no paid call path.
- Session handling, CSRF/origin, security headers (CSP, HSTS, X-Content-Type-Options, etc.).

---

## 9. Current status (updated end of Phase 1)

Phase 1 foundation code now exists. Items above marked Phase 1 are implemented in code (typed clients, env separation, Zod validation, route guards in `src/proxy.ts`, RLS + triggers in `supabase/migrations/0002`/`0003`, RBAC tests). However, migrations have **not** been applied to a live project and multi-role RLS tests are deferred until credentials are supplied (decision A2). Implementation evidence is tracked in `SECURITY.md`; open/design-only controls are enumerated there. This document must be re-reviewed with test evidence in Phase 6 before final delivery. **No feature may be reported complete on the basis of a rendering UI alone.**
