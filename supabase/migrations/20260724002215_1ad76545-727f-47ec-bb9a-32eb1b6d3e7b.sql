DROP POLICY IF EXISTS "Anyone can view property videos" ON storage.objects;
CREATE POLICY "Owners and admins can view property videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'property-videos'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.is_admin(auth.uid())
  )
);