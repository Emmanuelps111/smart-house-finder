alter table public.properties
  add column if not exists city text,
  add column if not exists neighbourhood text,
  add column if not exists furnishing text,
  add column if not exists beds int,
  add column if not exists baths int,
  add column if not exists size_sqm numeric,
  add column if not exists deposit_months int,
  add column if not exists available_from date,
  add column if not exists contact_phone text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists amenities text[] default '{}',
  add column if not exists image_urls text[] default '{}',
  add column if not exists property_type text;

insert into storage.buckets (id, name, public)
  values ('property-photos', 'property-photos', true)
  on conflict (id) do nothing;

create policy "Public read property photos"
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "Landlords upload to own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'property-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Landlords manage own photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'property-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Landlords delete own photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-photos'
    and auth.uid()::text = (storage.foldername(name))[1]);