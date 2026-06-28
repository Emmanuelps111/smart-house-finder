
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_url text;

-- Storage policies for property-videos bucket
CREATE POLICY "Anyone can view property videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-videos');

CREATE POLICY "Landlords can upload their own property videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Landlords can update their own property videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Landlords can delete their own property videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
