
CREATE OR REPLACE FUNCTION public.send_roommate_connect(_target uuid, _property_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _me uuid := auth.uid();
        _my_name text;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _me = _target THEN RAISE EXCEPTION 'Cannot connect to yourself'; END IF;
  SELECT full_name INTO _my_name FROM public.profiles WHERE id = _me;
  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (
    _target,
    '🤝 New roommate connect request',
    COALESCE(_my_name, 'A student') || ' would like to be your roommate. Open notifications to accept and share contacts.',
    'roommate_connect_request:' || _me::text || ':' || COALESCE(_property_key, ''),
    '/notifications.html'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_roommate_connect(_sender uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _me uuid := auth.uid();
        _me_name text; _me_phone text;
        _s_name text;  _s_phone text;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT full_name, phone INTO _me_name, _me_phone FROM public.profiles WHERE id = _me;
  SELECT full_name, phone INTO _s_name,  _s_phone  FROM public.profiles WHERE id = _sender;
  IF _s_phone IS NULL OR _me_phone IS NULL THEN
    RAISE EXCEPTION 'Both students must have a phone number set on their profile before sharing contact.';
  END IF;
  INSERT INTO public.notifications (user_id, title, body, type, link) VALUES
    (_sender, '✅ Roommate request accepted',
     COALESCE(_me_name,'A student') || ' accepted your request. Contact: ' || _me_phone,
     'roommate_connect_accepted', '/notifications.html'),
    (_me,     '📞 Contact shared',
     'You accepted ' || COALESCE(_s_name,'a student') || '. Their contact: ' || _s_phone,
     'roommate_connect_accepted', '/notifications.html');
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_roommate_connect(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_roommate_connect(uuid) TO authenticated;
