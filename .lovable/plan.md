## Problem

On `/map.html`, opening the profile dropdown shows it behind the map. Leaflet creates internal panes with `z-index` up to 700 (tiles 200, markers 600, popups 700, controls 1000). The `.site-header` is only `z-index: 100`, and `#map` has no `z-index`, so its children stack against the document root and end up above the header — taking the dropdown with them.

## Fix

In `public/css/styles.css`:

1. Raise `.site-header` to `z-index: 1000` so the header (and its dropdown) sits above all Leaflet panes.
2. Give `#map` `position: relative; z-index: 0;` to contain Leaflet's internal stacking inside its own context, so map panes can never escape above the header.

No HTML/JS changes; the inline `z-index: 1000` on `.user-dropdown` already works once the parent header outranks the map.