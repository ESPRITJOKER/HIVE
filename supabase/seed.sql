-- HIVE local-development seed.
-- This is DEVELOPMENT REFERENCE DATA ONLY — never run against production.
-- User accounts must be created through Supabase Auth; the handle_new_user
-- trigger then provisions public.users with the student role.

insert into public.classes (id, name, code, description)
values (
  '00000000-0000-4000-8000-000000000001',
  'Demo Class — Computer Science',
  'HIVE-DEMO',
  'Local development reference class. Remove before production deployment.'
)
on conflict (id) do nothing;

insert into public.courses (id, class_id, code, title, description)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'CS101', 'Introduction to Computing', 'Foundational concepts.'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'CS201', 'Data Structures', 'Linear and non-linear structures.'),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'MATH101', 'Discrete Mathematics', 'Logic, sets and graph theory.')
on conflict (id) do nothing;

insert into public.channels (id, class_id, course_id, name, channel_type)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', null, 'general', 'general'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', 'cs101', 'subject')
on conflict (id) do nothing;

COMMENT ON TABLE public.classes IS 'Seed row HIVE-DEMO is for local development only.';
