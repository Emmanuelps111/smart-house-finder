DROP POLICY IF EXISTS "Roommate requests viewable by everyone" ON public.roommate_requests;

CREATE POLICY "Authenticated users can view roommate requests"
ON public.roommate_requests
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.roommate_requests FROM anon;