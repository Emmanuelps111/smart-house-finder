// Sample listings data — Tanzanian properties, prices in TZS / month
window.SHF_LISTINGS = [
  { id:1, title:'Modern Studio near UDSM',           price:450000,  beds:1, baths:1, area:'40 sqm',  city:'Dar es Salaam', neighborhood:'Mwenge',     tag:'Student-Friendly', img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=70', lat:-6.7741, lng:39.2417, desc:'Bright furnished studio, 5 min walk from University of Dar es Salaam. All bills and Wi-Fi included.' },
  { id:2, title:'Shared 4-Bedroom House',            price:1200000, beds:4, baths:2, area:'160 sqm', city:'Dar es Salaam', neighborhood:'Kinondoni',  tag:'Shared',           img:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=70', lat:-6.7833, lng:39.2667, desc:'Spacious house perfect for student groups. Garden, fast Wi-Fi, washing machine, secure parking.' },
  { id:3, title:'Luxury 2-Bed Apartment Masaki',     price:2800000, beds:2, baths:2, area:'95 sqm',  city:'Dar es Salaam', neighborhood:'Masaki',     tag:'Premium',          img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=70', lat:-6.7424, lng:39.2787, desc:'Sea-view apartment with concierge, gym and underground parking. Fully serviced.' },
  { id:4, title:'Cozy En-suite Room',                price:280000,  beds:1, baths:1, area:'18 sqm',  city:'Arusha',        neighborhood:'Njiro',      tag:'En-suite',         img:'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=70', lat:-3.4012, lng:36.7081, desc:'Private en-suite room in friendly student house, all utilities included, secure compound.' },
  { id:5, title:'Renovated Townhouse',               price:950000,  beds:3, baths:2, area:'140 sqm', city:'Mwanza',        neighborhood:'Ilemela',    tag:'New Build',        img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=70', lat:-2.5167, lng:32.9000, desc:'Recently renovated 3-bed townhouse, garden, near transport links and Lake Victoria.' },
  { id:6, title:'Budget Single Room',                price:150000,  beds:1, baths:1, area:'14 sqm',  city:'Dodoma',        neighborhood:'Area C',     tag:'Budget',           img:'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=70', lat:-6.1730, lng:35.7419, desc:'Affordable single room in a clean shared house, ideal for first-year students at UDOM.' },
  { id:7, title:'Penthouse with Ocean View',         price:3500000, beds:2, baths:2, area:'110 sqm', city:'Zanzibar',      neighborhood:'Stone Town', tag:'Premium',          img:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=70', lat:-6.1659, lng:39.2026, desc:'Top-floor penthouse with panoramic ocean views, balcony and modern finishes.' },
  { id:8, title:'Garden Flat near SUA',              price:520000,  beds:2, baths:1, area:'60 sqm',  city:'Morogoro',      neighborhood:'Mazimbu',    tag:'Garden',           img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=70', lat:-6.8278, lng:37.6591, desc:'Ground-floor flat with private garden, pet-friendly, 10 min to Sokoine University.' },
  { id:9, title:'Affordable Studio',                 price:380000,  beds:1, baths:1, area:'30 sqm',  city:'Mbeya',         neighborhood:'Iyunga',     tag:'Student-Friendly', img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=70', lat:-8.9094, lng:33.4608, desc:'Compact, modern studio with study desk and high-speed internet, near Mbeya University.' },
];

// Currency helper — Tanzanian Shilling
window.SHF = window.SHF || {};
window.SHF.formatPrice = function (n) {
  try { return 'TSh ' + Number(n).toLocaleString('en-TZ'); }
  catch (e) { return 'TSh ' + n; }
};
