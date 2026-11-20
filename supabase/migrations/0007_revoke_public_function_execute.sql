-- HIVE — Corrective migration for 0006.
--
-- Postgres grants EXECUTE to PUBLIC by default when a function is created.
-- Revoking only from `anon` left that default PUBLIC grant in place, so anon
-- callers could still invoke the maintenance function. Remove both grants.

revoke all on function public.archive_expired_opportunities() from public, anon;
