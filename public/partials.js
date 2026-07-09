// Header & footer injectors
(function () {
  const path = location.pathname.split('/').pop() || 'home.html';

  let user = null;
  try { user = JSON.parse(localStorage.getItem('shf-user') || 'null'); } catch (e) {}

  const bellBlock = user
    ? `<a href="/notifications.html" class="icon-btn shf-bell" aria-label="Notifications" style="position:relative;">
         <i class="fas fa-bell"></i>
         <span class="shf-bell-badge" style="display:none; position:absolute; top:-2px; right:-2px; background:#ef4444; color:#fff; font-size:.65rem; font-weight:700; min-width:18px; height:18px; padding:0 4px; border-radius:9px; line-height:18px; text-align:center; box-shadow:0 2px 6px rgba(239,68,68,.5);"></span>
       </a>`
    : '';

  const authBlock = user
    ? `<div class="user-menu" style="position:relative;">
         <button class="btn btn-outline" data-user-toggle style="padding:.5rem .9rem; display:inline-flex; align-items:center; gap:.5rem;">
           <i class="fas fa-user-circle"></i>
           <span style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.name || user.email}</span>
           <i class="fas fa-chevron-down" style="font-size:.7rem;"></i>
         </button>
         <div class="user-dropdown" style="display:none; position:absolute; right:0; top:calc(100% + .5rem); background:var(--surface); border:1px solid var(--border); border-radius:10px; box-shadow:0 10px 30px -10px rgba(0,0,0,.2); min-width:200px; z-index:1000;">
           <div style="padding:.75rem 1rem; border-bottom:1px solid var(--border);">
             <div style="font-weight:600; font-size:.9rem;">${user.name || 'Account'}</div>
             <div style="font-size:.8rem; color:var(--text-muted);">${user.email}</div>
             <div style="font-size:.75rem; color:var(--primary); margin-top:.2rem; text-transform:capitalize;"><i class="fas fa-circle-check"></i> ${user.role}</div>
           </div>
           <a href="/notifications.html" style="display:block; padding:.6rem 1rem; color:var(--text); text-decoration:none;"><i class="fas fa-bell"></i> Notifications</a>
           ${user.role === 'landlord' ? `<a href="/dashboard.html" style="display:block; padding:.6rem 1rem; color:var(--text); text-decoration:none;"><i class="fas fa-gauge-high"></i> Landlord dashboard</a>` : ''}
           ${user.role === 'admin' ? `<a href="/admin" style="display:block; padding:.6rem 1rem; color:var(--text); text-decoration:none;"><i class="fas fa-shield-halved"></i> Admin dashboard</a>` : ''}
           <button type="button" data-account-settings style="display:block; width:100%; text-align:left; padding:.6rem 1rem; background:none; border:none; color:var(--text); cursor:pointer; font:inherit;"><i class="fas fa-cog"></i> Account Settings</button>
           ${user.role === 'landlord' ? (
             user.agency_status === 'approved'
               ? `<div style="display:block; padding:.6rem 1rem; color:#059669; background:rgba(16,185,129,.08); font-size:.9rem;"><i class="fas fa-circle-check"></i> Verified Agency Account</div>`
               : user.agency_status === 'pending'
                 ? `<div style="display:block; padding:.6rem 1rem; color:var(--text-muted); font-size:.9rem;"><i class="fas fa-hourglass-half"></i> Agency Review Pending</div>`
                 : `<button type="button" data-agency-request style="display:block; width:100%; text-align:left; padding:.6rem 1rem; background:none; border:none; color:var(--text); cursor:pointer; font:inherit;"><i class="fas fa-chart-line"></i> Request Agency Upgrade</button>`
           ) : ''}
           <a href="/listings.html" style="display:block; padding:.6rem 1rem; color:var(--text); text-decoration:none;"><i class="fas fa-house"></i> Browse listings</a>
           <button data-logout style="display:block; width:100%; text-align:left; padding:.6rem 1rem; background:none; border:none; color:var(--text); cursor:pointer; font:inherit;"><i class="fas fa-sign-out-alt"></i> Log out</button>
         </div>
       </div>`
    : `<a href="/login.html" class="btn btn-primary" style="padding:.55rem 1.1rem;">Sign In</a>`;


  const header = `
<div id="preloader"><div class="spinner"></div></div>
<header class="site-header">
  <nav class="nav">
    <a href="/home.html" class="logo"><i class="fas fa-home"></i> Smart House Finder</a>
    <ul class="nav-links">
      <li><a href="/home.html" class="${path==='home.html'?'active':''}">Home</a></li>
      <li><a href="/listings.html" class="${path==='listings.html'?'active':''}">Listings</a></li>
      <li><a href="/map.html" class="${path==='map.html'?'active':''}">Map</a></li>
      <li><a href="/contact.html" class="${path==='contact.html'?'active':''}">Contact</a></li>
      ${user && user.role === 'admin' ? `<li><a href="/admin" style="color:var(--primary); font-weight:600;"><i class="fas fa-shield-halved"></i> Admin</a></li>` : ''}
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" data-theme-toggle aria-label="Toggle theme"><i data-theme-icon class="fas fa-moon"></i></button>
      <button class="icon-btn" data-lang-toggle aria-label="Language" title="Language" data-no-i18n style="font-weight:700; font-size:.8rem; width:auto; padding:0 .55rem;"><i class="fas fa-globe" style="margin-right:.3rem;"></i><span data-lang-label>EN</span></button>
      ${bellBlock}
      ${authBlock}
      <button class="icon-btn hamburger" data-menu-toggle aria-label="Menu"><i class="fas fa-bars"></i></button>
    </div>


  </nav>
</header>`;
  const footer = `
<footer class="site-footer shf-footer">
  <div class="container shf-footer-inner">
    <div class="shf-footer-grid">
      <div class="shf-foot-brand">
        <a href="/home.html" class="shf-foot-logo"><i class="fas fa-home"></i> Smart House Finder</a>
        <p class="shf-foot-tag">Tanzania's premier rental directory — connecting students and general renters with verified homes, campus-proximity insights, and trusted landlords nationwide.</p>
      </div>
      <div class="shf-foot-col">
        <h4>Company</h4>
        <ul>
          <li><a href="/about.html">About Us</a></li>
          <li><a href="/how-it-works.html">How It Works</a></li>
          <li><a href="/contact.html">Contact Support</a></li>
        </ul>
      </div>
      <div class="shf-foot-col">
        <h4>Discover</h4>
        <ul>
          <li><a href="/listings.html?portal=renter">Renter Portal</a></li>
          <li><a href="/listings.html?portal=student">Student Portal</a></li>
          <li><a href="/dashboard.html">List Your Property</a></li>
        </ul>
      </div>
      <div class="shf-foot-col">
        <h4>Legal &amp; Safety</h4>
        <ul>
          <li><a href="/terms.html">Terms of Service</a></li>
          <li><a href="/privacy.html">Privacy Policy</a></li>
          <li><a href="/safety.html">Tenant Safety Advice</a></li>
        </ul>
      </div>
    </div>
    <div class="shf-foot-divider"></div>
    <div class="shf-foot-bottom">
      <p class="shf-foot-copy">&copy; 2026 Smart House Finder. All rights reserved.</p>
      <div class="shf-foot-social">
        <a href="https://wa.me/255713686105" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="Contact Customer Support">
          <i class="fab fa-whatsapp"></i>
        </a>
        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
      </div>
    </div>
  </div>
</footer>
<style>
  .shf-footer { background: var(--bg); color: var(--text-muted); margin-top: 4rem; border-top: 1px solid var(--border); transition: background var(--transition), color var(--transition), border-color var(--transition); }
  .shf-footer-inner { padding: 4rem 1.25rem 1.75rem; }
  .shf-footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 2.5rem; }
  .shf-foot-brand .shf-foot-logo { display: inline-flex; align-items: center; gap: .5rem; color: var(--text); font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.15rem; text-decoration: none; transition: color var(--transition); }
  .shf-foot-brand .shf-foot-logo i { color: var(--primary); }
  .shf-foot-tag { margin-top: .85rem; color: var(--text-muted); font-size: .9rem; line-height: 1.55; max-width: 340px; transition: color var(--transition); }
  .shf-foot-col h4 { font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: .12em; font-size: .75rem; font-weight: 700; color: var(--text-muted); margin: 0 0 1rem; transition: color var(--transition); }
  .shf-foot-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .55rem; }
  .shf-foot-col a { color: var(--text); font-size: .9rem; text-decoration: none; opacity: .85; transition: opacity .2s ease, color .2s ease; }
  .shf-foot-col a:hover { opacity: 1; color: var(--primary); }
  .shf-foot-divider { height: 1px; background: var(--border); margin: 2.5rem 0 1.25rem; transition: background var(--transition); }
  .shf-foot-bottom { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .shf-foot-copy { margin: 0; color: var(--text-muted); font-size: .8rem; transition: color var(--transition); }
  .shf-foot-social { display: flex; gap: .55rem; align-items: center; }
  .shf-foot-social a { width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--surface); color: var(--primary); border: 1px solid var(--border); font-size: .9rem; transition: all .2s ease; text-decoration: none; }
  .shf-foot-social a:hover { background: var(--primary); color: #fff; border-color: var(--primary); transform: translateY(-2px); }
  #backTop { background: var(--primary); color: #fff; border: 1px solid transparent; box-shadow: var(--shadow-lg); }
  #backTop:hover { background: var(--primary-dark); transform: translateY(-3px); }
  @media (max-width: 900px) {
    .shf-footer-grid { grid-template-columns: 1fr; text-align: center; gap: 2rem; }
    .shf-foot-tag { margin-left: auto; margin-right: auto; }
    .shf-foot-col ul { align-items: center; }
    .shf-foot-bottom { justify-content: center; text-align: center; }
  }
  [data-theme="dark"] .shf-footer { background: #091124; color: #cbd5e1; border-top: 1px solid rgba(255, 255, 255, .05); }
  [data-theme="dark"] .shf-foot-brand .shf-foot-logo { color: #fff; }
  [data-theme="dark"] .shf-foot-tag { color: #94a3b8; }
  [data-theme="dark"] .shf-foot-col h4 { color: #94a3b8; }
  [data-theme="dark"] .shf-foot-col a { color: #cbd5e1; }
  [data-theme="dark"] .shf-foot-col a:hover { color: #60a5fa; opacity: 1; }
  [data-theme="dark"] .shf-foot-divider { background: rgba(255, 255, 255, .08); }
  [data-theme="dark"] .shf-foot-copy { color: #64748b; }
  [data-theme="dark"] .shf-foot-social a { background: rgba(255, 255, 255, .06); color: #60a5fa; border: none; }
  [data-theme="dark"] .shf-foot-social a:hover { background: #3B82F6; color: #fff; }
  [data-theme="dark"] #backTop { background: var(--primary); color: #fff; }
</style>

<button id="backTop" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>
<div class="lightbox" role="dialog" aria-label="Image viewer">
  <button class="lightbox-close" aria-label="Close"><i class="fas fa-times"></i></button>
  <img src="" alt="Preview" />
</div>`;

  document.addEventListener('DOMContentLoaded', () => {
    // Auto-load i18n helper on every page
    if (!document.querySelector('script[data-i18n-script]')) {
      const s = document.createElement('script');
      s.src = '/js/i18n.js';
      s.setAttribute('data-i18n-script', '1');
      document.head.appendChild(s);
    }

    if (!document.querySelector('.bg-slideshow')) {
      const bg = document.createElement('div');
      bg.className = 'bg-slideshow';
      bg.setAttribute('aria-hidden', 'true');
      const imgs = [
        '/assets/bg-house.jpg',
        '/assets/bg-house-2.jpg',
        '/assets/bg-house-3.jpg',
        '/assets/bg-house-4.jpg',
        '/assets/bg-house-5.jpg',
        '/assets/bg-house-6.jpg',
        '/assets/bg-house-7.jpg',
        '/assets/bg-house-8.jpg',
        '/assets/bg-house-9.jpg',
        '/assets/bg-house-10.jpg',
      ];
      bg.innerHTML = imgs.map(src => `<div class="bg-slide" style="background-image:url('${src}')"></div>`).join('');
      document.body.prepend(bg);
    }

    const h = document.getElementById('header-mount');
    const f = document.getElementById('footer-mount');
    if (h) h.outerHTML = header;
    if (f) f.outerHTML = footer;


    // User menu interactions
    document.addEventListener('click', (e) => {
      const langBtn = e.target.closest('[data-lang-toggle]');
      if (langBtn) {
        if (window.SHFi18n) window.SHFi18n.toggle();
        return;
      }
      const toggle = e.target.closest('[data-user-toggle]');

      const dd = document.querySelector('.user-dropdown');
      if (toggle && dd) {
        dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
        return;
      }
      if (e.target.closest('[data-logout]')) {
        (async () => {
          try {
            if (window.SHFCloud) {
              const sb = await window.SHFCloud.ready;
              await sb.auth.signOut();
            }
          } catch (_) {}
          localStorage.removeItem('shf-user');
          location.href = '/home.html';
        })();
        return;
      }
      if (dd && !e.target.closest('.user-menu')) dd.style.display = 'none';
    });

    // Guest interaction guard: signed-out users can browse listings but any
    // interaction (opening detail pages, CTAs, lightbox on cards) bounces to login.
    if (!user) {
      const goLogin = (msg) => {
        if (window.toast) window.toast.info(msg);
        location.href = '/login.html?redirect=' + encodeURIComponent(location.pathname + location.search);
      };
      document.addEventListener('click', (e) => {
        const t = e.target;
        if (!t || !t.closest) return;
        // Always allow: header, footer, theme toggle, hamburger, auth links, explicit guest-ok elements
        if (t.closest('.site-header, .site-footer, [data-theme-toggle], [data-menu-toggle], [data-guest-ok]')) return;
        if (t.closest('a[href^="/login"], a[href^="/signup"], a[href^="#"]')) return;

        const detailLink = t.closest('a[href*="/detail.html"]');
        const card = t.closest('.card, .listing-row');
        const requiresAuth = t.closest('[data-requires-auth]');

        if (detailLink) {
          e.preventDefault(); e.stopImmediatePropagation();
          if (window.toast) window.toast.info('Please sign in to view listing details.');
          location.href = '/login.html?redirect=' + encodeURIComponent(detailLink.getAttribute('href'));
          return;
        }
        if (card) {
          e.preventDefault(); e.stopImmediatePropagation();
          goLogin('Please sign in to interact with listings.');
          return;
        }
        if (requiresAuth) {
          e.preventDefault(); e.stopImmediatePropagation();
          goLogin('Please sign in to continue.');
        }
      }, true);
    }

    // Live unread notification count on bell
    if (user && window.SHFCloud) {
      (async () => {
        try {
          const sb = await window.SHFCloud.ready;
          const refresh = async () => {
            const { count } = await sb.from('notifications')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id).eq('read', false);
            const badge = document.querySelector('.shf-bell-badge');
            if (!badge) return;
            if (count && count > 0) { badge.textContent = count > 99 ? '99+' : String(count); badge.style.display = 'inline-block'; }
            else { badge.style.display = 'none'; }
          };
          refresh();
          // Realtime updates
          sb.channel('notif-bell-' + user.id)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, refresh)
            .subscribe();
          setInterval(refresh, 60000);
        } catch (_) {}
      })();
    }
  });

})();
