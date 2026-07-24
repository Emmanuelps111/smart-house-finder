## Problem

On `public/detail.html`, the two-column `.detail-grid` (`1.4fr 1fr`) collapses/stretches when a roommate request contains a very long unbroken string (e.g. "sshhshshshshshs…"). CSS grid tracks with `fr` still expand to their content's min-size, and neither the grid columns nor `.rm-quote` currently allow that text to break, so the left column pushes wider than its track, shoving the gallery, "About this property", and reviews out of the side-by-side frame.

## Fix (CSS-only, `public/detail.html`)

1. Add `min-width: 0;` to `.detail-grid > *` so each column respects its `fr` track instead of growing to fit unbreakable content.
2. Add `overflow-wrap: anywhere; word-break: break-word;` to `.rm-quote` (the long bio quote) and to `.rm-summary` / `.rm-name` for safety, so pathological strings wrap inside the card.
3. Add the same wrap rules to the property description block ("About this property") and reviews text to prevent identical overflow from those sources.
4. Ensure the embedded map wrapper has `min-width: 0; overflow: hidden;` and its `#map` container keeps `width:100%` so it stays framed inside the right column on all viewports.

No JS or data changes. No visual restyle beyond wrapping behavior. Mobile stacked layout (`@media max-width:900px`) remains untouched.

## Verification

- Reload a detail page, expand a roommate card with the long test string from the screenshot; the left column stays inside its track and the gallery/about/reviews stay aligned with the right column.
- Map still renders full-width inside the right column with rounded corners intact.
