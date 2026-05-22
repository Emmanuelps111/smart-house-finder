## Goal
Merge the About page content into the bottom of the Home page (after the Testimonials section), so visitors see the About story as a continuation of the home page.

## Changes

**1. `public/home.html`** — append three new sections directly after the Testimonials `<section>` and before `<div id="footer-mount">`:
- **Our story** — two-column layout: eyebrow "Our story", heading "Built by students, for students", the two paragraphs from About, plus the team image (`picsum.photos/seed/about1`).
- **Trusted nationwide** — stats grid (50k+ renters, 4,200 landlords, 98% satisfaction) on the `--surface` background.
- **Inside our community** — masonry gallery with the 6 `picsum.photos/seed/g1…g6` images.

Content is copied verbatim from `public/about.html` (Tanzania-friendly text already matches). Reveal animations use the existing `.reveal` class which `app.js` already wires up.

**2. Header nav (`public/partials.js`)** — handle the now-redundant About link. Two options:
- **A.** Keep "About" in the nav but point it to `/home.html#about` (anchor scroll to the new section). Add `id="about"` to the Our story section.
- **B.** Remove the About link entirely from the nav.

I'll go with **A** (keep the link, anchor-scroll to the merged section) so existing inbound links/menus still work.

**3. `public/about.html`** — leave the file in place so old bookmarks still resolve; no edits needed. (If you'd prefer it deleted or redirected to `/home.html#about`, say so.)

## Notes
- No changes to `data.js`, `detail.html`, auth flow, or any backend.
- Pure HTML/CSS edit using existing design tokens and classes — no new styles needed.