# HIVE — Environment Configuration

This document is the single source of truth for environment variables. **`.env.example` contains names only, never values.** Copy it to `.env.local` for local development; `.env.local` is git-ignored.

---

## 1. Variable reference

### Client-safe (`NEXT_PUBLIC_*`)

These are embedded in the browser bundle. **Only put non-secret values here.**

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For live backend | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For live backend | — | Supabase anon/public key (RLS-protected; safe to ship) |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Canonical app URL for auth redirects / links |

### Server-only (never prefix with `NEXT_PUBLIC_`)

Read exclusively through `src/lib/env.server.ts` and only from server contexts. **Never import `env.server.ts` into a Client Component.**

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | For admin jobs | — | Bypasses RLS; trusted background jobs only |
| `GEMINI_API_KEY` | No | — | Free-tier primary AI provider (Phase 4) |
| `GROQ_API_KEY` | No | — | Free-tier fallback AI provider (Phase 4) |
| `EMBEDDING_PROVIDER` | No | `local-e5-small` | `local-e5-small` or `gemini` |
| `EMBEDDING_DIMENSION` | No | `384` | Must match the actual embedding model output; validated at ingestion — never assume 768 |
| `VAPID_PUBLIC_KEY` | No | — | Web Push public key (Phase 5) |
| `VAPID_PRIVATE_KEY` | No | — | Web Push private key; secret (Phase 5) |
| `VAPID_SUBJECT` | No | `mailto:admin@example.com` | Push `admin` contact (e.g. `mailto:` or `https://`) |
| `AI_DAILY_QUESTION_LIMIT` | No | `20` | Per-student daily AI quota (Phase 4) |

---

## 2. Validation behaviour

- `src/lib/env.ts` reads public variables. `isSupabaseConfigured` is true only when both URL and anon key are present. When false, the app renders an explicit configuration notice and protected routes redirect to `/login?reason=not_configured`.
- `src/lib/env.server.ts` validates server variables with Zod. `getServerEnv()` returns **`null`** when configuration is incomplete so callers degrade gracefully; it never throws raw env values. `getEmbeddingConfig()` returns safe non-secret defaults.
- Defaults are applied for embedding provider/dimension, VAPID subject, and AI quota. The service-role key and AI keys are optional at the type level so the app can boot before those features are enabled.

---

## 3. How to configure a Supabase project

1. Create a free Supabase project.
2. In **Project Settings → API**, copy the project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Copy the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY` (server-only; used for trusted jobs such as scheduled archiving).
4. Apply the SQL migrations in order — see `DATABASE.md`.
5. Enable Email auth (and optionally Google) in **Authentication → Providers**. Set the site URL and redirect allow-list to `NEXT_PUBLIC_APP_URL` and `${NEXT_PUBLIC_APP_URL}/auth/callback`.
6. Restart the dev server and confirm the configuration notice disappears.

> No credentials are committed. If you do not supply credentials, the credential-independent layers (UI, schema, tests) still work.

---

## 4. Zero-cost & secrets policy

- Only free tiers of Supabase, Gemini, Groq, and free/local embedding are permitted. **No paid fallback exists or may be added.**
- Secrets are never logged, included in error messages, or sent to AI prompts.
- Before each release, verify no privileged key appears in client bundles (grep `.next/static` for secret values in Phase 6).
- Rotate the service-role and provider keys immediately if they are ever exposed.

---

## 5. Current state (Phase 1)

- `.env.example` exists with names only. A local `.env.local` is configured with the project URL and a Supabase **publishable key** (`sb_publishable_…`), which is client-safe and is used for `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The file is git-ignored.
- The same public values are set as Vercel project environment variables for production/preview/development.
- `SUPABASE_SERVICE_ROLE_KEY` (or a `sb_secret_…` key) has not been supplied, so `getServerEnv()` stays `null` and the privileged/admin client remains unavailable. This is expected and safe.
- AI provider keys and VAPID keys remain unset (features are Phase 4/5).
- The database password is used only for migration commands and is never stored in any file.
