// Shared Lovable Cloud (Supabase) client + toast helper for static HTML pages.
(function () {
  const SUPABASE_URL = 'https://pfqzpqcvvypanpmxrokl.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpwcWN2dnlwYW5wbXhyb2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDE2MTksImV4cCI6MjA5NDE3NzYxOX0.ebvqPbyqZMviZmR5tIUzh19wbTKp4gm57eXSSGwfFJs';

  // --- Toast ----------------------------------------------------------------
  function ensureToastRoot() {
    let root = document.getElementById('shf-toast-root');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'shf-toast-root';
    root.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:340px;';
    document.body.appendChild(root);
    const style = document.createElement('style');
    style.textContent = `
      .shf-toast{padding:.85rem 1rem;border-radius:10px;color:#fff;font:500 .9rem/1.35 Inter,system-ui,sans-serif;
        box-shadow:0 8px 24px rgba(0,0,0,.15);display:flex;gap:.6rem;align-items:flex-start;
        animation:shfIn .2s ease-out;}
      .shf-toast.success{background:#10b981}
      .shf-toast.error{background:#ef4444}
      .shf-toast.info{background:#3B82F6}
      .shf-toast i{margin-top:2px}
      @keyframes shfIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
    `;
    document.head.appendChild(style);
    return root;
  }
  function toast(msg, type = 'info', ms = 4000) {
    const root = ensureToastRoot();
    const icon = type === 'success' ? 'circle-check' : type === 'error' ? 'circle-exclamation' : 'circle-info';
    const el = document.createElement('div');
    el.className = `shf-toast ${type}`;
    el.innerHTML = `<i class="fas fa-${icon}"></i><span></span>`;
    el.querySelector('span').textContent = msg;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .2s'; setTimeout(() => el.remove(), 200); }, ms);
  }
  toast.success = (m) => toast(m, 'success');
  toast.error = (m) => toast(m, 'error');
  toast.info = (m) => toast(m, 'info');

  // --- Supabase client (lazy-load from CDN) ---------------------------------
  let clientPromise = null;
  function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = new Promise((resolve, reject) => {
      if (window.supabase && window.supabase.createClient) {
        return resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage },
        }));
      }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = () => resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage },
      }));
      s.onerror = () => reject(new Error('Failed to load Supabase client'));
      document.head.appendChild(s);
    });
    return clientPromise;
  }

  // Sync local "shf-user" cache from auth + profiles + user_roles
  async function syncLocalUser(sb, session) {
    if (!session || !session.user) { localStorage.removeItem('shf-user'); return null; }
    const uid = session.user.id;
    const [{ data: prof }, { data: roles }] = await Promise.all([
      sb.from('profiles').select('full_name,phone,agency_status').eq('id', uid).maybeSingle(),
      sb.from('user_roles').select('role').eq('user_id', uid),
    ]);
    const role = (roles && roles[0] && roles[0].role) || 'renter';
    const cached = {
      id: uid,
      email: session.user.email,
      name: (prof && prof.full_name) || session.user.email.split('@')[0],
      phone: (prof && prof.phone) || '',
      role,
      agency_status: (prof && prof.agency_status) || 'none',
    };
    localStorage.setItem('shf-user', JSON.stringify(cached));
    return cached;
  }

  async function init() {
    const sb = await getClient();
    const { data: { session } } = await sb.auth.getSession();
    await syncLocalUser(sb, session);
    sb.auth.onAuthStateChange((_e, s) => { syncLocalUser(sb, s); });
    return sb;
  }

  const ready = init();

  window.SHFCloud = {
    ready,            // resolves to supabase client
    getClient,
    toast,
    syncLocalUser,
  };
  window.toast = toast;
})();
