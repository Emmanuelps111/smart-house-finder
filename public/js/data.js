// Listings are now exclusively sourced from Lovable Cloud (landlord-submitted, admin-approved).
window.SHF_LISTINGS = [];


window.SHF = window.SHF || {};
window.SHF.formatPrice = function (n) {
  try { return 'TSh ' + Number(n).toLocaleString('en-TZ'); }
  catch (e) { return 'TSh ' + n; }
};

window.SHF.timeAgo = function (date) {
  if (!date) return 'recently';
  const then = new Date(date).getTime();
  if (isNaN(then)) return 'recently';
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 0) return 'just now';
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

// === Proximity & Commute Cost Calculator ===
window.SHF.CAMPUSES = [
  { key: 'all',     name: 'All Locations',          lat: null,     lng: null },
  { key: 'mlimani', name: 'Main Campus (Mlimani)',  lat: -6.7749,  lng: 39.2026 },
  { key: 'coict',   name: "COICT Kijitonyama",       lat: -6.7645,  lng: 39.2435 },
  { key: 'muhas',   name: 'MUHAS Upanga',           lat: -6.8062,  lng: 39.2721 },
  { key: 'duce',    name: "DUCE Chang'ombe",         lat: -6.8412,  lng: 39.2743 },
];
try {
  const saved = localStorage.getItem('shf-campus');
  const found = window.SHF.CAMPUSES.find(c => c.key === saved);
  window.SHF.CAMPUS = found || window.SHF.CAMPUSES[1];
} catch (e) { window.SHF.CAMPUS = window.SHF.CAMPUSES[1]; }
window.SHF.setCampus = function (key) {
  const c = window.SHF.CAMPUSES.find(x => x.key === key) || window.SHF.CAMPUSES[1];
  window.SHF.CAMPUS = c;
  try { localStorage.setItem('shf-campus', c.key); } catch(e){}
  window.dispatchEvent(new CustomEvent('shf:campus-changed', { detail: c }));
};
window.SHF.haversineKm = function (lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some(v => v == null || isNaN(v))) return null;
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
};
window.SHF.commuteCostTZS = function (km) {
  if (km == null) return null;
  const oneWay = Math.max(1000, Math.ceil((km / 2) * 1000));
  return oneWay * 2;
};
window.SHF.walkingTime = function (km) {
  if (km == null) return null;
  const mins = Math.round((km / 5) * 60);
  if (mins < 60) return mins + ' min walk';
  const h = Math.floor(mins / 60), m = mins % 60;
  return h + 'h ' + m + 'm walk';
};
window.SHF.distanceKm = function (lat, lng) {
  const c = window.SHF.CAMPUS;
  if (!c || c.lat == null || c.lng == null) return null;
  return window.SHF.haversineKm(lat, lng, c.lat, c.lng);
};
window.SHF.proximityBadges = function (lat, lng) {
  // Student-only feature: hide commute/walk/distance from renters & landlords
  try {
    const u = JSON.parse(localStorage.getItem('shf-user') || 'null');
    if (!u || u.role !== 'student') return '';
  } catch (e) { return ''; }
  const c = window.SHF.CAMPUS;
  if (!c || c.lat == null || c.lng == null) return '';
  const km = window.SHF.haversineKm(lat, lng, c.lat, c.lng);
  if (km == null) return '';
  const cost = window.SHF.commuteCostTZS(km);
  const walk = window.SHF.walkingTime(km);
  return `<div class="proximity-badges" style="display:flex;flex-wrap:wrap;gap:.35rem;margin:.5rem 0;">
    <span class="badge" style="background:#EFF6FF;color:#1E40AF;border:none;flex:1;text-align:center;"><i class="fas fa-map-pin" style="color:#3B82F6;margin-right:.3rem;"></i>${km.toFixed(1)} km to ${c.name}</span>
    <span class="badge" style="background:#EFF6FF;color:#1E40AF;border:none;flex:1;text-align:center;"><i class="fas fa-taxi" style="color:#3B82F6;margin-right:.3rem;"></i>~TSh ${cost.toLocaleString('en-TZ')}/day</span>
    <span class="badge" style="background:#EFF6FF;color:#1E40AF;border:none;flex:1;text-align:center;"><i class="fas fa-person-walking" style="color:#3B82F6;margin-right:.3rem;"></i>${walk}</span>
  </div>`;
};

window.SHF.starString = function (rating, max) {
  max = max || 5;
  const r = Math.round(rating || 0);
  return '★'.repeat(r) + '☆'.repeat(Math.max(0, max - r));
};

window.SHF.ratingBadge = function (avg, count) {
  if (!count) return `<span class="badge" style="background:#F3F4F6;color:#6B7280;border:none;"><i class="far fa-star"></i> No ratings yet</span>`;
  return `<span class="badge" style="background:#FEF3C7;color:#92400E;border:none;font-weight:600;"><span style="color:#F59E0B;">${window.SHF.starString(avg)}</span> ${Number(avg).toFixed(1)} <span style="opacity:.7;font-weight:500;">(${count})</span></span>`;
};

window.SHF.getLandlordRating = async function (landlordId) {
  try {
    if (!landlordId || !window.SHFCloud) return { avg: 0, count: 0 };
    const sb = await window.SHFCloud.ready;
    const { data: props } = await sb.from('properties').select('id').eq('landlord_id', landlordId);
    if (!props || !props.length) return { avg: 0, count: 0 };
    const ids = props.map(p => p.id);
    const { data: revs, error } = await sb.from('property_reviews').select('rating').in('property_id', ids);
    if (error || !revs || !revs.length) return { avg: 0, count: 0 };
    const sum = revs.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return { avg: sum / revs.length, count: revs.length };
  } catch (e) { return { avg: 0, count: 0 }; }
};

window.SHF.occupancyBadge = function (occ) {
  const isOcc = occ === 'occupied';
  return `<span class="badge" style="background:${isOcc?'#FEE2E2':'#DCFCE7'};color:${isOcc?'#B91C1C':'#166534'};border:none;">${isOcc?'🔴 Occupied':'🟢 Vacant'}</span>`;
};

// Defaults for any listing missing these fields
window.SHF_LISTINGS.forEach(l => {
  if (!l.amenities) l.amenities = [];
  if (!l.image_urls) l.image_urls = l.img ? [l.img] : [];
  if (!l.occupancy) l.occupancy = 'vacant';
});

function sortListings() {
  window.SHF_LISTINGS.sort((a, b) => {
    const aDsm = /dar es salaam/i.test(a.city || '') ? 0 : 1;
    const bDsm = /dar es salaam/i.test(b.city || '') ? 0 : 1;
    return aDsm - bDsm;
  });
}
sortListings();

// === Load landlord-submitted properties from Lovable Cloud ===
window.SHF.fetchDbListings = async function () {
  if (!window.SHFCloud || !window.SHFCloud.ready) return;
  try {
    const sb = await window.SHFCloud.ready;
    const { data, error } = await sb
      .from('properties')
      .select('id, landlord_id, title, description, address, price, beds, baths, size_sqm, city, neighbourhood, property_type, furnishing, image_urls, amenities, lat, lng, status, occupancy, deposit_months, contact_phone, available_from, created_at, video_url')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) { console.warn('[SHF] properties fetch failed:', error.message); return; }
    if (!data || !data.length) return;

    const mapped = data.map(p => {
      const photos = Array.isArray(p.image_urls) ? p.image_urls.filter(Boolean) : [];
      return ({
      id: 'db-' + p.id,
      dbId: p.id,
      landlord_id: p.landlord_id,
      isDb: true,
      title: p.title || 'Untitled property',
      price: Number(p.price) || 0,
      beds: p.beds || 0,
      baths: p.baths || 0,
      size_sqm: p.size_sqm,
      area: p.size_sqm ? `${p.size_sqm} sqm` : '—',
      city: p.city || '',
      neighborhood: p.neighbourhood || '',
      address: p.address || '',
      tag: p.property_type || 'Property',
      furnishing: p.furnishing || '',
      amenities: Array.isArray(p.amenities) ? p.amenities : [],
      image_urls: photos,
      img: photos[0] || '',
      video_url: p.video_url || '',
      has_video: !!p.video_url,
      lat: p.lat != null ? Number(p.lat) : null,
      lng: p.lng != null ? Number(p.lng) : null,
      desc: p.description || '',
      occupancy: p.occupancy || 'vacant',
      deposit_months: p.deposit_months,
      contact_phone: p.contact_phone,
      available_from: p.available_from,
      created_at: p.created_at,
    });
    });

    // Replace any prior db-* entries (so updates reflect)
    window.SHF_LISTINGS = window.SHF_LISTINGS.filter(l => !(typeof l.id === 'string' && l.id.startsWith('db-')));
    window.SHF_LISTINGS = window.SHF_LISTINGS.concat(mapped);
    sortListings();
    window.dispatchEvent(new CustomEvent('shf:listings-updated', { detail: { added: mapped.length } }));
  } catch (e) {
    console.warn('[SHF] fetchDbListings error:', e);
  }
};

window.SHF.fetchDbListings();
if (!window.SHFCloud) {
  const retry = () => window.SHF.fetchDbListings();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', retry, { once: true });
  } else {
    setTimeout(retry, 50);
  }
}

// Realtime: refetch when any property row changes (e.g. landlord flips occupancy)
(async () => {
  try {
    if (!window.SHFCloud || !window.SHFCloud.ready) return;
    const sb = await window.SHFCloud.ready;
    sb.channel('shf-properties-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' },
          () => window.SHF.fetchDbListings())
      .subscribe();
  } catch(e) { /* noop */ }
})();


// === Video first-frame poster capture (cached) ===
window.SHF.__posterCache = window.SHF.__posterCache || {};
window.SHF.capturePoster = function (videoUrl) {
  if (!videoUrl) return Promise.reject(new Error('no url'));
  const cache = window.SHF.__posterCache;
  if (cache[videoUrl]) return cache[videoUrl];
  cache[videoUrl] = new Promise((resolve, reject) => {
    try {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.crossOrigin = 'anonymous';
      v.muted = true;
      v.playsInline = true;
      v.src = videoUrl;
      const done = (err, url) => {
        v.remove();
        if (err) { delete cache[videoUrl]; reject(err); } else { resolve(url); }
      };
      v.addEventListener('loadeddata', () => {
        try { v.currentTime = 0.05; } catch(e){}
      });
      v.addEventListener('seeked', () => {
        try {
          const c = document.createElement('canvas');
          c.width = v.videoWidth || 640;
          c.height = v.videoHeight || 480;
          c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
          done(null, c.toDataURL('image/jpeg', 0.82));
        } catch (e) { done(e); }
      }, { once: true });
      v.addEventListener('error', () => done(new Error('video load error')), { once: true });
      setTimeout(() => done(new Error('timeout')), 8000);
    } catch (e) { reject(e); }
  });
  return cache[videoUrl];
};

