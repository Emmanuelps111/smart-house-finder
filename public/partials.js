// Header & footer injectors
(function () {
  const path = location.pathname.split('/').pop() || 'home.html';

  let user = null;
  try { user = JSON.parse(localStorage.getItem('shf-user') || 'null'); } catch (e) {}

  const bellBlock = user
    ? `<div class="shf-bell-wrap" style="position:relative;">
         <button type="button" class="icon-btn shf-bell" data-bell-toggle aria-label="Notifications" aria-haspopup="true" aria-expanded="false" style="position:relative;">
           <i class="fas fa-bell"></i>
           <span class="shf-bell-badge" style="display:none; position:absolute; top:-2px; right:-2px; background:#ef4444; color:#fff; font-size:.65rem; font-weight:700; min-width:18px; height:18px; padding:0 4px; border-radius:9px; line-height:18px; text-align:center; box-shadow:0 2px 6px rgba(239,68,68,.5);"></span>
         </button>
         <div class="shf-bell-panel" role="dialog" aria-label="Notifications" aria-hidden="true">
           <div class="shf-bell-head">
             <strong><i class="fas fa-bell"></i> Notifications</strong>
             <button type="button" class="shf-link-btn" data-bell-mark-all style="padding:0;"><i class="fas fa-check-double"></i> Mark all read</button>
           </div>
           <div class="shf-bell-list" data-bell-list>
             <div class="shf-bell-empty"><i class="fas fa-spinner fa-spin"></i> Loading…</div>
           </div>
         </div>
       </div>`
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


  const brandSvg = (extraClass = '') => `
    <svg class="brand-logo ${extraClass}" viewBox="0 0 80 72" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 28 Q14 26 18 22 L40 4 L62 22 Q66 26 78 28 L60 28 L20 28 Z" fill="currentColor"/>
      <path d="M18 28 L18 58 L62 58 L62 28" stroke="currentColor" stroke-width="4.5" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
      <path d="M32 58 L32 44 Q40 33 48 44 L48 58 Z" fill="currentColor"/>
      <g fill="#ffffff">
        <circle cx="40" cy="43" r="2"/>
        <path d="M37.2 46 h5.6 a1 1 0 0 1 1 1 v5 a1 1 0 0 1 -1 1 h-5.6 a1 1 0 0 1 -1 -1 v-5 a1 1 0 0 1 1 -1 z"/>
        <rect x="43" y="46.5" width="1.6" height="4.5" rx=".6"/>
        <path d="M38.6 53 L37.4 58 h1.4 L39.6 53 z"/>
        <path d="M41.4 53 L40.6 58 h1.4 L42.6 53 z"/>
      </g>
      <path d="M18 58 L6 70" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
    </svg>`;

  const header = `
<div id="preloader"><div class="spinner"></div></div>
<header class="site-header">
  <nav class="nav">
    <a href="/home.html" class="logo brand-anchor">${brandSvg('brand-logo-sm')}<span class="brand-name">MakaziLink</span></a>
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
        <a href="/home.html" class="shf-foot-logo brand-anchor">
          ${brandSvg('brand-logo-lg')}
          <span class="shf-foot-brand-text">
            <span class="brand-name">MakaziLink</span>
            <span class="brand-tagline">your housing guide</span>
          </span>
        </a>
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
      <p class="shf-foot-copy">&copy; 2026 MakaziLink. All rights reserved.</p>
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
  /* ---- Brand logo ---- */
  .brand-anchor { display:inline-flex; align-items:center; gap:.6rem; text-decoration:none; }
  .brand-logo { color: #1E5FA8; flex-shrink:0; display:block; }
  [data-theme="dark"] .brand-logo { color: #7FB0E8; }
  .brand-logo-sm { width: 34px; height: auto; }
  .brand-logo-lg { width: 96px; height: auto; }
  .brand-name { font-family: 'Montserrat', 'Inter', 'Poppins', sans-serif; font-weight: 800; letter-spacing:-.035em; color: #1E5FA8; line-height:1; }
  [data-theme="dark"] .brand-name { color: #7FB0E8; }
  .site-header .brand-anchor .brand-name { font-size: 1.35rem; }
  .shf-foot-brand .shf-foot-logo { align-items:center; gap:.85rem; padding:0; }
  .shf-foot-brand-text { display:flex; flex-direction:column; gap:.1rem; align-items:flex-start; }
  .shf-foot-brand-text .brand-name { font-size: 2rem; line-height:1; }
  .brand-tagline { font-size: .95rem; color:#64748b; font-weight:400; letter-spacing:.005em; font-family: 'Montserrat', 'Inter', sans-serif; }
  [data-theme="dark"] .brand-tagline { color:#94a3b8; }
  @media (max-width: 900px) {
    .shf-foot-brand .shf-foot-logo { flex-direction:column; justify-content:center; }
    .shf-foot-brand-text { align-items:center; text-align:center; }
  }

  /* ---- Global pill-shaped buttons & inputs ---- */
  .btn, .search-bar, .search-bar input, .search-bar button,
  .user-menu > button, .icon-btn,
  #searchInput, #bedFilter, #priceFilter, #sortBy,
  select.shf-pill, input.shf-pill { border-radius: 999px !important; }
  .search-bar { padding: .35rem .35rem .35rem 1rem; }
  .search-bar input { padding:.7rem .5rem; }
  select#priceFilter, select#sortBy, select#bedFilter, #searchInput {
    background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
    background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    padding-right: 2rem !important;
    -webkit-appearance: none; -moz-appearance: none; appearance: none;
  }
  #searchInput { background-image: none; padding-right: 1rem !important; }

  /* Native select popovers can't be restyled, but wrapper + focus ring gives clean feel */
  #priceFilter:focus, #sortBy:focus, #bedFilter:focus, #searchInput:focus {
    outline: none; border-color: var(--primary);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 18%, transparent);
  }
  select#priceFilter option, select#sortBy option { border-radius: 12px; }

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
</div>

<!-- Account Settings Modal -->
<div id="shf-modal-account" class="shf-modal" role="dialog" aria-modal="true" aria-label="Account settings" style="display:none;">
  <div class="shf-modal-backdrop" data-modal-close></div>
  <div class="shf-modal-card">
    <div class="shf-modal-head">
      <h3><i class="fas fa-cog"></i> Account Settings</h3>
      <button class="shf-modal-x" data-modal-close aria-label="Close"><i class="fas fa-times"></i></button>
    </div>
    <div class="shf-modal-body">
      <label class="shf-field"><span>Display Name</span><input type="text" id="shf-acc-name" placeholder="Your name" /></label>
      <label class="shf-field"><span>Contact Phone Number</span><input type="tel" id="shf-acc-phone" placeholder="+255..." /></label>
      <button type="button" class="shf-link-btn" id="shf-acc-change-pw"><i class="fas fa-key"></i> Change Password</button>
    </div>
    <div class="shf-modal-foot">
      <button type="button" class="btn btn-outline" data-modal-close>Cancel</button>
      <button type="button" class="btn btn-primary" id="shf-acc-save">Save Changes</button>
    </div>
  </div>
</div>

<!-- Agency Upgrade Modal -->
<div id="shf-modal-agency" class="shf-modal" role="dialog" aria-modal="true" aria-label="Agency upgrade" style="display:none;">
  <div class="shf-modal-backdrop" data-modal-close></div>
  <div class="shf-modal-card">
    <div class="shf-modal-head">
      <h3><i class="fas fa-chart-line"></i> Manage Multiple Properties?</h3>
      <button class="shf-modal-x" data-modal-close aria-label="Close"><i class="fas fa-times"></i></button>
    </div>
    <div class="shf-modal-body">
      <p style="color:var(--text-muted); line-height:1.55; margin:0;">
        Are you a corporate real estate agency or a property manager handling 5+ listings?
        Apply to unlock multi-property spreadsheet bulk uploading tools.
      </p>
    </div>
    <div class="shf-modal-foot">
      <button type="button" class="btn btn-outline" data-modal-close>Not now</button>
      <button type="button" class="shf-btn-green" id="shf-agency-submit"><i class="fas fa-paper-plane"></i> Submit Upgrade Application</button>
    </div>
  </div>
</div>

<style>
  .shf-modal { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .shf-modal-backdrop { position: absolute; inset: 0; background: rgba(15, 23, 42, .55); backdrop-filter: blur(3px); }
  .shf-modal-card { position: relative; background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 460px; box-shadow: 0 25px 60px -20px rgba(0,0,0,.35); overflow: hidden; animation: shfModalIn .18s ease-out; }
  @keyframes shfModalIn { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
  .shf-modal-head { display:flex; align-items:center; justify-content:space-between; padding: 1rem 1.15rem; border-bottom: 1px solid var(--border); }
  .shf-modal-head h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--text); display:flex; align-items:center; gap:.5rem; }
  .shf-modal-head h3 i { color: var(--primary); }
  .shf-modal-x { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:.35rem .5rem; border-radius:6px; }
  .shf-modal-x:hover { background: var(--border); color: var(--text); }
  .shf-modal-body { padding: 1.15rem; display:flex; flex-direction:column; gap: .9rem; }
  .shf-field { display:flex; flex-direction:column; gap:.35rem; font-size:.85rem; color:var(--text-muted); }
  .shf-field input { padding:.6rem .75rem; border:1px solid var(--border); border-radius:8px; background:var(--bg); color:var(--text); font:inherit; }
  .shf-field input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
  .shf-link-btn { align-self: flex-start; background:none; border:none; color:var(--primary); font:inherit; font-weight:600; cursor:pointer; padding:.25rem 0; display:inline-flex; align-items:center; gap:.4rem; }
  .shf-link-btn:hover { text-decoration: underline; }
  .shf-modal-foot { display:flex; justify-content:flex-end; gap:.6rem; padding: .9rem 1.15rem; border-top: 1px solid var(--border); background: var(--bg); }
  .shf-btn-green { background:#10b981; color:#fff; border:none; padding:.6rem 1.1rem; border-radius:8px; font:inherit; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:.45rem; transition: background .15s ease; }
  .shf-btn-green:hover { background:#059669; }
  .shf-btn-green:disabled { opacity:.6; cursor:not-allowed; }

  /* Notification bell dropdown */
  .shf-bell-panel { position: absolute; right: 0; top: calc(100% + .55rem); width: 360px; max-width: calc(100vw - 1.5rem); max-height: 460px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 20px 45px -15px rgba(0,0,0,.28); z-index: 1500; overflow: hidden; display: flex; flex-direction: column; opacity: 0; transform: translateY(-6px) scale(.98); pointer-events: none; transition: opacity .18s ease, transform .18s ease; }
  .shf-bell-panel.open { opacity: 1; transform: none; pointer-events: auto; }
  .shf-bell-head { display:flex; align-items:center; justify-content:space-between; padding:.85rem 1rem; border-bottom:1px solid var(--border); font-size:.9rem; color:var(--text); }
  .shf-bell-head strong i { color: var(--primary); margin-right:.35rem; }
  .shf-bell-list { overflow-y: auto; flex: 1; }
  .shf-bell-empty { padding: 1.75rem 1rem; text-align:center; color: var(--text-muted); font-size:.88rem; }
  .shf-bell-item { display:flex; gap:.7rem; padding:.75rem 1rem; border-bottom:1px solid var(--border); cursor:pointer; transition: background .15s; }
  .shf-bell-item:last-child { border-bottom: none; }
  .shf-bell-item:hover { background: rgba(59,130,246,.06); }
  .shf-bell-item.unread { background: rgba(59,130,246,.05); }
  .shf-bell-item.unread::before { content:''; width:6px; height:6px; border-radius:50%; background: var(--primary); margin-top:.55rem; flex-shrink:0; }
  .shf-bell-item .bi-body { flex:1; min-width:0; }
  .shf-bell-item .bi-title { font-weight:600; color:var(--text); font-size:.88rem; margin:0 0 .15rem; }
  .shf-bell-item .bi-msg { color: var(--text-muted); font-size:.82rem; margin:0; line-height:1.4; }
  .shf-bell-item .bi-time { color: var(--text-muted); font-size:.72rem; margin-top:.25rem; display:block; }
</style>`;

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

      // ---- Account Settings & Agency Upgrade modals ----
      const openModal = (id) => { const m = document.getElementById(id); if (m) m.style.display = 'flex'; if (dd) dd.style.display = 'none'; };
      const closeModal = (m) => { if (m) m.style.display = 'none'; };

      if (e.target.closest('[data-account-settings]')) {
        const nameInput = document.getElementById('shf-acc-name');
        const phoneInput = document.getElementById('shf-acc-phone');
        if (nameInput) nameInput.value = user.name || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        openModal('shf-modal-account');
        return;
      }
      if (e.target.closest('[data-agency-request]')) {
        openModal('shf-modal-agency');
        return;
      }
      const closer = e.target.closest('[data-modal-close]');
      if (closer) { closeModal(closer.closest('.shf-modal')); return; }

      if (e.target.closest('#shf-acc-save')) {
        (async () => {
          const btn = e.target.closest('#shf-acc-save');
          if (!window.SHFCloud) return;
          const name = document.getElementById('shf-acc-name').value.trim();
          const phone = document.getElementById('shf-acc-phone').value.trim();
          if (!name) { window.toast?.error('Name cannot be empty.'); return; }
          btn.disabled = true;
          try {
            const sb = await window.SHFCloud.ready;
            const { error } = await sb.from('profiles').update({ full_name: name, phone }).eq('id', user.id);
            if (error) throw error;
            const cached = JSON.parse(localStorage.getItem('shf-user') || '{}');
            cached.name = name; cached.phone = phone;
            localStorage.setItem('shf-user', JSON.stringify(cached));
            window.toast?.success('Profile updated.');
            closeModal(document.getElementById('shf-modal-account'));
            setTimeout(() => location.reload(), 600);
          } catch (err) {
            window.toast?.error(err.message || 'Failed to update profile.');
          } finally { btn.disabled = false; }
        })();
        return;
      }
      if (e.target.closest('#shf-acc-change-pw')) {
        (async () => {
          if (!user.email || !window.SHFCloud) return;
          try {
            const sb = await window.SHFCloud.ready;
            const { error } = await sb.auth.resetPasswordForEmail(user.email, {
              redirectTo: window.location.origin + '/reset-password',
            });
            if (error) throw error;
            window.toast?.success('Password reset email sent.');
          } catch (err) { window.toast?.error(err.message || 'Failed to send reset email.'); }
        })();
        return;
      }
      if (e.target.closest('#shf-agency-submit')) {
        (async () => {
          const btn = e.target.closest('#shf-agency-submit');
          if (!window.SHFCloud) return;
          btn.disabled = true;
          try {
            const sb = await window.SHFCloud.ready;
            const { error } = await sb.from('profiles').update({ agency_status: 'pending' }).eq('id', user.id);
            if (error) throw error;
            const cached = JSON.parse(localStorage.getItem('shf-user') || '{}');
            cached.agency_status = 'pending';
            localStorage.setItem('shf-user', JSON.stringify(cached));
            window.toast?.success('Application submitted — under review.');
            closeModal(document.getElementById('shf-modal-agency'));
            setTimeout(() => location.reload(), 700);
          } catch (err) {
            window.toast?.error(err.message || 'Failed to submit application.');
          } finally { btn.disabled = false; }
        })();
        return;
      }


      // ---- Notification bell dropdown ----
      const bellPanel = document.querySelector('.shf-bell-panel');
      const bellBtn = e.target.closest('[data-bell-toggle]');
      if (bellBtn && bellPanel) {
        const willOpen = !bellPanel.classList.contains('open');
        bellPanel.classList.toggle('open', willOpen);
        bellBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        bellPanel.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
        if (willOpen) window.SHFBell?.load();
        if (dd) dd.style.display = 'none';
        return;
      }
      if (bellPanel && bellPanel.classList.contains('open') && !e.target.closest('.shf-bell-wrap')) {
        bellPanel.classList.remove('open');
        const b = document.querySelector('[data-bell-toggle]');
        if (b) b.setAttribute('aria-expanded', 'false');
        bellPanel.setAttribute('aria-hidden', 'true');
      }
      if (e.target.closest('[data-bell-mark-all]')) {
        window.SHFBell?.markAll();
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

    // Live unread notification count + dropdown loader
    if (user && window.SHFCloud) {
      (async () => {
        try {
          const sb = await window.SHFCloud.ready;
          const esc = s => (s==null?'':String(s)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
          const ago = ts => { const d=(Date.now()-new Date(ts).getTime())/1000;
            if(d<60)return 'just now'; if(d<3600)return Math.floor(d/60)+'m ago';
            if(d<86400)return Math.floor(d/3600)+'h ago'; if(d<2592000)return Math.floor(d/86400)+'d ago';
            return new Date(ts).toLocaleDateString(); };
          const refresh = async () => {
            const { count } = await sb.from('notifications')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id).eq('read', false);
            const badge = document.querySelector('.shf-bell-badge');
            if (!badge) return;
            if (count && count > 0) { badge.textContent = count > 99 ? '99+' : String(count); badge.style.display = 'inline-block'; }
            else { badge.style.display = 'none'; }
          };
          const loadList = async () => {
            const list = document.querySelector('[data-bell-list]');
            if (!list) return;
            const { data, error } = await sb.from('notifications')
              .select('id,title,body,type,link,read,created_at')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false }).limit(20);
            if (error) { list.innerHTML = `<div class="shf-bell-empty"><i class="fas fa-triangle-exclamation"></i> ${esc(error.message)}</div>`; return; }
            if (!data || !data.length) {
              list.innerHTML = `<div class="shf-bell-empty"><i class="far fa-bell-slash"></i><div style="margin-top:.4rem;">You're all caught up.</div></div>`;
              return;
            }
            list.innerHTML = data.map(n => `
              <div class="shf-bell-item ${n.read?'':'unread'}" data-id="${n.id}" data-link="${esc(n.link||'')}">
                <div class="bi-body">
                  <p class="bi-title">${esc(n.title||'')}</p>
                  <p class="bi-msg">${esc(n.body||'')}</p>
                  <span class="bi-time">${ago(n.created_at)}</span>
                </div>
              </div>`).join('');
            list.querySelectorAll('.shf-bell-item').forEach(it => {
              it.addEventListener('click', async () => {
                const id = it.dataset.id, link = it.dataset.link;
                if (it.classList.contains('unread')) {
                  await sb.from('notifications').update({ read: true }).eq('id', id);
                  refresh();
                }
                if (link) location.href = link;
              });
            });
          };
          window.SHFBell = {
            load: loadList,
            markAll: async () => {
              await sb.rpc('mark_all_notifications_read');
              window.toast?.success('All notifications marked as read');
              await loadList(); refresh();
            },
          };
          refresh();
          // Realtime updates
          sb.channel('notif-bell-' + user.id)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
              refresh();
              if (document.querySelector('.shf-bell-panel.open')) loadList();
            })
            .subscribe();
          setInterval(refresh, 60000);
        } catch (_) {}
      })();
    }
  });

})();

// === Student welcome (Karibu) modal ===
(function () {
  function showKaribu() {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('shf-user') || 'null'); } catch (e) {}
    if (!user) return;
    const role = user.role || user.account_type;
    if (role !== 'student') return;
    if (localStorage.getItem('shf-has-seen-welcome') === 'true') return;
    if (document.getElementById('shf-karibu-modal')) return;

    const wrap = document.createElement('div');
    wrap.id = 'shf-karibu-modal';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(15,23,42,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .25s ease;';
    wrap.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="shf-karibu-title" style="max-width:560px;width:100%;background:color-mix(in oklab, var(--bg) 88%, transparent);border:1px solid rgba(255,255,255,.15);border-radius:1.5rem;box-shadow:0 24px 60px -12px rgba(0,0,0,.4);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);padding:1.75rem 1.75rem 1.5rem;transform:translateY(12px) scale(.98);transition:transform .28s ease;">
        <h2 id="shf-karibu-title" style="margin:0 0 1rem;font-size:1.35rem;font-weight:700;color:var(--text);"><i class="fas fa-graduation-cap" style="color:#3B82F6;margin-right:.35rem;"></i> Karibu MakaziLink Student Portal!</h2>

        <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.25rem;">
          <div style="padding:.85rem 1rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:1rem;color:var(--text);font-size:.88rem;line-height:1.5;">
            <strong><i class="fas fa-ban" style="color:#dc2626;"></i> ZERO DALALI FEES</strong> — We have completely banned informal broker commissions and hidden viewing fees on this platform. Every WhatsApp chat links you directly to the verified property owner for free.
          </div>
          <div style="padding:.85rem 1rem;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:1rem;color:var(--text);font-size:.88rem;line-height:1.5;">
            <strong><i class="fas fa-handshake" style="color:#3B82F6;"></i> BUILT-IN ROOMMATE MATCHING</strong> — Need to split term rent? Use the nested roommate request accordion drawers inside shared hostel configurations to match with verified peers safely based on lifestyle habit tags.
          </div>
          <div style="padding:.85rem 1rem;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:1rem;color:var(--text);font-size:.88rem;line-height:1.5;">
            <strong><i class="fas fa-map-location-dot" style="color:#059669;"></i> LIVE CAMPUS SORTING</strong> — No permanent campus locks. Use the dynamic pill-shaped dropdown filters on the main listings feed to switch freely between UDSM Mlimani, COICT, MUHAS, or DUCE to instantly recalculate distances and re-sort properties live on your screen.
          </div>
        </div>

        <button type="button" id="shf-karibu-cta" style="width:100%;padding:.9rem 1.2rem;background:#3B82F6;color:#fff;border:none;border-radius:9999px;font-weight:600;font-size:1rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;box-shadow:0 8px 20px -6px rgba(59,130,246,.5);transition:background .18s, transform .18s;">
          <i class="fas fa-bolt"></i> Start Exploring Campus Housing
        </button>
      </div>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => {
      wrap.style.opacity = '1';
      const card = wrap.firstElementChild;
      if (card) card.style.transform = 'translateY(0) scale(1)';
    });

    function close() {
      wrap.style.opacity = '0';
      const card = wrap.firstElementChild;
      if (card) card.style.transform = 'translateY(12px) scale(.98)';
      try { localStorage.setItem('shf-has-seen-welcome', 'true'); } catch(e){}
      setTimeout(() => wrap.remove(), 280);
    }
    wrap.querySelector('#shf-karibu-cta').addEventListener('click', close);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showKaribu, { once: true });
  } else {
    showKaribu();
  }
  window.addEventListener('shf:login-success', showKaribu);
})();
