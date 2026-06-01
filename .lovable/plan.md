
## Why the buttons appear "dead"

The pages under `/public` (`login.html`, `dashboard.html`) are static HTML — they were never wired to Lovable Cloud. The submit handlers exist, but they only write to `localStorage` and call `alert(...)`. No Supabase client is loaded on these pages, so there is no auth call, no network traffic, and no console output beyond a generic `alert`. The React `/admin` route is the only place currently talking to the backend.

The fix is to actually wire these three forms to Lovable Cloud, prevent default refreshes, and show toast notifications.

## Plan

### 1. Shared Cloud + toast helper (new `public/js/cloud.js`)

- Load `@supabase/supabase-js` from CDN and create a singleton client using `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (hard-coded publishable values; they're safe in the browser).
- Persist the session in `localStorage` so the existing `shf-user` UI keeps working.
- Subscribe to `onAuthStateChange` to keep `localStorage['shf-user']` (name, email, role) in sync from the `profiles` + `user_roles` tables.
- Export a tiny `toast(msg, type)` helper that renders top-right cards with success/error styling (no external dep).

Include this script via `<script src="/js/cloud.js"></script>` in `login.html`, `dashboard.html`, and `partials.js` (so the nav also knows the auth state).

### 2. Sign-Up / Sign-In (`public/login.html`)

Rewrite the submit handler:

- `e.preventDefault()` is already there — keep it.
- **Sign in**: `await supabase.auth.signInWithPassword({ email, password })`. On success → `toast.success('Welcome back')`, redirect to `?next=` or `/dashboard.html` (landlord) / `/listings.html` (renter). On error → `toast.error(error.message)` and re-enable the button.
- **Sign up**: `await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name, phone, national_id, role } } })`. The existing `handle_new_user` trigger reads these from `raw_user_meta_data` and seeds `profiles` + `user_roles`. Landlord verification documents stay client-only for now (no storage bucket change in this pass) but the form still validates them.
- Disable the submit button + show a spinner while the request is in flight to make "unresponsive" impossible.
- Replace every `alert(...)` with `toast(...)`.

### 3. Publish Listing (`public/dashboard.html`)

- Gate the page: on load, `await supabase.auth.getUser()`; if not signed-in or role ≠ `landlord`/`admin`, toast + redirect to `/login.html`.
- Replace the localStorage write in the submit handler with an `INSERT` into `public.properties` using the authenticated user. Map form fields → columns: `title`, `description` (form description), `address` (`neighbourhood, city`), `price`, `landlord_id = user.id`, `status` stays `'pending'` by default so admin moderation works.
- Persist the extra fields (`city`, `neighbourhood`, `furnishing`, `beds`, `baths`, `size`, `amenities`, `deposit`, `available_from`, `contact_phone`, `lat`, `lng`, `image_urls`) — these columns don't exist today, so a small migration adds them (see Technical section).
- Image uploads: create a public `property-photos` storage bucket (migration), upload each selected photo to `property-photos/{user_id}/{listing_id}/{filename}`, collect the public URLs, and write them into `properties.image_urls text[]`.
- On success → `toast.success('Listing submitted for review')`, reset the form, re-render "My listings" from the DB (replace the current `getMine()` localStorage helper with a `select * from properties where landlord_id = auth.uid()`).
- On error → `toast.error(error.message)`, button re-enabled.

### 4. Tidy

- Remove the now-unused `getMine() / saveMine()` localStorage helpers from `dashboard.html`.
- Keep the existing static HTML structure — no React rewrite.

## Technical section

**Migration** (single `supabase--migration` call):

```sql
-- Extend properties to match the listing form
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

-- Public photo bucket + policies
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
```

**Existing pieces reused unchanged:**
- `handle_new_user` trigger → already seeds `profiles` + `user_roles` from `raw_user_meta_data`.
- RLS on `properties` → landlord-insert / admin-moderate policies already in place.
- `partials.js` admin nav gating → kept; just driven by the now-real session.

**Auth config:** keep email confirmation ON (current default). The sign-up success toast will tell users to check email.

## Files touched

- New: `public/js/cloud.js`
- Edit: `public/login.html` (handler + script tag)
- Edit: `public/dashboard.html` (gate, INSERT, upload, render from DB)
- Edit: `public/partials.js` (load cloud.js, sync nav from real session)
- Migration: schema + storage bucket above
