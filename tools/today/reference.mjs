// Cross-check of the page's numbers against stored pyswisseph results (Swiss Ephemeris 2.10.03, Moshier, apparent geocentric of date).
// The pyswisseph virtualenv named in the project notes does not exist on this machine, so this uses the fixture produced earlier by
// moonplan-ios/tools/make_fixtures.py: 300 instants with Moon and Sun longitudes, and 25 groups of phase events (kind 180 = full Moon).
// Usage: node tools/today/reference.mjs   (exit 1 outside tolerances)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const A = createRequire(import.meta.url)('./load_astronomy.cjs')();
const { moonState } = await import('../../assets/today/moon-data.js');
const FIX = process.env.SWE_FIXTURE || '/Users/admin/Desktop/Moonplan/moonplan-ios/MoonplanTests/Fixtures/swisseph_fixture.json';
const fx = JSON.parse(fs.readFileSync(FIX, 'utf8'));
const jdToDate = (jd) => new Date((jd - 2440587.5) * 86400000);
const wrap = (x) => ((x + 180) % 360 + 360) % 360 - 180;
// 1. elongation (Moon - Sun ecliptic longitude): the quantity that fixes the illumination
let worst = 0, worstIso = '';
for (const i of fx.instants) {
  const d = jdToDate(i.jd_ut), diff = Math.abs(wrap(moonState(A, d).elongation - (i.moon - i.sun)));
  if (diff > worst) { worst = diff; worstIso = d.toISOString(); }
}
const illBound = 50 * Math.PI / 180 * worst;   // |d(1-cos e)/2| = sin(e)/2 * de <= 0.5 * de[rad], in percent points
console.log(`elongation, ${fx.instants.length} instants 1950-2100: max |page - swisseph| = ${worst.toFixed(5)} deg (at ${worstIso}) -> illumination effect <= ${illBound.toFixed(4)} pp`);
// 2. full Moon times
let worstS = 0, n = 0; const rows = [];
for (const g of fx.phases) for (const ev of g.events) if (ev.kind === 180) {
  const ref = jdToDate(ev.jd_ut), mine = A.SearchMoonPhase(180, new Date(ref.getTime() - 3 * 86400000), 8).date, s = (mine - ref) / 1000;
  worstS = Math.max(worstS, Math.abs(s)); n++; if (rows.length < 6) rows.push(`${ref.toISOString().slice(0, 19)}Z | ${mine.toISOString().slice(0, 19)}Z | ${s.toFixed(0)} s`);
}
console.log(`full Moon times, ${n} events (first 6 shown):\nswisseph UTC | page UTC | diff\n${rows.join('\n')}\nmax |diff| = ${worstS.toFixed(0)} s`);
const ok = illBound <= 0.2 && worstS <= 120;
console.log(ok ? 'WITHIN TOLERANCES (illumination 0.2 pp, full Moon 2 min). Distance: no pyswisseph reference available, NOT verified.' : 'OUT OF TOLERANCES');
process.exit(ok ? 0 : 1);
