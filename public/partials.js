// Header & footer injectors + shared auth bootstrap
(function () {
  const path = location.pathname.split('/').pop() || 'home.html';

  // Inject the shared auth module once
  if (!document.querySelector('script[data-shf-auth]')) {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = '/js/auth.js';
    s.dataset.shfAuth = '';
    document.head.appendChild(s);
  }

  function renderAuth(user) {
    if (!user) {
      return `<a href="/login.html" class="btn btn-primary" style="padding:.55rem 1.1rem;">Sign In</a>`;
    }
    return `<div class="user-menu" style="position:relative;">
       <button class="btn btn-outline" data-user-toggle style="padding:.5rem .9rem; display:inline-flex; align-items:center; gap:.5rem;">
         <i class="fas fa-user-circle"></i>
         <span style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.name || user.email}</span>
         <i class="fas fa-chevron-down" style="font-size:.7rem;"></i>
       </button>
       <div class="user-dropdown" style="display:none; position:absolute; right:0; top:calc(100% + .5rem); background:var(--surface); border:1px solid var(--border); border-radius:10px; box-shadow:0 10px 30px -10px rgba(0,0,0,.2); min-width:200px; z-index:1000;">
         <div style="padding:.75rem 1rem; border-bottom:1px solid var(--border);">
           <div style="font-weight:600; font-size:.9rem;">${user.name || 'Account'}</div>
           <div style="font-size:.8rem; color:var(--text-muted);">${user.email}</div>
           ${user.role ? `<div style="font-size:.75rem; color:var(--primary); margin-top:.2rem; text-transform:capitalize;"><i class="fas fa-circle-check"></i> ${user.role}</div>` : ''}
         </div>
         ${user.role === 'landlord' ? `<a href="/dashboard.html" style="display:block; padding:.6rem 1rem; color:var(--text); text-decoration:none;"><i class="fas fa-gauge-high"></i> Landlord dashboard</a>` : ''}
         <a href="/listings.html" style="display:block; padding:.6rem 1rem; color:var(--text); text-decoration:none;"><i class="fas fa-house"></i> Browse listings</a>
         <button data-logout style="display:block; width:100%; text-align:left; padding:.6rem 1rem; background:none; border:none; color:var(--text); cursor:pointer; font:inherit;"><i class="fas fa-sign-out-alt"></i> Log out</button>
       </div>
     </div>`;
  }

  const header = `
<div id="preloader"><div class="spinner"></div></div>
<header class="site-header">
  <nav class="nav">
    <a href="/home.html" class="logo"><i class="fas fa-home"></i> Smart House Finder</a>
    <ul class="nav-links">
      <li><a href="/home.html" class="${path==='home.html'?'active':''}">Home</a></li>
      <li><a href="/listings.html" class="${path==='listings.html'?'active':''}">Listings</a></li>
      <li><a href="/map.html" class="${path==='map.html'?'active':''}">Map</a></li>
      <li><a href="/pricing.html" class="${path==='pricing.html'?'active':''}">Pricing</a></li>
      <li><a href="/home.html#about" class="${path==='about.html'?'active':''}">About</a></li>
      <li><a href="/contact.html" class="${path==='contact.html'?'active':''}">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" data-theme-toggle aria-label="Toggle theme"><i data-theme-icon class="fas fa-moon"></i></button>
      <span id="shf-auth-block">${renderAuth(null)}</span>
      <button class="icon-btn hamburger" data-menu-toggle aria-label="Menu"><i class="fas fa-bars"></i></button>
    </div>
  </nav>
</header>`;

  const footer = `
<footer class="site-footer">
  <div class="container footer-row">
    <p>&copy; 2026 Smart House Finder. All rights reserved.</p>
    <div class="social">
      <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
      <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
      <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
      <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
    </div>
  </div>
</footer>
<button id="backTop" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>
<div class="lightbox" role="dialog" aria-label="Image viewer">
  <button class="lightbox-close" aria-label="Close"><i class="fas fa-times"></i></button>
  <img src="" alt="Preview" />
</div>`;

  function applyAuth() {
    const block = document.getElementById('shf-auth-block');
    const a = window.SHF_AUTH;
    if (!block || !a) return;
    const user = a.session
      ? { email: a.session.user.email, name: a.profile?.full_name, role: a.role }
      : null;
    block.innerHTML = renderAuth(user);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const h = document.getElementById('header-mount');
    const f = document.getElementById('footer-mount');
    if (h) h.outerHTML = header;
    if (f) f.outerHTML = footer;

    applyAuth();
    window.addEventListener('shf-auth-ready', applyAuth);

    document.addEventListener('click', async (e) => {
      const toggle = e.target.closest('[data-user-toggle]');
      const dd = document.querySelector('.user-dropdown');
      if (toggle && dd) {
        dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
        return;
      }
      if (e.target.closest('[data-logout]')) {
        try { await window.SHF_AUTH?.supabase?.auth?.signOut(); } catch(_){}
        try { localStorage.removeItem('shf-user'); } catch(_){}
        location.href = '/home.html';
        return;
      }
      if (dd && !e.target.closest('.user-menu')) dd.style.display = 'none';
    });
  });
})();
