
-- Lifestyle enums
DO $$ BEGIN
  CREATE TYPE public.cleanliness_pref AS ENUM ('High','Medium','Flexible');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.sleep_schedule_pref AS ENUM ('Early Bird','Night Owl','Flexible');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.roommate_request_status AS ENUM ('searching','matched');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cleanliness_preference public.cleanliness_pref,
  ADD COLUMN IF NOT EXISTS sleep_schedule public.sleep_schedule_pref,
  ADD COLUMN IF NOT EXISTS bio text;

-- Roommate requests table
CREATE TABLE IF NOT EXISTS public.roommate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  status public.roommate_request_status NOT NULL DEFAULT 'searching',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only one active (searching) request per student/property
CREATE UNIQUE INDEX IF NOT EXISTS roommate_requests_unique_active
  ON public.roommate_requests (student_id, property_id)
  WHERE status = 'searching';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roommate_requests TO authenticated;
GRANT SELECT ON public.roommate_requests TO anon;
GRANT ALL ON public.roommate_requests TO service_role;

ALTER TABLE public.roommate_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roommate requests viewable by everyone"
  ON public.roommate_requests FOR SELECT
  USING (true);

CREATE POLICY "Students can create their own roommate requests"
  ON public.roommate_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own roommate requests"
  ON public.roommate_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete their own roommate requests"
  ON public.roommate_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

CREATE TRIGGER update_roommate_requests_updated_at
  BEFORE UPDATE ON public.roommate_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
