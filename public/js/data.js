// Listings are now exclusively sourced from Lovable Cloud (landlord-submitted, admin-approved).
window.SHF_LISTINGS = [];


window.SHF = window.SHF || {};
window.SHF.formatPrice = function (n) {
  try { return 'TSh ' + Number(n).toLocaleString('en-TZ'); }
  catch (e) { return 'TSh ' + n; }
};

// === Proximity & Commute Cost Calculator ===
window.SHF.CAMPUS = { name: 'UDSM Main Campus', lat: -6.7741, lng: 39.2417 };
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
window.SHF.proximityBadges = function (lat, lng) {
  // Student-only feature: hide commute/walk/distance from renters & landlords
  try {
    const u = JSON.parse(localStorage.getItem('shf-user') || 'null');
    if (!u || u.role !== 'student') return '';
  } catch (e) { return ''; }
  const km = window.SHF.haversineKm(lat, lng, window.SHF.CAMPUS.lat, window.SHF.CAMPUS.lng);
  if (km == null) return '';
  const cost = window.SHF.commuteCostTZS(km);
  const walk = window.SHF.walkingTime(km);
  return `<div class="proximity-badges" style="display:flex;flex-wrap:wrap;gap:.35rem;margin:.5rem 0;">
    <span class="badge" style="background:#E0F2FE;color:#0369A1;border:none;">📍 ${km.toFixed(1)} km to Campus</span>
    <span class="badge" style="background:#FEF3C7;color:#92400E;border:none;">🛵 ~TSh ${cost.toLocaleString('en-TZ')}/day</span>
    <span class="badge" style="background:#DCFCE7;color:#166534;border:none;">🚶 ${walk}</span>
    <span class="badge" style="background:#EDE9FE;color:#5B21B6;border:none;">🎓 10% Student Discount</span>
  </div>`;
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
      has_video: !!p.video_url,
      lat: p.lat != null ? Number(p.lat) : null,
      lng: p.lng != null ? Number(p.lng) : null,
      desc: p.description || '',
      occupancy: p.occupancy || 'vacant',
      deposit_months: p.deposit_months,
      contact_phone: p.contact_phone,
      available_from: p.available_from,
      created_at: p.created_at,
    }));

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
