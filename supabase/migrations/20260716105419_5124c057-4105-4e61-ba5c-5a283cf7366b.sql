
CREATE OR REPLACE FUNCTION public.check_security_answer(_email text, _answer text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _uid uuid;
  _hash text;
  _q text;
  _locked timestamptz;
  _norm text;
BEGIN
  IF _email IS NULL OR length(trim(_email)) = 0 THEN
    RETURN jsonb_build_object('status','no_account');
  END IF;

  SELECT u.id, p.security_answer_hash, p.security_question, p.reset_locked_until
    INTO _uid, _hash, _q, _locked
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE lower(u.email) = lower(trim(_email))
  LIMIT 1;

  IF _uid IS NULL THEN
    RETURN jsonb_build_object('status','no_account');
  END IF;

  IF _hash IS NULL OR _q IS NULL OR length(trim(_q)) = 0 THEN
    RETURN jsonb_build_object('status','no_question');
  END IF;

  IF _locked IS NOT NULL AND _locked > now() THEN
    RETURN jsonb_build_object('status','locked','until',_locked);
  END IF;

  IF _answer IS NULL THEN
    RETURN jsonb_build_object('status','wrong');
  END IF;

  _norm := lower(trim(_answer));

  IF extensions.crypt(_norm, _hash) = _hash THEN
    UPDATE public.profiles
      SET reset_attempts = 0, reset_locked_until = NULL, updated_at = now()
      WHERE id = _uid;
    RETURN jsonb_build_object('status','ok','user_id',_uid);
  ELSE
    UPDATE public.profiles
      SET reset_attempts = COALESCE(reset_attempts,0) + 1,
          reset_locked_until = CASE
            WHEN COALESCE(reset_attempts,0) + 1 >= 8
            THEN now() + interval '30 minutes'
            ELSE reset_locked_until
          END,
          updated_at = now()
      WHERE id = _uid;
    RETURN jsonb_build_object('status','wrong');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_security_answer(text, text) TO anon, authenticated;

-- Clear stale lockouts / attempt counters so anyone previously stuck can retry
UPDATE public.profiles
  SET reset_attempts = 0, reset_locked_until = NULL
  WHERE reset_attempts > 0 OR reset_locked_until IS NOT NULL;
