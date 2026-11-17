// Moon numbers for the "Moon today" page. Pure functions over Astronomy Engine (global `Astronomy`, passed in as `A`).
// Nothing here touches the DOM, so tools/today/reference.mjs can run the same code in Node.
const RAD = Math.PI / 180, DAY = 86400000;

// Position angle of the Moon's bright limb, degrees from celestial north towards east (Meeus, Astronomical Algorithms, 48.5),
// from geocentric RA/Dec of the Sun and the Moon.
export function brightLimbAngle(A, date) {
  const o = new A.Observer(0, 0, 0);
  const s = A.Equator(A.Body.Sun, date, o, true, true), m = A.Equator(A.Body.Moon, date, o, true, true);
  const a0 = s.ra * 15 * RAD, d0 = s.dec * RAD, a = m.ra * 15 * RAD, d = m.dec * RAD;
  const chi = Math.atan2(Math.cos(d0) * Math.sin(a0 - a), Math.sin(d0) * Math.cos(d) - Math.cos(d0) * Math.sin(d) * Math.cos(a0 - a));
  return ((chi / RAD) % 360 + 360) % 360;
}

// Previous new Moon (Date) at or before `date`.
export function previousNewMoon(A, date) {
  let q = A.SearchMoonQuarter(new Date(date.getTime() - 31 * DAY)), last = null;
  while (q.time.date <= date) { if (q.quarter === 0) last = q.time.date; q = A.NextMoonQuarter(q); }
  return last;
}

export function moonState(A, date) {
  const ill = A.Illumination(A.Body.Moon, date), lib = A.Libration(date), prev = previousNewMoon(A, date);
  return {
    elongation: A.MoonPhase(date),                       // degrees, 0 = new Moon, 180 = full Moon
    illumination: ill.phase_fraction * 100,              // percent
    phaseAngle: ill.phase_angle,                         // Sun-Moon-Earth angle, degrees
    ageDays: prev ? (date - prev) / DAY : null,
    distanceKm: lib.dist_km, diameterArcmin: lib.diam_deg * 60,
    libLon: lib.elon, libLat: lib.elat,
    limbAngle: brightLimbAngle(A, date),
  };
}

// Index (0..71) of the pre-rendered frame nearest to an elongation (5 degree step).
export const frameIndex = (elongation) => Math.round(elongation / 5) % 72;

// Rotation (degrees, clockwise, CSS) that turns a frame (lit limb on the right when waxing, on the left when waning, north up)
// to the sky orientation: the bright limb must point to position angle `limbAngle` (north up, east left).
export function frameRotation(elongation, limbAngle) {
  const want = Math.atan2(-Math.cos(limbAngle * RAD), -Math.sin(limbAngle * RAD)) / RAD;   // screen angle of the lit side
  let r = want - (elongation < 180 ? 0 : 180);
  r = ((r + 180) % 360 + 360) % 360 - 180;
  return r;
}

// Main phase that occurs between dayStart and dayEnd (local day), or null.
export function phaseToday(A, dayStart, dayEnd) {
  const q = A.SearchMoonQuarter(dayStart);
  return q.time.date >= dayStart && q.time.date < dayEnd ? { quarter: q.quarter, date: q.time.date } : null;
}

// Phase name key for an elongation without a main phase today.
export function phaseKey(elongation) {
  return elongation < 90 ? 'waxingCrescent' : elongation < 180 ? 'waxing' : elongation < 270 ? 'waning' : 'waningCrescent';
}

export function upcoming(A, date) {
  const quarters = []; let q = A.SearchMoonQuarter(date);
  for (let i = 0; i < 4; i++) { quarters.push({ quarter: q.quarter, date: q.time.date }); q = A.NextMoonQuarter(q); }
  const aps = []; let a = A.SearchLunarApsis(date);
  for (let i = 0; i < 2; i++) { aps.push({ kind: a.kind === A.ApsisKind.Pericenter ? 'perigee' : 'apogee', date: a.time.date, distanceKm: a.dist_km }); a = A.NextLunarApsis(a); }
  const e = A.SearchLunarEclipse(date);
  return { quarters, apsides: aps, eclipse: { kind: e.kind, date: e.peak.date } };
}
