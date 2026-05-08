// Smart House Finder - shared JS
(function () {
  'use strict';

  // Preloader
  window.addEventListener('load', () => {
    const p = document.getElementById('preloader');
    if (p) setTimeout(() => p.classList.add('hidden'), 300);
  });

  // Theme
  const THEME_KEY = 'shf-theme';
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-theme-toggle]');
    if (!t) return;
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem(THEME_KEY, cur);
    updateThemeIcon();
  });
  function updateThemeIcon() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.className = dark ? 'fas fa-sun' : 'fas fa-moon';
    });
  }
  updateThemeIcon();

  // Header scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    const bt = document.getElementById('backTop');
    if (bt) bt.classList.toggle('show', window.scrollY > 400);
  });

  // Mobile menu
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-menu-toggle]')) {
      document.querySelector('.nav-links')?.classList.toggle('open');
    } else if (!e.target.closest('.nav-links') && !e.target.closest('[data-menu-toggle]')) {
      document.querySelector('.nav-links')?.classList.remove('open');
    }
  });

  // Back to top
  document.addEventListener('click', (e) => {
    if (e.target.closest('#backTop')) window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // FAQ
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => q.parentElement.classList.toggle('open'));
  });

  // Carousel
  document.querySelectorAll('.carousel').forEach(c => {
    const track = c.querySelector('.carousel-track');
    const dots = c.querySelectorAll('.carousel-dots button');
    let i = 0;
    const total = c.querySelectorAll('.testimonial').length;
    const go = (n) => {
      i = (n + total) % total;
      track.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
    };
    dots.forEach((d, idx) => d.addEventListener('click', () => go(idx)));
    setInterval(() => go(i + 1), 5000);
  });

  // Lightbox
  const lb = document.querySelector('.lightbox');
  document.addEventListener('click', (e) => {
    const img = e.target.closest('[data-lightbox]');
    if (img && lb) {
      lb.querySelector('img').src = img.src;
      lb.classList.add('open');
    }
    if (e.target.closest('.lightbox-close') || e.target === lb) lb?.classList.remove('open');
  });

  // Contact form validation
  const cf = document.getElementById('contactForm');
  if (cf) {
    cf.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const fields = [
        { id: 'cf-name', test: v => v.trim().length >= 2, msg: 'Please enter your name (min 2 chars).' },
        { id: 'cf-email', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email.' },
        { id: 'cf-msg', test: v => v.trim().length >= 10, msg: 'Message must be at least 10 characters.' },
      ];
      fields.forEach(f => {
        const el = document.getElementById(f.id);
        const err = el.parentElement.querySelector('.error');
        if (!f.test(el.value)) { err.textContent = f.msg; ok = false; } else { err.textContent = ''; }
      });
      if (ok) {
        cf.innerHTML = '<div style="text-align:center;padding:2rem;"><i class="fas fa-check-circle" style="font-size:3rem;color:var(--primary);margin-bottom:1rem;"></i><h3>Thank you!</h3><p>We received your message and will reply within 24 hours.</p></div>';
      }
    });
  }
})();
