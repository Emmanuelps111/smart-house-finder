
ALTER TABLE public.roommate_requests
  ALTER COLUMN property_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS property_key text;

DROP INDEX IF EXISTS roommate_requests_unique_active;
CREATE UNIQUE INDEX IF NOT EXISTS roommate_requests_unique_active_uuid
  ON public.roommate_requests (student_id, property_id)
  WHERE status = 'searching' AND property_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS roommate_requests_unique_active_key
  ON public.roommate_requests (student_id, property_key)
  WHERE status = 'searching' AND property_key IS NOT NULL;
