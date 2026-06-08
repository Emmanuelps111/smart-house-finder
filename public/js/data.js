// Sample listings data — Tanzanian properties, prices in TZS / month
window.SHF_LISTINGS = [
  { id:1, title:'Modern Studio near UDSM',           price:450000,  beds:1, baths:1, area:'40 sqm',  city:'Dar es Salaam', neighborhood:'Mwenge',     tag:'Student-Friendly', amenities:['Wi-Fi','Furnished'], image_urls:['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=70'], img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=70', lat:-6.7741, lng:39.2417, desc:'Bright furnished studio, 5 min walk from University of Dar es Salaam. All bills and Wi-Fi included.', occupancy:'vacant' },
  { id:2, title:'Shared 4-Bedroom House',            price:1200000, beds:4, baths:2, area:'160 sqm', city:'Dar es Salaam', neighborhood:'Kinondoni',  tag:'Shared',           amenities:['Wi-Fi','Parking','Garden'], image_urls:['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=70'], img:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=70', lat:-6.7833, lng:39.2667, desc:'Spacious house perfect for student groups. Garden, fast Wi-Fi, washing machine, secure parking.', occupancy:'vacant' },
  { id:3, title:'Luxury 2-Bed Apartment Masaki',     price:2800000, beds:2, baths:2, area:'95 sqm',  city:'Dar es Salaam', neighborhood:'Masaki',     tag:'Premium',          amenities:['Air conditioning','Security','Parking'], image_urls:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=70'], img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=70', lat:-6.7424, lng:39.2787, desc:'Sea-view apartment with concierge, gym and underground parking. Fully serviced.', occupancy:'vacant' },
  { id:4, title:'Cozy En-suite Room',                price:280000,  beds:1, baths:1, area:'18 sqm',  city:'Arusha',        neighborhood:'Njiro',      tag:'En-suite',         amenities:['Wi-Fi','Security'], image_urls:['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=70'], img:'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=70', lat:-3.4012, lng:36.7081, desc:'Private en-suite room in friendly student house, all utilities included, secure compound.', occupancy:'vacant' },
  { id:5, title:'Renovated Townhouse',               price:950000,  beds:3, baths:2, area:'140 sqm', city:'Mwanza',        neighborhood:'Ilemela',    tag:'New Build',        amenities:['Garden','Parking'], image_urls:['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=70'], img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=70', lat:-2.5167, lng:32.9000, desc:'Recently renovated 3-bed townhouse, garden, near transport links and Lake Victoria.', occupancy:'vacant' },
  { id:6, title:'Budget Single Room',                price:150000,  beds:1, baths:1, area:'14 sqm',  city:'Dodoma',        neighborhood:'Area C',     tag:'Budget',           amenities:['Water tank'], image_urls:['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=70'], img:'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=70', lat:-6.1730, lng:35.7419, desc:'Affordable single room in a clean shared house, ideal for first-year students at UDOM.', occupancy:'vacant' },
  { id:7, title:'Penthouse with Ocean View',         price:3500000, beds:2, baths:2, area:'110 sqm', city:'Zanzibar',      neighborhood:'Stone Town', tag:'Premium',          amenities:['Balcony','Air conditioning'], image_urls:['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=70'], img:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=70', lat:-6.1659, lng:39.2026, desc:'Top-floor penthouse with panoramic ocean views, balcony and modern finishes.', occupancy:'vacant' },
  { id:8, title:'Garden Flat near SUA',              price:520000,  beds:2, baths:1, area:'60 sqm',  city:'Morogoro',      neighborhood:'Mazimbu',    tag:'Garden',           amenities:['Garden','Pet friendly'], image_urls:['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=70'], img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=70', lat:-6.8278, lng:37.6591, desc:'Ground-floor flat with private garden, pet-friendly, 10 min to Sokoine University.', occupancy:'vacant' },
  { id:9, title:'Affordable Studio',                 price:380000,  beds:1, baths:1, area:'30 sqm',  city:'Mbeya',         neighborhood:'Iyunga',     tag:'Student-Friendly', amenities:['Wi-Fi'], image_urls:['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=70'], img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=70', lat:-8.9094, lng:33.4608, desc:'Compact, modern studio with study desk and high-speed internet, near Mbeya University.', occupancy:'vacant' },
];

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
  const km = window.SHF.haversineKm(lat, lng, window.SHF.CAMPUS.lat, window.SHF.CAMPUS.lng);
  if (km == null) return '';
  const cost = window.SHF.commuteCostTZS(km);
  const walk = window.SHF.walkingTime(km);
  return `<div class="proximity-badges" style="display:flex;flex-wrap:wrap;gap:.35rem;margin:.5rem 0;">
    <span class="badge" style="background:#E0F2FE;color:#0369A1;border:none;">📍 ${km.toFixed(1)} km to Campus</span>
    <span class="badge" style="background:#FEF3C7;color:#92400E;border:none;">🛵 ~TSh ${cost.toLocaleString('en-TZ')}/day</span>
    <span class="badge" style="background:#DCFCE7;color:#166534;border:none;">🚶 ${walk}</span>
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
      .select('id, landlord_id, title, description, address, price, beds, baths, size_sqm, city, neighbourhood, property_type, furnishing, image_urls, amenities, lat, lng, status, occupancy, deposit_months, contact_phone, available_from, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) { console.warn('[SHF] properties fetch failed:', error.message); return; }
    if (!data || !data.length) return;

    const placeholder = 'https://placehold.co/900x600?text=No+photo';
    const mapped = data.map(p => ({
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
      image_urls: Array.isArray(p.image_urls) ? p.image_urls.filter(Boolean) : [],
      img: (Array.isArray(p.image_urls) && p.image_urls[0]) || placeholder,
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
