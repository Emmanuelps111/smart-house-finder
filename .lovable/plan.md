## Issues

1. **Renters don't see landlord-submitted properties.** `public/listings.html` (and `home.html`, `detail.html`, `map.html`) render only from `window.SHF_LISTINGS` in `public/js/data.js`, which is static mock data plus `localStorage['shf-user-listings']`. Landlord submissions go into the Supabase `properties` table, so they never appear for other renters on other devices.

2. **Broken JS string escapes in `public/detail.html`.** Inside a `<script>` (not a template literal), these lines use `\\'`:
   ```js
   btn.innerHTML = '<i class="fas fa-check"></i> You\\'re on the roommate list';
   window.toast.success('You\\'re now listed as looking for a roommate here!');
   ```
   `\\'` becomes a literal backslash followed by an unescaped `'`, which terminates the string early and throws a SyntaxError — so the whole `detail.html` inline script fails and the listing detail page never renders properly.

## Fix Plan

### 1. Fix string escapes in `public/detail.html`
Replace `\\'` with `\'` (proper single-quote escape) on both lines:
- `You\'re on the roommate list`
- `You\'re now listed as looking for a roommate here!`

### 2. Load properties from Supabase in `public/js/data.js`
Add an async loader that fetches the `properties` table and merges rows into `window.SHF_LISTINGS`, then dispatches a `shf:listings-updated` event so pages can re-render.

- Add `SHF.fetchDbListings()` that:
  - Awaits `window.SHFCloud.ready` to get the Supabase client.
  - `SELECT`s published rows from `properties` (id, title, price, beds/bedrooms, baths/bathrooms, area, city, neighborhood, tag, image/cover_image, lat, lng, description, etc.).
  - Maps each row to the listing shape used by the UI (`{ id, title, price, beds, baths, area, city, neighborhood, tag, img, lat, lng, desc }`). Use a string id prefix like `db-<uuid>` so they don't collide with numeric mock ids, and update detail-page lookup to handle both.
  - Appends to `window.SHF_LISTINGS`, re-applies the Dar-es-Salaam-first sort, and dispatches `shf:listings-updated`.
- Call it immediately at the bottom of `data.js`.

### 3. Re-render pages when DB listings arrive
- `public/listings.html`: wrap the existing `render()` call so it also runs on `shf:listings-updated`.
- `public/home.html`: same treatment for the featured grid.
- `public/detail.html`: change the lookup `+new URLSearchParams(...).get('id')` to a string compare, and re-run detail render on `shf:listings-updated` if the listing wasn't found on first paint (handles direct loads of `?id=db-...`).
- `public/map.html`: re-place markers on the same event (if it renders from `SHF_LISTINGS`).

### 4. Verify
- Confirm `properties` table has the columns we read; if column names differ (e.g. `bedrooms` vs `beds`), normalize in the mapper.
- Confirm RLS on `properties` allows `anon`/`authenticated` SELECT of published rows (it should already, since the landlord dashboard reads them; if not, that becomes a follow-up migration — call it out, don't silently add).

### Files touched
- `public/detail.html` (escape fix + string-id lookup + listen for update event)
- `public/js/data.js` (DB fetch + merge + event dispatch)
- `public/listings.html`, `public/home.html`, `public/map.html` (re-render on event)

No database schema changes needed.
