Remove the "Continue with Google" button (and its divider) from the auth pages, leaving only email/password flows. No other logic changes.

Files to update:
- `public/login.html` — remove Google button, divider, and its click handler
- `public/signup.html` (if present) — same removal
- `public/select-role.html` / `public/auth-callback.html` — leave intact (harmless if Google is unused)

Nothing else touched. Google OAuth can be re-added later.