## Problem
On `map.html`, clicking the user profile button opens a dropdown that appears behind the Leaflet map. Leaflet's map panes and controls use z-index values up to ~700, but the dropdown in `public/partials.js` is set to `z-index: 1000` on the dropdown itself — however its parent `.user-menu` / `.site-header` stacking context isn't high enough relative to the Leaflet map container, so the dropdown gets clipped behind map tiles/controls.

## Fix
Raise the stacking of the site header (and therefore its descendants, including the dropdown) above Leaflet's panes.

### Change
In `public/css/styles.css`, ensure `.site-header` has `z-index: 1000` (above Leaflet's max ~700) and `position: fixed/sticky` so it establishes a stacking context. If already set, bump to `z-index: 1001`.

As a belt-and-suspenders fix, also bump the inline `.user-dropdown` `z-index` in `public/partials.js` from `1000` to `1001`.

No other files touched. No logic changes.
