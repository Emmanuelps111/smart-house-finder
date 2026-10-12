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
          <li><a href="/student-portal.html">Student Portal</a></li>
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
    <div class="acc-id" id="shf-acc-id"></div>
    <div class="acc-tabs" role="tablist">
      <button type="button" role="tab" class="acc-tab active" data-acc-tab="profile" aria-selected="true"><i class="fas fa-id-card"></i> Profile &amp; Identity</button>
      <button type="button" role="tab" class="acc-tab" data-acc-tab="security" aria-selected="false"><i class="fas fa-shield-halved"></i> Security &amp; Login</button>
    </div>
    <div class="shf-modal-body acc-pane" data-acc-pane="profile">
      <label class="shf-field"><span>Display Name</span><input type="text" id="shf-acc-name" maxlength="80" placeholder="Your name" /></label>
      <label class="shf-field"><span>Email <em class="acc-ok"><i class="fas fa-circle-check"></i> Verified</em></span><input type="email" id="shf-acc-email" readonly /></label>
      <label class="shf-field"><span>Phone / WhatsApp</span><input type="tel" id="shf-acc-phone" maxlength="16" placeholder="07XX XXX XXX or +255..." /><small class="acc-err" id="shf-acc-phone-err"></small></label>
      <div class="acc-note"><i class="fas fa-lock"></i> Your phone number is shielded. It's only shared with verified contacts when you make an inquiry or accept a roommate request.</div>
      <div id="shf-acc-role"></div>
    </div>
    <div class="shf-modal-body acc-pane" data-acc-pane="security" hidden>
      <div class="acc-section"><i class="fas fa-key"></i> Change password</div>
      <label class="shf-field"><span>Current Password</span><input type="password" id="shf-acc-pw-cur" autocomplete="current-password" /></label>
      <label class="shf-field"><span>New Password</span><input type="password" id="shf-acc-pw-new" autocomplete="new-password" placeholder="At least 8 characters" /></label>
      <label class="shf-field"><span>Confirm New Password</span><input type="password" id="shf-acc-pw-conf" autocomplete="new-password" /></label>
      <button type="button" class="btn btn-primary acc-inline-btn" id="shf-acc-pw-save">Update Password</button>
      <div class="acc-section" style="margin-top:.4rem;"><i class="fas fa-shield-halved"></i> Recovery security question</div>
      <div class="acc-note" id="shf-acc-secq-current">Loading your current question…</div>
      <label class="shf-field"><span>Question</span><select id="shf-acc-secq">
        <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
        <option value="What was the name of your first pet?">What was the name of your first pet?</option>
        <option value="What primary school did you attend?">What primary school did you attend?</option>
        <option value="What is your favorite childhood nickname?">What is your favorite childhood nickname?</option>
        <option value="What is the name of the street you grew up on?">What is the name of the street you grew up on?</option>
      </select></label>
      <label class="shf-field"><span>Answer</span><input type="text" id="shf-acc-seca" maxlength="80" autocomplete="off" /></label>
      <button type="button" class="btn btn-outline acc-inline-btn" id="shf-acc-secq-save">Save Security Question</button>
    </div>
    <div class="shf-modal-foot" data-acc-foot>
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
  #shf-modal-account .shf-modal-card { max-width: 520px; border-radius: 22px; max-height: calc(100vh - 2rem); display:flex; flex-direction:column; }
  #shf-modal-account .acc-pane { overflow-y:auto; }
  #shf-modal-account .shf-field input, #shf-modal-account .shf-field select { border-radius: 999px; padding:.65rem 1rem; }
  #shf-modal-account .shf-field select { appearance:none; -webkit-appearance:none; border:1px solid var(--border); background:var(--bg); color:var(--text); font:inherit; }
  #shf-modal-account .shf-field span { display:flex; align-items:center; gap:.5rem; font-weight:600; }
  #shf-modal-account input[readonly] { opacity:.75; cursor:not-allowed; }
  .acc-ok { font-style:normal; font-size:.72rem; color:#059669; background:rgba(16,185,129,.12); padding:.1rem .5rem; border-radius:999px; }
  .acc-id { display:flex; align-items:center; gap:.8rem; padding: 1rem 1.15rem .4rem; }
  .acc-avatar { width:48px; height:48px; border-radius:50%; background: color-mix(in srgb, var(--primary) 15%, transparent); color:var(--primary); display:grid; place-items:center; font-weight:700; font-size:1.15rem; flex-shrink:0; }
  .acc-id-name { font-weight:700; color:var(--text); }
  .acc-pills { display:flex; flex-wrap:wrap; gap:.35rem; margin-top:.25rem; }
  .acc-pill { font-size:.72rem; font-weight:600; padding:.15rem .6rem; border-radius:999px; background:var(--bg); border:1px solid var(--border); color:var(--text-muted); display:inline-flex; align-items:center; gap:.3rem; }
  .acc-pill.g { color:#059669; border-color:rgba(16,185,129,.35); background:rgba(16,185,129,.1); }
  .acc-pill.y { color:#b45309; border-color:rgba(245,158,11,.35); background:rgba(245,158,11,.1); }
  .acc-tabs { display:flex; gap:.25rem; margin: .5rem 1.15rem 0; padding:.25rem; border-radius:999px; background:var(--bg); border:1px solid var(--border); }
  .acc-tab { flex:1; border:none; background:none; color:var(--text-muted); font:inherit; font-size:.82rem; font-weight:600; padding:.5rem .6rem; border-radius:999px; cursor:pointer; white-space:nowrap; transition: background .15s, color .15s; }
  .acc-tab.active { background:var(--surface); color:var(--text); box-shadow:0 2px 8px -2px rgba(15,23,42,.15); }
  .acc-note { font-size:.8rem; line-height:1.5; color:var(--text-muted); background: color-mix(in srgb, var(--primary) 7%, transparent); border:1px solid color-mix(in srgb, var(--primary) 20%, transparent); border-radius:14px; padding:.6rem .8rem; }
  .acc-note i { color:var(--primary); margin-right:.3rem; }
  .acc-err { color:#dc2626; font-size:.75rem; min-height:0; }
  .acc-section { font-weight:700; font-size:.88rem; color:var(--text); display:flex; align-items:center; gap:.45rem; }
  .acc-section i { color:var(--primary); }
  .acc-inline-btn { align-self:flex-start; border-radius:999px; }
  .acc-role { border:1px solid var(--border); border-radius:16px; padding:.8rem .9rem; display:flex; flex-direction:column; gap:.45rem; font-size:.85rem; color:var(--text); }
  .acc-role a { color:var(--primary); font-weight:600; text-decoration:none; }
  .acc-row { display:flex; justify-content:space-between; gap:.6rem; }
  .acc-row span:first-child { color:var(--text-muted); }
  .shf-btn-green { background:#10b981; color:#fff; border:none; padding:.6rem 1.1rem; border-radius:8px; font:inherit; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:.45rem; transition: background .15s ease; }
  .shf-btn-green:hover { background:#059669; }
  .shf-btn-green:disabled { opacity:.6; cursor:not-allowed; }

  /* Notification bell dropdown */
  .shf-bell-panel { position: absolute; right: 0; top: calc(100% + .55rem); width: 360px; max-width: calc(100vw - 1.5rem); max-height: 460px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 20px 45px -15px rgba(0,0,0,.28); z-index: 1500; overflow: hidden; display: flex; flex-direction: column; opacity: 0; transform: translateY(-6px) scale(.98); pointer-events: none; transition: opacity .18s ease, transform .18s ease; }
  .shf-bell-panel.open { opacity: 1; transform: none; pointer-events: auto; }
  @media (max-width: 640px){
    .shf-bell-panel { position: fixed; top: calc(var(--header-h, 64px) + .4rem); right: .6rem; left: .6rem; width: auto; max-width: none; max-height: calc(100vh - var(--header-h, 64px) - 1rem); }
  }
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
        // Close the notification bell panel so the two menus don't overlap
        const bp = document.querySelector('.shf-bell-panel');
        if (bp && bp.classList.contains('open')) {
          bp.classList.remove('open');
          bp.setAttribute('aria-hidden', 'true');
          const bb = document.querySelector('[data-bell-toggle]');
          if (bb) bb.setAttribute('aria-expanded', 'false');
        }
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

      const accEsc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const normPhone = (raw) => {
        const d = String(raw || '').replace(/[\s\-()]/g, '');
        if (!d) return '';
        if (/^0[67]\d{8}$/.test(d)) return '+255' + d.slice(1);
        if (/^\+?255[67]\d{8}$/.test(d)) return '+' + d.replace(/^\+/, '');
        return null;
      };

      if (e.target.closest('[data-account-settings]')) {
        document.getElementById('shf-acc-name').value = user.name || '';
        document.getElementById('shf-acc-phone').value = user.phone || '';
        document.getElementById('shf-acc-email').value = user.email || '';
        document.getElementById('shf-acc-phone-err').textContent = '';
        ['shf-acc-pw-cur','shf-acc-pw-new','shf-acc-pw-conf','shf-acc-seca'].forEach(id => { document.getElementById(id).value = ''; });
        const tabBtn = document.querySelector('[data-acc-tab="profile"]'); if (tabBtn) tabBtn.click();
        openModal('shf-modal-account');
        (async () => {
          try {
            const sb = await window.SHFCloud.ready;
            const { data: p } = await sb.from('profiles').select('full_name, role, verification_status, agency_status, university, home_campus, security_question').eq('id', user.id).maybeSingle();
            const prof = p || {};
            const role = prof.role || user.role || 'renter';
            const verified = prof.verification_status === 'verified' || prof.verification_status === 'approved';
            const name = prof.full_name || user.name || 'User';
            const roleLabel = { landlord:'Landlord', agency:'Agency', student:'Student', renter:'Tenant', admin:'Admin' }[role] || 'Member';
            const vPill = verified ? '<span class="acc-pill g"><i class="fas fa-circle-check"></i> Verified</span>' : '<span class="acc-pill y"><i class="fas fa-hourglass-half"></i> Verification ' + accEsc(prof.verification_status || 'pending') + '</span>';
            document.getElementById('shf-acc-id').innerHTML =
              '<div class="acc-avatar">' + accEsc(name.charAt(0).toUpperCase()) + '</div><div><div class="acc-id-name">' + accEsc(name) + '</div><div class="acc-pills"><span class="acc-pill">' + roleLabel + '</span>' + vPill + '</div></div>';
            let roleHtml = '';
            if (role === 'landlord' || role === 'agency') {
              const host = role === 'agency' || prof.agency_status === 'approved' ? 'Approved Agency' : (verified ? 'Verified Landlord' : 'Individual Host');
              roleHtml = '<div class="acc-role"><div class="acc-section"><i class="fas fa-building"></i> Host details</div>' +
                '<div class="acc-row"><span>Host status</span><span class="acc-pill ' + (verified ? 'g' : 'y') + '">' + host + '</span></div>' +
                '<div class="acc-row"><span>WhatsApp contact</span><span class="acc-pill ' + (user.phone ? 'g' : 'y') + '"><i class="fab fa-whatsapp"></i> ' + (user.phone ? 'Ready' : 'Add phone') + '</span></div>' +
                (prof.agency_status === 'pending' ? '<div class="acc-row"><span>Agency upgrade</span><span class="acc-pill y">Under review</span></div>' : '') +
                '<a href="/dashboard.html"><i class="fas fa-arrow-right"></i> Go to my listings</a></div>';
            } else if (role === 'student') {
              roleHtml = '<div class="acc-role"><div class="acc-section"><i class="fas fa-graduation-cap"></i> Student details</div>' +
                '<div class="acc-row"><span>University</span><span>' + accEsc(prof.university || '—') + '</span></div>' +
                '<div class="acc-row"><span>Home campus</span><span>' + accEsc(prof.home_campus || '—') + '</span></div>' +
                '<a href="/student-portal.html"><i class="fas fa-user-group"></i> Open my roommate matching profile</a></div>';
            }
            document.getElementById('shf-acc-role').innerHTML = roleHtml;
            const sq = document.getElementById('shf-acc-secq-current');
            sq.innerHTML = prof.security_question ? '<i class="fas fa-circle-info"></i> Current question: <strong>' + accEsc(prof.security_question) + '</strong>' : '<i class="fas fa-triangle-exclamation"></i> No security question set yet. Add one so you can recover your account without email.';
            const sel = document.getElementById('shf-acc-secq');
            if (prof.security_question) {
              if (![...sel.options].some(o => o.value === prof.security_question)) sel.add(new Option(prof.security_question, prof.security_question));
              sel.value = prof.security_question;
            }
          } catch (_) {}
        })();
        return;
      }
      const accTab = e.target.closest('[data-acc-tab]');
      if (accTab) {
        const t = accTab.dataset.accTab;
        document.querySelectorAll('[data-acc-tab]').forEach(b => { const on = b === accTab; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
        document.querySelectorAll('[data-acc-pane]').forEach(p => { p.hidden = p.dataset.accPane !== t; });
        const foot = document.querySelector('[data-acc-foot]'); if (foot) foot.style.display = t === 'profile' ? 'flex' : 'none';
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
          const rawPhone = document.getElementById('shf-acc-phone').value.trim();
          const errEl = document.getElementById('shf-acc-phone-err');
          errEl.textContent = '';
          if (!name || name.length > 80) { window.toast?.error('Please enter a name (max 80 characters).'); return; }
          const phone = normPhone(rawPhone);
          if (phone === null) { errEl.textContent = 'Use a Tanzanian number like 0713 686 105 or +255713686105.'; return; }
          btn.disabled = true;
          try {
            const sb = await window.SHFCloud.ready;
            const { error } = await sb.from('profiles').update({ full_name: name, phone: phone || null }).eq('id', user.id);
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
      if (e.target.closest('#shf-acc-pw-save')) {
        (async () => {
          const btn = e.target.closest('#shf-acc-pw-save');
          const cur = document.getElementById('shf-acc-pw-cur').value;
          const nw = document.getElementById('shf-acc-pw-new').value;
          const cf = document.getElementById('shf-acc-pw-conf').value;
          if (!cur) { window.toast?.error('Enter your current password.'); return; }
          if (nw.length < 8 || nw.length > 72) { window.toast?.error('New password must be 8–72 characters.'); return; }
          if (nw !== cf) { window.toast?.error('New passwords do not match.'); return; }
          if (nw === cur) { window.toast?.error('New password must be different.'); return; }
          btn.disabled = true;
          try {
            const sb = await window.SHFCloud.ready;
            const { error: authErr } = await sb.auth.signInWithPassword({ email: user.email, password: cur });
            if (authErr) throw new Error('Current password is incorrect.');
            const { error } = await sb.auth.updateUser({ password: nw });
            if (error) throw error;
            ['shf-acc-pw-cur','shf-acc-pw-new','shf-acc-pw-conf'].forEach(id => { document.getElementById(id).value = ''; });
            window.toast?.success('Password updated.');
          } catch (err) { window.toast?.error(err.message || 'Failed to update password.'); }
          finally { btn.disabled = false; }
        })();
        return;
      }
      if (e.target.closest('#shf-acc-secq-save')) {
        (async () => {
          const btn = e.target.closest('#shf-acc-secq-save');
          const q = document.getElementById('shf-acc-secq').value;
          const a = document.getElementById('shf-acc-seca').value.trim();
          if (a.length < 2 || a.length > 80) { window.toast?.error('Answer must be 2–80 characters.'); return; }
          btn.disabled = true;
          try {
            const sb = await window.SHFCloud.ready;
            const { error } = await sb.rpc('set_security_question', { _question: q, _answer: a });
            if (error) throw error;
            document.getElementById('shf-acc-seca').value = '';
            document.getElementById('shf-acc-secq-current').innerHTML = '<i class="fas fa-circle-info"></i> Current question: <strong>' + accEsc(q) + '</strong>';
            window.toast?.success('Security question saved.');
          } catch (err) { window.toast?.error(err.message || 'Failed to save security question.'); }
          finally { btn.disabled = false; }
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

// === Student welcome card on home page ===
(function () {
  function mountWelcome() {
    if (!/(^|\/)home\.html$|^\/$/.test(location.pathname)) return;
    if (document.getElementById('shf-student-welcome')) return;

    let user = null;
    try { user = JSON.parse(localStorage.getItem('shf-user') || 'null'); } catch (e) {}
    if (!user) return;
    const role = user.role || user.account_type;
    if (role !== 'student') return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const section = document.createElement('section');
    section.id = 'shf-student-welcome';
    section.style.cssText = 'padding:2rem 0 0;';
    const name = (user.name || '').split(' ')[0] || 'Student';
    section.innerHTML = `
      <div class="container">
        <div class="shf-sw-card">
          <div class="shf-sw-glow"></div>
          <div class="shf-sw-body">
            <div class="shf-sw-badge"><i class="fas fa-graduation-cap"></i> <span>Verified Student</span></div>
            <h2 class="shf-sw-title">🎓 Welcome ${escapeHtml(name)}</h2>
            <p class="shf-sw-text">As a verified student, MakaziLink helps you find accommodation faster, save money, and connect with other students. Discover the exclusive benefits available only to students.</p>
            <a href="/student-portal.html" class="shf-sw-btn">
              <i class="fas fa-sparkles"></i> Explore Student Benefits
              <i class="fas fa-arrow-right" style="margin-left:.35rem;"></i>
            </a>
          </div>
          <div class="shf-sw-art" aria-hidden="true">
            <i class="fas fa-house-user"></i>
          </div>
        </div>
      </div>`;
    hero.parentNode.insertBefore(section, hero.nextSibling);

    if (window.SHFI18n && typeof window.SHFI18n.apply === 'function') {
      try { window.SHFI18n.apply(section); } catch(e){}
    }
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Inject styles once
  const css = document.createElement('style');
  css.textContent = `
    .shf-sw-card {
      position: relative;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem 2.25rem;
      border-radius: 28px;
      background: linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, var(--bg)) 0%, var(--bg) 60%, color-mix(in oklab, #10b981 10%, var(--bg)) 100%);
      border: 1px solid color-mix(in oklab, var(--primary) 30%, var(--border));
      box-shadow: 0 20px 50px -20px color-mix(in oklab, var(--primary) 45%, transparent);
      overflow: hidden;
      opacity: 0; transform: translateY(16px);
      animation: shfSwIn .7s cubic-bezier(.2,.7,.2,1) forwards;
    }
    @keyframes shfSwIn { to { opacity:1; transform:translateY(0); } }
    .shf-sw-glow {
      position:absolute; top:-40%; right:-10%; width:340px; height:340px;
      background: radial-gradient(circle, color-mix(in oklab, var(--primary) 30%, transparent), transparent 60%);
      pointer-events:none;
    }
    .shf-sw-body { position:relative; z-index:1; max-width: 720px; }
    .shf-sw-badge {
      display:inline-flex; align-items:center; gap:.4rem;
      padding:.3rem .75rem; border-radius:999px;
      background: color-mix(in oklab, var(--primary) 15%, transparent);
      color: var(--primary);
      font-weight:600; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase;
      border:1px solid color-mix(in oklab, var(--primary) 30%, transparent);
      margin-bottom:.75rem;
    }
    .shf-sw-title { font-size: clamp(1.4rem, 2.4vw, 2rem); margin: 0 0 .5rem; color: var(--text); letter-spacing:-.01em; }
    .shf-sw-text { font-size: 1rem; line-height: 1.6; color: var(--text-muted); margin: 0 0 1.25rem; }
    .shf-sw-btn {
      display:inline-flex; align-items:center; gap:.5rem;
      padding:.85rem 1.5rem; border-radius:999px;
      background: var(--primary); color:#fff !important;
      font-weight:600; font-size:.95rem; text-decoration:none;
      box-shadow: 0 10px 24px -8px color-mix(in oklab, var(--primary) 60%, transparent);
      transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
    }
    .shf-sw-btn:hover { transform: translateY(-2px); background: var(--primary-dark); box-shadow: 0 14px 30px -8px color-mix(in oklab, var(--primary) 70%, transparent); }
    .shf-sw-art {
      position:relative; z-index:1;
      width: 120px; height: 120px; border-radius: 28px;
      display:flex; align-items:center; justify-content:center;
      background: color-mix(in oklab, var(--primary) 18%, transparent);
      color: var(--primary); font-size: 3rem;
      border:1px solid color-mix(in oklab, var(--primary) 30%, transparent);
    }
    @media (max-width: 720px) {
      .shf-sw-card { grid-template-columns: 1fr; padding: 1.5rem; }
      .shf-sw-art { display:none; }
    }
  `;
  document.head.appendChild(css);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWelcome, { once: true });
  } else {
    mountWelcome();
  }
  window.addEventListener('shf:login-success', mountWelcome);
})();

