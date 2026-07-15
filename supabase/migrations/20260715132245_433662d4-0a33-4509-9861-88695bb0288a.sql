ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS course_major text,
  ADD COLUMN IF NOT EXISTS home_campus text,
  ADD COLUMN IF NOT EXISTS habit_tags text[];