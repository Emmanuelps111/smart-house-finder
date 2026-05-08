// Header & footer injectors
(function () {
  const path = location.pathname.split('/').pop() || 'home.html';
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
      <li><a href="/about.html" class="${path==='about.html'?'active':''}">About</a></li>
      <li><a href="/contact.html" class="${path==='contact.html'?'active':''}">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" data-theme-toggle aria-label="Toggle theme"><i data-theme-icon class="fas fa-moon"></i></button>
      <a href="/login.html" class="btn btn-primary" style="padding:.55rem 1.1rem;">Sign In</a>
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

  document.addEventListener('DOMContentLoaded', () => {
    const h = document.getElementById('header-mount');
    const f = document.getElementById('footer-mount');
    if (h) h.outerHTML = header;
    if (f) f.outerHTML = footer;
  });
})();
