CREATE OR REPLACE FUNCTION public.accept_roommate_connect(_sender uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _me uuid := auth.uid();
        _me_name text; _me_phone text;
        _s_name text;  _s_phone text;
        _prop_key text;
        _my_req_id uuid;
        _sender_req_id uuid;
        _competitor RECORD;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;

  SELECT full_name, phone INTO _me_name, _me_phone FROM public.profiles WHERE id = _me;
  SELECT full_name, phone INTO _s_name,  _s_phone  FROM public.profiles WHERE id = _sender;

  IF _s_phone IS NULL OR _me_phone IS NULL THEN
    RAISE EXCEPTION 'Both students must have a phone number set on their profile before sharing contact.';
  END IF;

  SELECT split_part(n.type, ':', 3) INTO _prop_key
  FROM public.notifications n
  WHERE n.user_id = _me
    AND n.type LIKE ('roommate_connect_request:' || _sender::text || ':%')
  ORDER BY n.created_at DESC
  LIMIT 1;

  INSERT INTO public.notifications (user_id, title, body, type, link) VALUES
    (_sender, '✅ Roommate request accepted',
     COALESCE(_me_name,'A student') || ' accepted your request. Contact: ' || _me_phone,
     'roommate_connect_accepted', '/notifications.html'),
    (_me,     '📞 Contact shared',
     'You accepted ' || COALESCE(_s_name,'a student') || '. Their contact: ' || _s_phone,
     'roommate_connect_accepted', '/notifications.html');

  IF _prop_key IS NOT NULL AND length(_prop_key) > 0 THEN
    -- Look up each side's roommate_request row for this property (FK target = roommate_requests.id)
    SELECT id INTO _my_req_id
      FROM public.roommate_requests
      WHERE property_key = _prop_key AND student_id = _me AND status = 'searching'
      ORDER BY created_at DESC LIMIT 1;

    SELECT id INTO _sender_req_id
      FROM public.roommate_requests
      WHERE property_key = _prop_key AND student_id = _sender AND status = 'searching'
      ORDER BY created_at DESC LIMIT 1;

    IF _my_req_id IS NOT NULL THEN
      UPDATE public.roommate_requests
        SET status = 'matched',
            match_partner_id = _sender_req_id, -- may be NULL if sender has no listing; FK allows NULL
            updated_at = now()
        WHERE id = _my_req_id;
    END IF;

    IF _sender_req_id IS NOT NULL THEN
      UPDATE public.roommate_requests
        SET status = 'matched',
            match_partner_id = _my_req_id,
            updated_at = now()
        WHERE id = _sender_req_id;
    END IF;

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
$function$;