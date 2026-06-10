
-- 1. Add 'renter' to app_role enum (PG12+ allows ADD VALUE in tx)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'renter';

-- 2. Verification status enum
DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_status public.verification_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ocr_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ocr_data JSONB,
  ADD COLUMN IF NOT EXISTS university TEXT,
  ADD COLUMN IF NOT EXISTS student_reg_no TEXT,
  ADD COLUMN IF NOT EXISTS student_id_url TEXT,
  ADD COLUMN IF NOT EXISTS nid_front_url TEXT,
  ADD COLUMN IF NOT EXISTS nid_back_url TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Auto-approve existing admins so they keep access
UPDATE public.profiles p
SET verification_status = 'approved', verified_at = now()
WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin');

-- 4. Verified-check helper
CREATE OR REPLACE FUNCTION public.is_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND verification_status = 'approved'
  )
$$;

-- 5. Gate viewing_requests on verified status
DROP POLICY IF EXISTS "Renters create their own viewing requests" ON public.viewing_requests;
CREATE POLICY "Verified renters create viewing requests"
  ON public.viewing_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = renter_id AND public.is_verified(auth.uid()));
