
DROP VIEW IF EXISTS public.landlord_public;

CREATE OR REPLACE FUNCTION public.get_landlord_public(_landlord_id uuid)
RETURNS TABLE (id uuid, full_name text, selfie_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.selfie_url
  FROM public.profiles p
  WHERE p.id = _landlord_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id AND ur.role IN ('landlord','admin')
    )
$$;

REVOKE ALL ON FUNCTION public.get_landlord_public(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_landlord_public(uuid) TO authenticated, anon;
