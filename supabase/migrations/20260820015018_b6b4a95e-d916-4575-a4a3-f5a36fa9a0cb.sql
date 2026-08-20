REVOKE SELECT ON public.properties FROM anon;

GRANT SELECT (
  id, landlord_id, title, description, address, price, status,
  created_at, updated_at, city, neighbourhood, furnishing, beds, baths,
  size_sqm, deposit_months, available_from, lat, lng, amenities,
  image_urls, property_type, occupancy, video_url
) ON public.properties TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;