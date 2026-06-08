
-- Add selfie URL to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selfie_url text;

-- Property occupancy
DO $$ BEGIN
  CREATE TYPE public.occupancy_status AS ENUM ('vacant','occupied');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS occupancy public.occupancy_status NOT NULL DEFAULT 'vacant';

-- Public landlord view (name + selfie only). Bypasses profiles RLS by design.
CREATE OR REPLACE VIEW public.landlord_public AS
SELECT p.id, p.full_name, p.selfie_url
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = p.id AND ur.role IN ('landlord','admin')
);
GRANT SELECT ON public.landlord_public TO authenticated, anon;

-- Viewing requests (renter -> landlord notifications)
CREATE TABLE IF NOT EXISTS public.viewing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  renter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_phone text NOT NULL,
  message text,
  seen boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.viewing_requests TO authenticated;
GRANT ALL ON public.viewing_requests TO service_role;

ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renters create their own viewing requests"
  ON public.viewing_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Renter or landlord can read their requests"
  ON public.viewing_requests FOR SELECT TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = landlord_id OR public.is_admin(auth.uid()));

CREATE POLICY "Landlord can update their requests"
  ON public.viewing_requests FOR UPDATE TO authenticated
  USING (auth.uid() = landlord_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = landlord_id OR public.is_admin(auth.uid()));

CREATE POLICY "Renter or landlord can delete their requests"
  ON public.viewing_requests FOR DELETE TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = landlord_id OR public.is_admin(auth.uid()));

CREATE TRIGGER update_viewing_requests_updated_at
  BEFORE UPDATE ON public.viewing_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
