# Contact Page: Cards Adapt to Site Dark Mode

## Context
Earlier the contact cards were forced white by removing the `@media (prefers-color-scheme: dark)` override. That followed the OS color scheme, not the site's theme. The site's dark mode is a **toggle** (`public/js/app.js`) that sets `data-theme="dark"` on `<html>`. The user now wants the contact cards to **adapt to the site's dark mode** — white in light mode, dark navy with readable light text when dark mode is toggled on.

## Scope
File: `public/contact.html` only (inline `<style>`). No markup changes — icons added last turn stay.

## Change
Add a `[data-theme="dark"]`-scoped block that restyles the `.ssm-card` family for dark mode, mirroring the previous dark values but keyed to the site toggle:

```css
[data-theme="dark"] .ssm-card {
  background: rgba(9,17,36,0.85);            /* dark navy */
  border-color: rgba(30,41,59,0.8);
  color: #f1f5f9;                            /* slate-100 */
  box-shadow: 0 10px 30px -12px rgba(0,0,0,0.5);
}
[data-theme="dark"] .ssm-card h2 { color: #f8fafc; }
[data-theme="dark"] .ssm-card .info-line { color: #f1f5f9; }
[data-theme="dark"] .ssm-form label { color: #f1f5f9; }
[data-theme="dark"] .ssm-form input,
[data-theme="dark"] .ssm-form textarea {
  background: rgba(15,23,42,0.9);            /* slate-900/90 */
  border-color: rgba(30,41,59,0.9);
  color: #f8fafc;
}
[data-theme="dark"] .ssm-form input:focus,
[data-theme="dark"] .ssm-form textarea:focus { background: rgba(15,23,42,1); }
```

- Light mode (default): cards stay white (`rgba(255,255,255,0.85)`) with slate-800 text. Unchanged.
- Dark mode (toggle on): cards flip to dark navy with light, readable text; inputs become slate-900 fill with light text.
- The existing input-field icon CSS (`.ssm-field`, `.ssm-field-icon`) needs no change — icons use `var(--primary)` brand blue, which reads well on both themes.

## Verification
- Load `/contact.html` in light mode → white cards, dark text, blue input icons.
- Click the theme toggle (moon/sun in header) → cards turn dark navy, text turns light, inputs darken, icons stay brand blue and visible.
