
DROP FUNCTION IF EXISTS public.get_landlord_public(uuid);
CREATE FUNCTION public.get_landlord_public(_landlord_id uuid)
RETURNS TABLE(id uuid, full_name text, selfie_url text, phone text, property_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.id, p.full_name, p.selfie_url, p.phone,
    (SELECT count(*) FROM public.properties pr WHERE pr.landlord_id = p.id AND pr.status = 'approved')
  FROM public.profiles p
  WHERE p.id = _landlord_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id AND ur.role IN ('landlord','admin')
    )
$function$;
GRANT EXECUTE ON FUNCTION public.get_landlord_public(uuid) TO authenticated, anon;
