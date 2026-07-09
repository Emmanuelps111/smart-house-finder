
REVOKE EXECUTE ON FUNCTION public.list_pending_agencies() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.approve_agency(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.decline_agency(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.list_pending_agencies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_agency(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_agency(uuid) TO authenticated;
