// Shared auth module for static HTML pages.
// Loaded as <script type="module"> by partials.js on every page.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.4";
import { createLovableAuth } from "https://esm.sh/@lovable.dev/cloud-auth-js@1.1.2";

const SUPABASE_URL = "https://pfqzpqcvvypanpmxrokl.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpwcWN2dnlwYW5wbXhyb2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDE2MTksImV4cCI6MjA5NDE3NzYxOX0.ebvqPbyqZMviZmR5tIUzh19wbTKp4gm57eXSSGwfFJs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "shf-auth",
  },
});

const lovableAuth = createLovableAuth();
export const lovable = {
  auth: {
    signInWithOAuth: async (provider, opts = {}) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts.redirect_uri,
        extraParams: opts.extraParams || {},
      });
      if (result.redirected || result.error) return result;
      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    },
  },
};

async function loadAuthState() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  let role = null;
  let profile = null;
  if (session) {
    const [{ data: roles }, { data: p }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", session.user.id),
      supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
    ]);
    role = roles?.[0]?.role || null;
    profile = p || null;
  }
  window.SHF_AUTH = { supabase, lovable, session, role, profile, ready: true };
  window.dispatchEvent(new CustomEvent("shf-auth-ready", { detail: window.SHF_AUTH }));
}

window.SHF_AUTH = { supabase, lovable, session: null, role: null, profile: null, ready: false };
loadAuthState();
supabase.auth.onAuthStateChange(() => loadAuthState());
