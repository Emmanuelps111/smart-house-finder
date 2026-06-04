## Problem

The admin dashboard shows "Access denied" because the `has_role` RPC call is returning HTTP 403 `permission denied for function has_role` (Postgres error 42501). Network logs confirm every `POST /rest/v1/rpc/has_role` from your signed-in session fails with this error.

The function exists and is correctly defined as `SECURITY DEFINER`, but the `authenticated` Postgres role was never granted `EXECUTE` permission on it, so PostgREST refuses the call before the function body even runs. That's why your account, even with the `admin` role in `user_roles`, can't pass the admin gate.

## Fix

Run a single migration that grants execute on the two role-check helpers to the API roles:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;
```

No frontend changes are needed — once the grant is in place, `supabase.rpc('has_role', ...)` will return `true` for your account and `/admin` will load.

## Verification

After the migration runs, reload `/admin` while signed in. The `rpc/has_role` request should switch from `403` to `200` with body `true`, and the dashboard should render.
