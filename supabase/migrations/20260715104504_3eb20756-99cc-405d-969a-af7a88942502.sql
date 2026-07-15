
-- Add avatar/google-id columns to profiles for OAuth users
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS google_id text;

-- Update handle_new_user to populate avatar/google-id and to only assign a role
-- when the signup explicitly requested one (email signup passes role in metadata;
-- Google signin does not, so those users go through a role-picker page).
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
  _has_role boolean := (NEW.raw_user_meta_data ? 'role');
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, national_id, avatar_url, google_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'national_id',
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
    NEW.raw_user_meta_data ->> 'sub'
  )
  ON CONFLICT (id) DO NOTHING;

  IF _has_role THEN
    BEGIN
      _role := (NEW.raw_user_meta_data ->> 'role')::app_role;
    EXCEPTION WHEN OTHERS THEN
      _role := NULL;
    END;
    IF _role IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
