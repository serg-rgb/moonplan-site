// "Moon today": local-day facts and the planner rating, a port of the Moonplan app (DayFacts.swift, DayEvaluator.swift).
// Pure functions, no DOM and no dependencies, so Node can import it for the parity check (tools/today/parity.mjs).
// Data: events.json (tools/moon-events/gen.c) and rules.json (tools/today/export_rules.py); times are UTC epoch seconds.

export const RATINGS = ['avoid', 'neutral', 'good', 'veryGood'];
const VOID_AVOID_HOURS = 6;
const PHASE_KINDS = ['new', 'first', 'full', 'last'];

// ---- time zones (Intl only; DST-correct) ----
const formatters = new Map();
function parts(tz, ms) {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    formatters.set(tz, f);
  }
  const o = {};
  for (const p of f.formatToParts(new Date(ms))) if (p.type !== 'literal') o[p.type] = +p.value;
  return o;
}
/** Wall-clock time of an instant, as if it were UTC (ms). */
function wallMs(tz, ms) {
  const p = parts(tz, Math.floor(ms / 1000) * 1000);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}
const offsetMs = (tz, ms) => wallMs(tz, ms) - Math.floor(ms / 1000) * 1000;

/** Local calendar date of an instant: { y, m, d } (m is 1..12). */
export function localDate(tz, ms) {
  const p = parts(tz, ms);
  return { y: p.year, m: p.month, d: p.day };
}

/** Earliest instant (ms) whose wall clock is y-m-d h:00 in the zone; null if that wall time does not exist (DST gap). */
function atWall(tz, y, m, d, h, hint) {
  const w = Date.UTC(y, m - 1, d, h);
  let best = null;
  for (const t of [hint - 864e5, hint, hint + 864e5, hint + 36e5 * 12]) {
    const c = w - offsetMs(tz, t);
    if (wallMs(tz, c) === w && (best === null || c < best)) best = c;
  }
  return best;
}

/** Start of the local day (first instant of the date) and civil noon, as Calendar.startOfDay / civilNoon do. */
export function dayBounds(tz, y, m, d) {
  const guess = Date.UTC(y, m - 1, d) - offsetMs(tz, Date.UTC(y, m - 1, d, 12));
  let start = atWall(tz, y, m, d, 0, guess);
  if (start === null) { // midnight does not exist: first instant of the date
    const key = y * 10000 + m * 100 + d;
    let lo = guess - 864e5, hi = guess + 864e5;
    const k = (t) => { const p = parts(tz, t); return p.year * 10000 + p.month * 100 + p.day; };
    while (hi - lo > 1000) { const mid = Math.floor((lo + hi) / 2000) * 1000; if (k(mid) >= key) hi = mid; else lo = mid; }
    start = hi;
  }
  const noon = atWall(tz, y, m, d, 12, start);
  return { start, noon: noon === null ? start + 12 * 36e5 : noon };
}

export function addDays(date, n) {
  const t = new Date(Date.UTC(date.y, date.m - 1, date.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}
export const dateKey = (x) => `${x.y}-${String(x.m).padStart(2, '0')}-${String(x.d).padStart(2, '0')}`;

// ---- facts of one local day ----
function lastIndex(arr, sec, step = 1, off = 0) { // last i with arr[i*step+off] <= sec, or -1
  let lo = 0, hi = Math.floor((arr.length - off) / step);
  while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid * step + off] <= sec) lo = mid + 1; else hi = mid; }
  return lo - 1;
}

export function dayFacts(ev, tz, date) {
  const { start, noon } = dayBounds(tz, date.y, date.m, date.d);
  const nd = addDays(date, 1);
  const next = dayBounds(tz, nd.y, nd.m, nd.d).start;
  const s = start / 1000, n = next / 1000, noonS = Math.floor(noon / 1000);
  const pi = lastIndex(ev.ph, noonS);
  const kind = pi < 0 ? 0 : (ev.ph0 + pi) % 4;          // principal phase most recently passed at noon
  const elongationBelow90 = kind === 0, waxing = kind === 0 || kind === 1; // elongation < 90 / < 180
  let hasNew = false, hasFull = false;
  ev.ph.forEach((t, i) => { if (t >= s && t < n) { const k = (ev.ph0 + i) % 4; if (k === 0) hasNew = true; if (k === 2) hasFull = true; } });
  const ci = lastIndex(ev.con, noonS, 2);
  let voidSec = 0;
  for (let i = 0; i < ev.voids.length; i += 2) voidSec += Math.max(0, Math.min(ev.voids[i + 1], n) - Math.max(ev.voids[i], s));
  return {
    date, dayStart: start, noon,
    signIndex: (ev.s0 + lastIndex(ev.ing, noonS) + 1) % 12,
    element: ci < 0 ? ev.c0 : ev.con[ci * 2 + 1],
    waxing, elongationBelow90, hasNew, hasFull, voidHours: voidSec / 3600,
    lastNew: lastNewMoon(ev, noonS),
  };
}

/** UTC seconds of the last new Moon at or before `sec` (null if unknown). */
export function lastNewMoon(ev, sec) {
  for (let i = lastIndex(ev.ph, sec); i >= 0; i--) if ((ev.ph0 + i) % 4 === 0) return ev.ph[i];
  return null;
}

// ---- rating (DayEvaluator.evaluate) ----
const avoid = (r) => ({ rating: 'avoid', reasons: [r], voidLowered: false });

export function evaluate(act, day) {
  const c = act.cond;
  const tags = new Set([day.waxing ? 'waxing' : 'waning']);
  if (day.hasNew) tags.add('new');
  if (day.hasFull) tags.add('full');
  if ((c.signsAvoid || []).includes(day.signIndex)) return avoid({ t: 'sign' });
  const pa = (c.phaseAvoid || []).find((p) => tags.has(p));
  if (pa) return avoid({ t: 'phase', v: pa });
  if (c.avoidNewFull && (day.hasNew || day.hasFull)) return avoid({ t: 'phase', v: day.hasNew ? 'new' : 'full' });
  if ((c.gardenAvoid || []).includes(day.element)) return avoid({ t: 'garden' });
  if (c.avoidVoid && day.voidHours >= VOID_AVOID_HOURS) return avoid({ t: 'void' });

  const reasons = [];
  let defined = 0, met = 0, phaseDefined = false, phaseMet = false;
  if (c.phase && c.phase.length) {
    defined++; phaseDefined = true;
    const p = c.phase.find((x) => tags.has(x) && (!c.earlyWaxing || x !== 'waxing' || day.elongationBelow90));
    if (p) { met++; phaseMet = true; reasons.push({ t: 'phase', v: p }); }
  }
  if (c.signsGood && c.signsGood.length) {
    defined++;
    if (c.signsGood.includes(day.signIndex)) { met++; reasons.push({ t: 'sign' }); }
  }
  if (c.gardenGood && c.gardenGood.length) {
    defined++;
    if (c.gardenGood.includes(day.element)) { met++; reasons.push({ t: 'garden' }); }
  }
  let rating;
  if (defined === 0) rating = 1;
  else if (met === defined) rating = defined >= 2 ? 3 : 2;
  else if (phaseDefined ? phaseMet : met > 0) rating = 2;
  else rating = 1;
  let lowered = false;
  if (c.avoidVoid && day.voidHours > 0 && rating > 1) { rating--; lowered = true; }
  return { rating: RATINGS[rating], reasons: met > 0 ? reasons : [{ t: 'none' }], voidLowered: lowered };
}
export { PHASE_KINDS };
