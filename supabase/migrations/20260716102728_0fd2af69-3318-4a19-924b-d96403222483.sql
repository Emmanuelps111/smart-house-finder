
CREATE OR REPLACE FUNCTION public.accept_roommate_connect(_sender uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _me uuid := auth.uid();
        _me_name text; _me_phone text;
        _s_name text;  _s_phone text;
        _prop_key text;
        _competitor RECORD;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT full_name, phone INTO _me_name, _me_phone FROM public.profiles WHERE id = _me;
  SELECT full_name, phone INTO _s_name,  _s_phone  FROM public.profiles WHERE id = _sender;

  IF _s_phone IS NULL OR _me_phone IS NULL THEN
    RAISE EXCEPTION 'Both students must have a phone number set on their profile before sharing contact.';
  END IF;

  -- Find the property_key from the accepting user's incoming request notification.
  -- Notification type format: 'roommate_connect_request:<sender_uuid>:<property_key>'
  SELECT split_part(n.type, ':', 3) INTO _prop_key
  FROM public.notifications n
  WHERE n.user_id = _me
    AND n.type LIKE ('roommate_connect_request:' || _sender::text || ':%')
  ORDER BY n.created_at DESC
  LIMIT 1;

  -- 1) Share contacts (existing behaviour)
  INSERT INTO public.notifications (user_id, title, body, type, link) VALUES
    (_sender, '✅ Roommate request accepted',
     COALESCE(_me_name,'A student') || ' accepted your request. Contact: ' || _me_phone,
     'roommate_connect_accepted', '/notifications.html'),
    (_me,     '📞 Contact shared',
     'You accepted ' || COALESCE(_s_name,'a student') || '. Their contact: ' || _s_phone,
     'roommate_connect_accepted', '/notifications.html');

  -- 2) Cascade cleanup — only when we could identify the property
  IF _prop_key IS NOT NULL AND length(_prop_key) > 0 THEN
    -- 2a) Mark the acceptor's own roommate listing on this property as matched
    UPDATE public.roommate_requests
      SET status = 'matched',
          match_partner_id = _sender,
          updated_at = now()
      WHERE property_key = _prop_key
        AND student_id = _me
        AND status = 'searching';

    -- 2b) Also mark the sender's listing if one exists (mutual pairing)
    UPDATE public.roommate_requests
      SET status = 'matched',
          match_partner_id = _me,
          updated_at = now()
      WHERE property_key = _prop_key
        AND student_id = _sender
        AND status = 'searching';

    -- 2c) Notify + delete competing pending offers to the acceptor for the same property
    FOR _competitor IN
      SELECT id, split_part(type, ':', 2)::uuid AS competitor_id
      FROM public.notifications
      WHERE user_id = _me
        AND type LIKE 'roommate_connect_request:%:' || _prop_key
        AND type NOT LIKE 'roommate_connect_request:' || _sender::text || ':%'
    LOOP
      INSERT INTO public.notifications (user_id, title, body, type, link)
      VALUES (
        _competitor.competitor_id,
        '🔒 Room filled',
        'This bed space has been successfully claimed by another student peer. Keep searching — new listings are posted daily.',
        'roommate_room_filled',
        '/detail.html?key=' || _prop_key
      );
      DELETE FROM public.notifications WHERE id = _competitor.id;
    END LOOP;
  END IF;
END;
$$;
