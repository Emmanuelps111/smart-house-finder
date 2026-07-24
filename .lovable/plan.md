## Goal

Replace the broken 6-digit OTP flow for students with the default Supabase magic-link confirmation, keep the UDSM institutional email gate, and move student profile auto-approval into `auth-callback.html`.

## Changes

### 1. `public/login.html`

- Remove the `showStudentOtpPanel` function entirely (the 6-digit input, `verifyOtp` calls, resend button, and stored `__pendingStudentOtp` state).
- Keep the UDSM email gate: `/@(student\.udsm\.ac\.tz|udsm\.ac.tz)$/` regex plus the `showInstitutionalGateError` helper.
- In the signup handler, when `role === 'student'`:
  - Call `sb.auth.signUp({ email, password, options: { emailRedirectTo: <origin>/auth-callback.html, data: { full_name, role: 'student', phone, university, student_reg_no, is_student_pending_approval: true } } })`.
  - After signUp returns without error, save the security question (if provided) using the existing helper.
  - Show a "Check your MakaziLink email" panel (reuse `showFinalPanel` styling) telling the student to click the confirmation link sent to their UDSM address. No code input, no `verifyOtp`.
- Keep landlord/renter branches unchanged.

### 2. `public/auth-callback.html`

- After the session hydrates and before the role-based redirect, detect first-time student confirmations:
  - Read the signed-in user's `user_roles` (already done) and `profiles` row.
  - If the role is `student` AND `verification_status` is not `approved`, run a single `UPDATE profiles` setting `verification_status = 'approved'`, `verified_at = now()`, and copy `phone`, `university`, `student_reg_no` from `session.user.user_metadata` when the profile columns are empty.
  - Then re-sync the local cache via `SHFCloud.syncLocalUser`.
- Route students to `/listings.html` (unchanged), landlords to `/dashboard.html`, admins to `/admin`.
- Keep the existing "no roles → /select-role.html" branch: if a Google/OAuth student ever lands here without a role, the role-picker still handles them.

### 3. Documentation-only touches (no logic change)

- Update the small helper text under the student signup form (if present) to mention "we'll email you a confirmation link" instead of "6-digit code".

## Out of scope

- No email domain setup, no custom auth templates, no `scaffold_auth_email_templates`. The default Supabase confirmation email (which contains the magic link) is what the student receives.
- No changes to landlord OCR flow, renter auto-approve, forgot-password, or admin surfaces.

## Verification

- Read `public/login.html` and `public/auth-callback.html` after edits to confirm no leftover `verifyOtp`, `stOtp`, `showStudentOtpPanel`, or 6-digit UI references remain.
- Manual smoke steps for the user: sign up as a student with a `@student.udsm.ac.tz` address → receive email → click confirmation link → land on `/auth-callback.html` → auto-approved → redirected to `/listings.html`.