REVOKE EXECUTE ON FUNCTION public.get_landlord_public(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_landlord_public(uuid) TO authenticated, service_role;