import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  answer: z.string().min(1).max(200),
  new_password: z.string().min(8).max(128),
});

export const Route = createFileRoute('/api/public/reset-password')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.json();
          const parsed = bodySchema.safeParse(raw);
          if (!parsed.success) {
            return Response.json({ ok: false, error: 'Invalid input.' }, { status: 400 });
          }
          const { email, answer, new_password } = parsed.data;

          const url = process.env.SUPABASE_URL!;
          const publishable = process.env.SUPABASE_PUBLISHABLE_KEY!;

          // Use publishable client to call the rate-limited verify RPC
          const pub = createClient<Database>(url, publishable, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: {
              fetch: (input, init) => {
                const h = new Headers(init?.headers);
                if (publishable.startsWith('sb_') && h.get('Authorization') === `Bearer ${publishable}`) {
                  h.delete('Authorization');
                }
                h.set('apikey', publishable);
                return fetch(input, { ...init, headers: h });
              },
            },
          });

          const { data: userId, error: rpcErr } = await pub.rpc('verify_security_answer', {
            _email: email,
            _answer: answer,
          });

          if (rpcErr || !userId) {
            // Generic message — do not leak whether email exists or was locked
            return Response.json(
              { ok: false, error: 'Invalid details, or too many attempts. Try again later.' },
              { status: 401 }
            );
          }

          // Verified — use admin API to update password
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId as string, {
            password: new_password,
          });
          if (updErr) {
            return Response.json({ ok: false, error: 'Could not update password.' }, { status: 500 });
          }

          return Response.json({ ok: true });
        } catch (err) {
          console.error('[reset-password] error', err);
          return Response.json({ ok: false, error: 'Server error.' }, { status: 500 });
        }
      },
    },
  },
});
