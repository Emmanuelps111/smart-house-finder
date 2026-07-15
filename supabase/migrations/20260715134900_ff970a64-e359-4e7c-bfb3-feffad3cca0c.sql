CREATE OR REPLACE FUNCTION public.get_roommate_sender_public(_sender uuid)
RETURNS TABLE(id uuid, full_name text, gender text, course_major text, home_campus text, habit_tags text[])
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.gender, p.course_major, p.home_campus, p.habit_tags
  FROM public.profiles p
  WHERE p.id = _sender
    AND EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = auth.uid()
        AND n.type LIKE ('roommate_connect_request:' || _sender::text || '%')
    )
$$;

GRANT EXECUTE ON FUNCTION public.get_roommate_sender_public(uuid) TO authenticated;