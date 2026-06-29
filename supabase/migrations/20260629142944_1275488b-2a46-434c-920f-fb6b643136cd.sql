
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'system',
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX notifications_unread_idx ON public.notifications(user_id) WHERE read = false;

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins insert any notification" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins view all notifications" ON public.notifications
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Roommate request extras
ALTER TABLE public.roommate_requests
  ADD COLUMN IF NOT EXISTS details jsonb,
  ADD COLUMN IF NOT EXISTS match_partner_id uuid REFERENCES public.roommate_requests(id) ON DELETE SET NULL;

-- Viewing request response
ALTER TABLE public.viewing_requests
  ADD COLUMN IF NOT EXISTS landlord_response text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

-- Admin broadcast
CREATE OR REPLACE FUNCTION public.send_announcement(_title text, _body text, _link text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _count integer;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can send announcements';
  END IF;
  INSERT INTO public.notifications (user_id, title, body, type, link)
  SELECT id, _title, _body, 'announcement', _link FROM public.profiles;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

-- Landlord viewing-request response
CREATE OR REPLACE FUNCTION public.respond_viewing_request(_req uuid, _message text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.viewing_requests%ROWTYPE; _prop_title text;
BEGIN
  SELECT * INTO _row FROM public.viewing_requests WHERE id = _req;
  IF NOT FOUND THEN RAISE EXCEPTION 'Viewing request not found'; END IF;
  IF NOT (auth.uid() = _row.landlord_id OR public.is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorised to respond';
  END IF;
  UPDATE public.viewing_requests
    SET landlord_response = _message, responded_at = now(), seen = true
    WHERE id = _req;
  SELECT title INTO _prop_title FROM public.properties WHERE id = _row.property_id;
  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (
    _row.renter_id,
    'Landlord replied to your viewing request',
    COALESCE(_prop_title, 'Property') || ': ' || _message,
    'viewing_response',
    '/detail.html?id=' || _row.property_id::text
  );
END;
$$;

-- Admin match roommate requests
CREATE OR REPLACE FUNCTION public.match_roommate_requests(_a uuid, _b uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ra public.roommate_requests%ROWTYPE; _rb public.roommate_requests%ROWTYPE;
        _name_a text; _name_b text; _prop text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can match roommates';
  END IF;
  SELECT * INTO _ra FROM public.roommate_requests WHERE id = _a;
  SELECT * INTO _rb FROM public.roommate_requests WHERE id = _b;
  IF _ra.id IS NULL OR _rb.id IS NULL THEN RAISE EXCEPTION 'Requests not found'; END IF;

  UPDATE public.roommate_requests SET status = 'matched', match_partner_id = _b WHERE id = _a;
  UPDATE public.roommate_requests SET status = 'matched', match_partner_id = _a WHERE id = _b;

  SELECT full_name INTO _name_a FROM public.profiles WHERE id = _ra.student_id;
  SELECT full_name INTO _name_b FROM public.profiles WHERE id = _rb.student_id;
  SELECT title INTO _prop FROM public.properties WHERE id = COALESCE(_ra.property_id, _rb.property_id);

  INSERT INTO public.notifications (user_id, title, body, type, link) VALUES
    (_ra.student_id, '🎉 Potential roommate found!',
     'You have been matched with ' || COALESCE(_name_b,'another student') || ' for ' || COALESCE(_prop,'a property') || '. Check their profile and reach out.',
     'roommate_match',
     CASE WHEN _ra.property_id IS NOT NULL THEN '/detail.html?id=' || _ra.property_id::text ELSE '/notifications.html' END),
    (_rb.student_id, '🎉 Potential roommate found!',
     'You have been matched with ' || COALESCE(_name_a,'another student') || ' for ' || COALESCE(_prop,'a property') || '. Check their profile and reach out.',
     'roommate_match',
     CASE WHEN _rb.property_id IS NOT NULL THEN '/detail.html?id=' || _rb.property_id::text ELSE '/notifications.html' END);
END;
$$;

-- Mark all read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.notifications SET read = true WHERE user_id = auth.uid() AND read = false;
$$;

GRANT EXECUTE ON FUNCTION public.send_announcement(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_viewing_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_roommate_requests(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;
