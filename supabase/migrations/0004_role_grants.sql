-- HIVE — API role privileges
--
-- RLS is the authorization boundary (see 0002_rls_policies.sql). These grants
-- only allow PostgREST to reach the tables at all; every policy is scoped to
-- `authenticated`, so the `anon` role still sees zero rows.
-- Supabase's default privileges do not always cover tables created by SQL
-- migrations, so grants are declared explicitly here.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- Keep future tables/functions from phases 2-7 consistent.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
