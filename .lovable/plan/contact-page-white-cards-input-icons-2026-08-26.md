# Contact Page: White Cards + Input Icons

## Problem
On the Contact page (`public/contact.html`), the two `.ssm-card` blocks render dark navy (≈ `#0b1220`) because a `@media (prefers-color-scheme: dark)` block overrides the base white card style. The user wants the cards to be **white, matching the rest of the website**, with text colors that stay clearly visible on white. The Name and Email form fields are plain inputs with no icons.

## Scope
File: `public/contact.html` only (inline `<style>` + form markup). No backend, no other pages.

## Changes

### 1. Force white cards (remove the dark-mode override)
- Delete the `@media (prefers-color-scheme: dark) { ... }` block (lines 75–93) so the cards always use the base `.ssm-card` style: `background: rgba(255,255,255,0.85)` with `color: #1e293b` (slate-800) text and slate-900 headings.
- This keeps the existing high-contrast white-on-dark-text look that matches the site's light theme; inputs stay slate-50 fill with slate-800 text. No other color tweaks needed — the base rules already have proper contrast.

### 2. Add icons to the Name, Email (and Message) inputs
- Wrap each of the Name and Email `.form-row` inputs in a relative-positioned `.ssm-field` container.
- Place a FontAwesome icon absolutely on the left:
  - Name → `fa-user`
  - Email → `fa-envelope`
  - Message → `fa-comment` (optional, for visual consistency)
- Add `padding-left: 2.5rem` to those inputs so typed text never overlaps the icon.
- Icon color: `var(--primary)` (brand blue), muted slightly so it sits behind the text.
- Label stays above the field as-is.

```html
<div class="form-row">
  <label for="cf-name">Name</label>
  <div class="ssm-field">
    <i class="fas fa-user ssm-field-icon"></i>
    <input id="cf-name" type="text" placeholder="" />
  </div>
  <span class="error"></span>
</div>
```

### New CSS (added to the inline `<style>`)
```css
.ssm-field { position: relative; }
.ssm-field-icon {
  position: absolute; left: .9rem; top: 50%; transform: translateY(-50%);
  color: var(--primary); opacity: .85; font-size: .95rem; pointer-events: none;
}
.ssm-field input, .ssm-field textarea { padding-left: 2.5rem; }
/* textarea icon sits at top-left instead of vertically centered */
.ssm-field textarea + .ssm-field-icon,
.ssm-field:has(textarea) .ssm-field-icon { top: .9rem; transform: none; }
```

## Verification
- Open `/contact.html` in the preview (light theme is the site default).
- Confirm both cards are white with dark, clearly-readable text.
- Confirm Name and Email (and Message) inputs show a left-aligned brand-blue icon with no text overlap.
- Toggle OS dark mode on/off — cards must stay white (no longer flip to navy).
