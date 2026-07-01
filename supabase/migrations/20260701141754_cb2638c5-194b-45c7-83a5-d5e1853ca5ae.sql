GRANT SELECT ON public.properties TO anon;
DROP POLICY IF EXISTS "Public can view approved properties" ON public.properties;
CREATE POLICY "Public can view approved properties" ON public.properties FOR SELECT TO anon USING (status = 'approved');