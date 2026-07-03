// Lightweight EN <-> SW translator for Smart House Finder
// Walks text nodes + common attributes, replacing matches from a dictionary.
// Persists user's choice in localStorage under 'shf-lang'.
(function () {
  const LANG_KEY = 'shf-lang';
  const DEFAULT = 'en';

  // English -> Swahili dictionary. Keys are compared case-sensitively after trim.
  // Keep phrases as they appear in the UI. Longer phrases are matched before short ones.
  const DICT_SW = {
    // Nav & common
    'Home': 'Nyumbani',
    'Listings': 'Matangazo',
    'Map': 'Ramani',
    'Pricing': 'Bei',
    'Contact': 'Wasiliana',
    'About': 'Kuhusu',
    'Sign In': 'Ingia',
    'Sign Up': 'Jisajili',
    'Log out': 'Toka',
    'Logout': 'Toka',
    'Account': 'Akaunti',
    'Notifications': 'Arifa',
    'Admin': 'Msimamizi',
    'Admin dashboard': 'Dashibodi ya Msimamizi',
    'Admin Dashboard': 'Dashibodi ya Msimamizi',
    'Landlord dashboard': 'Dashibodi ya Mmiliki',
    'Browse listings': 'Vinjari matangazo',
    'Menu': 'Menyu',
    'Toggle theme': 'Badilisha mandhari',
    'Back to top': 'Rudi juu',
    'Language': 'Lugha',
    'English': 'Kiingereza',
    'Swahili': 'Kiswahili',

    // Auth
    'Email': 'Barua pepe',
    'Password': 'Nenosiri',
    'Confirm password': 'Thibitisha nenosiri',
    'Confirm new password': 'Thibitisha nenosiri jipya',
    'New password': 'Nenosiri jipya',
    'Full name': 'Jina kamili',
    'Phone': 'Simu',
    'Phone number': 'Namba ya simu',
    'Role': 'Jukumu',
    'Renter': 'Mpangaji',
    'Student': 'Mwanafunzi',
    'Landlord': 'Mmiliki',
    'Forgot password?': 'Umesahau nenosiri?',
    'Forgot password': 'Umesahau nenosiri',
    'New here?': 'Mgeni hapa?',
    'First Time?': 'Mara ya kwanza?',
    'Create account': 'Fungua akaunti',
    'Already have an account?': 'Una akaunti tayari?',
    'Sign in with Google': 'Ingia na Google',
    'Welcome back': 'Karibu tena',

    // Listings
    'Find your next home': 'Tafuta nyumba yako inayofuata',
    'Search': 'Tafuta',
    'Filters': 'Vichujio',
    'Sort by': 'Panga kwa',
    'Price': 'Bei',
    'Price: Low to High': 'Bei: Chini kwenda Juu',
    'Price: High to Low': 'Bei: Juu kwenda Chini',
    'Newest': 'Mpya zaidi',
    'Oldest': 'Zamani zaidi',
    'Date': 'Tarehe',
    'Location': 'Eneo',
    'Bedrooms': 'Vyumba vya kulala',
    'Bathrooms': 'Vyoo',
    'Size': 'Ukubwa',
    'Amenities': 'Huduma',
    'Description': 'Maelezo',
    'View details': 'Angalia maelezo',
    'Details': 'Maelezo',
    'Listed by': 'Imewekwa na',
    'Verified Landlord': 'Mmiliki Aliyeidhinishwa',
    'Vacant': 'Wazi',
    'Occupied': 'Imekaliwa',
    'Available': 'Inapatikana',
    'per month': 'kwa mwezi',
    'month': 'mwezi',
    'Request Viewing': 'Omba Kuangalia',
    'Contact Landlord': 'Wasiliana na Mmiliki',
    'Message': 'Ujumbe',
    'Call': 'Piga simu',
    'WhatsApp': 'WhatsApp',
    'Send': 'Tuma',
    'Cancel': 'Ghairi',
    'Save': 'Hifadhi',
    'Submit': 'Wasilisha',
    'Update': 'Sasisha',
    'Delete': 'Futa',
    'Edit': 'Hariri',
    'Approve': 'Idhinisha',
    'Reject': 'Kataa',
    'Pending': 'Inasubiri',
    'Approved': 'Imeidhinishwa',
    'Rejected': 'Imekataliwa',
    'Loading...': 'Inapakia...',
    'No results': 'Hakuna matokeo',
    'No listings found': 'Hakuna matangazo yaliyopatikana',

    // Roommate
    'Find a Roommate to Split Cost': 'Tafuta Mwenzi wa Kugawana Gharama',
    'Roommate Requests': 'Maombi ya Wenzi',
    'Cleanliness': 'Usafi',
    'Sleep schedule': 'Ratiba ya usingizi',
    'Early Bird': 'Anaamka mapema',
    'Night Owl': 'Anakesha usiku',
    'Flexible': 'Muhuri',
    'High': 'Juu',
    'Medium': 'Wastani',
    'Bio': 'Wasifu',

    // Commute badge
    'to Campus': 'hadi Chuo',
    'walk': 'kutembea',
    'min walk': 'dakika za kutembea',
    'Estimated daily transport': 'Makadirio ya usafiri wa siku',

    // Home / hero
    'Get Started': 'Anza',
    'Learn More': 'Jifunze Zaidi',
    'Browse Listings': 'Vinjari Matangazo',
    'Direct Connection': 'Muunganisho wa Moja kwa Moja',
    'Trusted Landlords': 'Wamiliki Wanaoaminika',
    'Smart Search': 'Utafutaji Mahiri',
    'Why choose us': 'Kwa nini utuchague',
    'How it works': 'Jinsi inavyofanya kazi',
    'Ready to find your next home?': 'Uko tayari kupata nyumba yako inayofuata?',

    // Contact
    'Get in touch': 'Wasiliana nasi',
    'Your name': 'Jina lako',
    'Your email': 'Barua pepe yako',
    'Your message': 'Ujumbe wako',
    'Send message': 'Tuma ujumbe',
    'Send Message': 'Tuma Ujumbe',

    // Footer
    'All rights reserved.': 'Haki zote zimehifadhiwa.',
  };

  const DICTS = { en: null, sw: DICT_SW };

  function currentLang() {
    return localStorage.getItem(LANG_KEY) || DEFAULT;
  }

  // Build a reverse map so we can restore English from Swahili too.
  function reverseDict(d) {
    const r = {};
    for (const k in d) r[d[k]] = k;
    return r;
  }
  const REV_SW = reverseDict(DICT_SW);

  // Translate a trimmed string using the given map; return null if no match.
  function lookup(map, text) {
    if (map[text]) return map[text];
    return null;
  }

  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'value'];

  function translateNode(root, targetLang) {
    if (!root) return;
    // Pick maps: to->target, from->reverse-of-other
    let toMap = null, fromMap = null;
    if (targetLang === 'sw') { toMap = DICT_SW; fromMap = REV_SW; }
    else { toMap = REV_SW; fromMap = DICT_SW; } // to English: SW->EN

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('[data-no-i18n]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const orig = n.nodeValue;
      const trimmed = orig.trim();
      const hit = lookup(toMap, trimmed);
      if (hit) {
        n.nodeValue = orig.replace(trimmed, hit);
      }
    }

    // Attributes
    const els = root.querySelectorAll ? root.querySelectorAll('*') : [];
    els.forEach((el) => {
      if (el.closest && el.closest('[data-no-i18n]')) return;
      ATTRS.forEach((a) => {
        if (!el.hasAttribute(a)) return;
        if (a === 'value' && !['button', 'submit', 'reset'].includes((el.type || '').toLowerCase())) return;
        const v = el.getAttribute(a);
        if (!v) return;
        const t = v.trim();
        const hit = lookup(toMap, t);
        if (hit) el.setAttribute(a, v.replace(t, hit));
      });
    });
  }

  function applyLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    if (lang === 'sw') {
      translateNode(document.body, 'sw');
    } else {
      translateNode(document.body, 'en');
    }
    // Update switch label
    document.querySelectorAll('[data-lang-label]').forEach((el) => {
      el.textContent = lang === 'sw' ? 'SW' : 'EN';
    });
  }

  // Observe DOM changes so newly injected content (cards, modals, toasts) also translate.
  function observe() {
    const obs = new MutationObserver((muts) => {
      if (currentLang() !== 'sw') return;
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) translateNode(n, 'sw');
          else if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) {
            const hit = DICT_SW[n.nodeValue.trim()];
            if (hit) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), hit);
          }
        });
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  window.SHFi18n = {
    get lang() { return currentLang(); },
    set(lang) { applyLang(lang); },
    toggle() { applyLang(currentLang() === 'sw' ? 'en' : 'sw'); },
    translate: translateNode,
  };

  // Initial application (after header injection)
  document.addEventListener('DOMContentLoaded', () => {
    // Give partials.js a tick to mount header/footer
    setTimeout(() => {
      applyLang(currentLang());
      observe();
    }, 30);
  });
})();
