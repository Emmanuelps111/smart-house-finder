-- 1. Block users from changing privileged profile fields directly
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF current_user IN ('authenticated','anon') AND NOT public.is_admin(auth.uid()) THEN
    IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
       OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
       OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
       OR NEW.ocr_attempts IS DISTINCT FROM OLD.ocr_attempts
       OR NEW.ocr_data IS DISTINCT FROM OLD.ocr_data
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.security_answer_hash IS DISTINCT FROM OLD.security_answer_hash
       OR NEW.reset_attempts IS DISTINCT FROM OLD.reset_attempts
       OR NEW.reset_locked_until IS DISTINCT FROM OLD.reset_locked_until THEN
      RAISE EXCEPTION 'Not allowed to change protected profile fields';
    END IF;
    IF NEW.agency_status IS DISTINCT FROM OLD.agency_status
       AND NOT (OLD.agency_status = 'none' AND NEW.agency_status = 'pending') THEN
      RAISE EXCEPTION 'Not allowed to change agency status';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER protect_profile_privileged_fields BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- Server-checked auto-verification: renters, and students with a university email
CREATE OR REPLACE FUNCTION public.auto_verify_self()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _uid uuid := auth.uid(); _email text; _dom text; _ok boolean := false;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT lower(email) INTO _email FROM auth.users WHERE id = _uid;
  _dom := split_part(coalesce(_email,''), '@', 2);
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role='student')
     AND _dom IN ('student.udsm.ac.tz','udsm.ac.tz','duce.ac.tz','aru.ac.tz','student.aru.ac.tz',
                  'ifm.ac.tz','student.ifm.ac.tz','muhas.ac.tz','student.muhas.ac.tz','cbe.ac.tz','student.cbe.ac.tz') THEN
    _ok := true;
  ELSIF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role='renter')
     AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role IN ('landlord','student')) THEN
    _ok := true;
  END IF;
  IF _ok THEN
    UPDATE public.profiles SET verification_status='approved', verified_at=coalesce(verified_at, now()), updated_at=now()
      WHERE id=_uid AND verification_status <> 'approved';
    RETURN 'approved';
  END IF;
  RETURN 'pending';
END; $$;
REVOKE ALL ON FUNCTION public.auto_verify_self() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.auto_verify_self() TO authenticated;

-- 2. Roommate requests: only students and admins (and the owner) can read
DROP POLICY IF EXISTS "Authenticated users can view roommate requests" ON public.roommate_requests;
CREATE POLICY "Students and admins can view roommate requests" ON public.roommate_requests
FOR SELECT TO authenticated
USING (auth.uid() = student_id OR public.has_role(auth.uid(),'student') OR public.is_admin(auth.uid()));

-- 3. Reviews: only reviews of approved listings, own reviews, or admin / owning landlord
DROP POLICY IF EXISTS "Reviews are readable by signed-in users" ON public.property_reviews;
CREATE POLICY "Reviews readable for approved listings" ON public.property_reviews
FOR SELECT TO authenticated
USING (
  auth.uid() = reviewer_id OR public.is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_reviews.property_id
             AND (p.status = 'approved' OR p.landlord_id = auth.uid()))
);

-- 4. Contact messages: validated submissions only
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a valid contact message" ON public.contact_messages
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND length(trim(name)) BETWEEN 1 AND 120
  AND length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(callback_email) <= 255 AND callback_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(message)) BETWEEN 1 AND 5000
);