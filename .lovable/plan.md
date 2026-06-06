## Root cause

`public/detail.html` loads `/js/data.js` **before** `/js/cloud.js`. The DB-fetch in `data.js` guards with `if (!window.SHFCloud || !window.SHFCloud.ready) return;`, so on the detail page it bails out immediately, no `shf:listings-updated` event ever fires, and `db-<uuid>` ids are never found → "Listing not found". The current fallback calls `location.reload()`, which just repeats the same race forever.

(Other pages — listings/home/map — already load `cloud.js` first, which is why approved properties show up there but not on the detail page.)

## Fix

1. **`public/detail.html`** — Swap the script order so `cloud.js` loads before `data.js` (same order as the other pages).

2. **`public/detail.html`** — In the "not found on first paint" branch, replace `location.reload()` with an in-place re-render: when `shf:listings-updated` fires and the listing now exists, rebuild `#detailRoot` and re-run the thumbnail handlers, Leaflet map init, and roommate-section init. No reload loop risk, instant render once DB data arrives.

3. **`public/js/data.js`** (safety net) — If `SHFCloud` isn't defined yet when `fetchDbListings()` is first invoked, schedule one retry (e.g. on `DOMContentLoaded` or a short `setTimeout`) so any future page with mis-ordered scripts still recovers.

## Files touched
- `public/detail.html`
- `public/js/data.js`

No database, RLS, or other page changes.
