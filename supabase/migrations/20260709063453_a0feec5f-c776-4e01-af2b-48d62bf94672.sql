
-- 1. Extend profile_role enum with 'agency'
ALTER TYPE public.profile_role ADD VALUE IF NOT EXISTS 'agency';

-- 2. Add agency_status column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agency_status text NOT NULL DEFAULT 'none';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_agency_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_agency_status_check
  CHECK (agency_status IN ('none','pending','approved'));

-- 3. Admin-only: list pending agency requests with email
CREATE OR REPLACE FUNCTION public.list_pending_agencies()
RETURNS TABLE(id uuid, full_name text, phone text, email text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.phone, u.email, p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.agency_status = 'pending'
    AND public.is_admin(auth.uid())
  ORDER BY p.created_at ASC;
$$;

-- 4. Admin-only: approve an agency request
CREATE OR REPLACE FUNCTION public.approve_agency(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can approve agency upgrades';
  END IF;
  UPDATE public.profiles
    SET agency_status = 'approved', role = 'agency'::profile_role, updated_at = now()
    WHERE id = _user_id;
  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (
    _user_id,
    '✓ Agency account approved',
    'Your Smart House Finder agency upgrade has been approved. You can now manage multiple properties.',
    'agency_approved',
    '/dashboard.html'
  );
END;
$$;

-- 5. Admin-only: decline an agency request (revert to none, keep role)
CREATE OR REPLACE FUNCTION public.decline_agency(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can decline agency upgrades';
  END IF;
  UPDATE public.profiles
    SET agency_status = 'none', updated_at = now()
    WHERE id = _user_id;
  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (
    _user_id,
    'Agency upgrade declined',
    'Your agency upgrade request was not approved at this time. Contact support for details.',
    'agency_declined',
    '/notifications.html'
  );
END;
$$;
