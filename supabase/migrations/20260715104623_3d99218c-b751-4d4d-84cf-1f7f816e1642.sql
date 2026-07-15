
CREATE OR REPLACE FUNCTION public.set_initial_role(_role app_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _role NOT IN ('renter','student','landlord') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid) THEN
    RAISE EXCEPTION 'Role already set';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _role);
  UPDATE public.profiles SET role = _role::text::profile_role, updated_at = now() WHERE id = _uid;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_initial_role(app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_initial_role(app_role) TO authenticated;
