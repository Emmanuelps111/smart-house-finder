## Goal
Replace the mock localStorage "auth" with real Lovable Cloud authentication: email/password + Google sign-in, role-based accounts (student / landlord), and gated landlord pages.

## Database (migration)

1. **`profiles` table** — `id` (PK = `auth.users.id`), `full_name`, `phone`, `national_id`, `created_at`, `updated_at`. RLS: each user can read/update only their own row. Trigger on `auth.users` insert auto-creates a profile row.
2. **`app_role` enum** — `student`, `landlord`, `admin`.
3. **`user_roles` table** — `(user_id, role)` unique. RLS: users can read their own roles only; inserts handled by signup trigger.
4. **`has_role(user_id, role)` SECURITY DEFINER function** — to be used in future RLS for listings/messages without recursion.
5. Signup trigger reads `raw_user_meta_data.role` and inserts the matching `user_roles` row (defaults to `student`).

## Auth wiring

6. **`public/login.html`** — replace the mock submit handler with:
   - Sign in: `supabase.auth.signInWithPassword({ email, password })`
   - Sign up: `supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name, role, phone, national_id } } })`
   - Google button (new): `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
   - Email **verification ON** (default, more secure). After signup, show "Check your email to confirm" message.
   - On success, redirect: students → `/listings.html`, landlords → `/dashboard.html`.
7. **`supabase--configure_social_auth`** — enable Google provider so the OAuth call doesn't fail.
8. **`public/partials.js`** — header shows "Sign in" when logged out, and email + "Sign out" when logged in (uses `supabase.auth.getSession()` + `onAuthStateChange`).
9. **`public/dashboard.html`** — guard at top of script: if no session or role ≠ landlord, redirect to `/login.html`.
10. **`/reset-password` page** (`public/reset-password.html`) + a "Forgot password?" link on login that calls `resetPasswordForEmail` with `redirectTo: origin + '/reset-password.html'`.

## Out of scope (kept for a follow-up)

- National ID **file upload** to Storage — for now we only collect the ID number text field. I'll add a `landlord-ids` private bucket + upload flow when you ask.
- Wiring listings / messages / favorites to real DB rows — current mock data in `data.js` stays for now.

## Notes
- The static HTML pages already include the Supabase client via the existing scripts; I'll add `<script type="module">` blocks that import from `/src/integrations/supabase/client.ts` via a small bridge file, or use the CDN UMD build directly in the HTML — I'll pick the simplest that fits the current setup.
- Existing `localStorage 'shf-user'` reads elsewhere will be replaced with a small helper that returns the live Supabase session/role.
