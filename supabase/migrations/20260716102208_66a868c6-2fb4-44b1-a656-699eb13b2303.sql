
-- Enable pgcrypto for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Add security question fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS security_question text,
  ADD COLUMN IF NOT EXISTS security_answer_hash text,
  ADD COLUMN IF NOT EXISTS reset_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reset_locked_until timestamptz;

-- Set / update your own security question + answer
CREATE OR REPLACE FUNCTION public.set_security_question(_question text, _answer text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE _uid uuid := auth.uid();
        _norm text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _question IS NULL OR length(trim(_question)) < 5 THEN
    RAISE EXCEPTION 'Question is too short';
  END IF;
  IF _answer IS NULL OR length(trim(_answer)) < 2 THEN
    RAISE EXCEPTION 'Answer is too short';
  END IF;
  _norm := lower(trim(_answer));
  UPDATE public.profiles
    SET security_question = trim(_question),
        security_answer_hash = extensions.crypt(_norm, extensions.gen_salt('bf', 10)),
        reset_attempts = 0,
        reset_locked_until = NULL,
        updated_at = now()
    WHERE id = _uid;
END;
$$;

REVOKE ALL ON FUNCTION public.set_security_question(text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_security_question(text, text) TO authenticated;

-- Public: get the security question for an email (generic on failure)
CREATE OR REPLACE FUNCTION public.get_security_question_for_email(_email text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _q text;
BEGIN
  IF _email IS NULL OR length(trim(_email)) = 0 THEN RETURN NULL; END IF;
  SELECT p.security_question INTO _q
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE lower(u.email) = lower(trim(_email))
  LIMIT 1;
  RETURN _q; -- may be NULL; caller shows a generic message either way
END;
$$;

REVOKE ALL ON FUNCTION public.get_security_question_for_email(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_security_question_for_email(text) TO anon, authenticated;

-- Public: verify answer; returns user_id on success, NULL otherwise. Rate-limited.
CREATE OR REPLACE FUNCTION public.verify_security_answer(_email text, _answer text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE _uid uuid;
        _hash text;
        _locked timestamptz;
        _norm text;
BEGIN
  IF _email IS NULL OR _answer IS NULL THEN RETURN NULL; END IF;
  SELECT u.id, p.security_answer_hash, p.reset_locked_until
    INTO _uid, _hash, _locked
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE lower(u.email) = lower(trim(_email))
  LIMIT 1;

  IF _uid IS NULL OR _hash IS NULL THEN RETURN NULL; END IF;
  IF _locked IS NOT NULL AND _locked > now() THEN RETURN NULL; END IF;

  _norm := lower(trim(_answer));
  IF extensions.crypt(_norm, _hash) = _hash THEN
    UPDATE public.profiles
      SET reset_attempts = 0, reset_locked_until = NULL, updated_at = now()
      WHERE id = _uid;
    RETURN _uid;
  ELSE
    UPDATE public.profiles
      SET reset_attempts = reset_attempts + 1,
          reset_locked_until = CASE WHEN reset_attempts + 1 >= 5 THEN now() + interval '1 hour' ELSE reset_locked_until END,
          updated_at = now()
      WHERE id = _uid;
    RETURN NULL;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_security_answer(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_security_answer(text, text) TO anon, authenticated;
