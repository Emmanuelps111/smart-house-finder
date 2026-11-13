(function (root) {
  const clean = { High: 3, Medium: 2, Flexible: 1 };
  const sleep = { 'Early Bird': 1, Flexible: 2, 'Night Owl': 3 };
  const smoking = { 'No Smoking/Drinking': 0, 'Allowed Outside': 1, 'No Preference': 2 };
  function matchScore(me, other) {
    if (!me || !other) return null;
    const parts = [];
    const a = clean[me.cleanliness], b = clean[other.cleanliness];
    if (a && b) parts.push({ k: 'Cleanliness', v: a === b ? 1 : Math.abs(a - b) === 1 ? .6 : .15 });
    const c = sleep[me.sleep], d = sleep[other.sleep];
    if (c && d) parts.push({ k: 'Sleep', v: c === d ? 1 : c === 2 || d === 2 ? .7 : .1 });
    const e = smoking[me.smoking], f = smoking[other.smoking];
    if (e !== undefined && f !== undefined) parts.push({ k: 'Smoking / alcohol', v: e === f || e === 2 || f === 2 ? 1 : .5 });
    if (!parts.length) return null;
    return { pct: Math.round(parts.reduce((sum, p) => sum + p.v, 0) / parts.length * 100), parts };
  }
  function rentSplit(price, details) {
    const rent = Number(price);
    const count = String(details.roommates_needed || '');
    if (!Number.isFinite(rent) || rent <= 0 || !['1', '2', '3', '4+'].includes(count)) return null;
    const people = parseInt(count, 10) + 1;
    const share = Math.ceil(rent / people);
    const budget = Number(details.max_budget);
    return { rent, people, share, save: rent - share, approximate: count === '4+', fits: Number.isFinite(budget) && budget > 0 ? share <= budget : null };
  }
  root.SHFRoommateMath = { matchScore, rentSplit };
})(globalThis);