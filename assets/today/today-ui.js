// "Moon today": fills the live block in the visitor's time zone. Numbers come from assets/today/moon-data.js (Astronomy Engine, global `Astronomy`).
// The Moon picture is a pre-rendered frame (assets/today/phases/NNN.webp, 5 degrees of elongation per frame) rotated to the sky orientation.
import { moonState, phaseToday, phaseKey, upcoming, frameIndex, frameRotation } from './moon-data.js';

const root = document.querySelector('[data-today]'), frameBox = document.querySelector('[data-frame]');
const t = JSON.parse(document.getElementById('today-i18n').textContent);
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k]);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
// Distances are shown to 100 km: Astronomy Engine differs from JPL Horizons by ~50 km (checked 2026-11-17)
const km100 = (x) => Math.round(x / 100) * 100;
const num = (digits, extra) => new Intl.NumberFormat(t.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits, ...extra });
const nInt = num(0), n1 = num(1), nSigned = num(1, { signDisplay: 'always' });
const fmtDay = new Intl.DateTimeFormat(t.locale, { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = new Intl.DateTimeFormat(t.locale, { timeZone: tz, hour: '2-digit', minute: '2-digit' });
const dtOpts = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
const fmtLocal = new Intl.DateTimeFormat(t.locale, { timeZone: tz, ...dtOpts }), fmtUtc = new Intl.DateTimeFormat(t.locale, { timeZone: 'UTC', ...dtOpts });
const fmtLocalY = new Intl.DateTimeFormat(t.locale, { timeZone: tz, year: 'numeric', ...dtOpts }), fmtUtcY = new Intl.DateTimeFormat(t.locale, { timeZone: 'UTC', year: 'numeric', ...dtOpts });
const QUARTER = ['pNew', 'pFirst', 'pFull', 'pLast'];
const ECLIPSE = { total: 'eTotal', partial: 'ePartial', penumbral: 'ePenumbral' };

function when(date, withYear) {
  const w = el('span', 'when', (withYear ? fmtLocalY : fmtLocal).format(date));
  w.append(' ', el('small', 'utc', `${(withYear ? fmtUtcY : fmtUtc).format(date)} ${t.utc}`));
  return w;
}
function list(title, rows) {
  const s = el('section', 'today-next'); s.append(el('h2', '', title));
  const ul = el('ul'); for (const [label, node] of rows) { const li = el('li'); li.append(el('span', 'name', label), node); ul.append(li); }
  s.append(ul); return s;
}

let shown = '';
function showFrame(elong, limb) {
  const idx = String(frameIndex(elong) * 5).padStart(3, '0'), rot = Math.round(frameRotation(elong, limb) * 10) / 10;
  let img = frameBox.querySelector('img');
  if (!img) {
    img = document.createElement('img'); img.alt = t.imgAlt; img.width = 800; img.height = 800; img.decoding = 'async';
    img.sizes = '(max-width: 600px) 90vw, 520px';
    img.addEventListener('error', () => { frameBox.replaceChildren(el('p', 'today-stub', t.stub)); shown = ''; }, { once: true });
    frameBox.replaceChildren(img);
  }
  if (idx !== shown) {
    shown = idx; img.srcset = `${t.phases}${idx}-800.webp 800w, ${t.phases}${idx}.webp 1600w`; img.src = `${t.phases}${idx}-800.webp`;
  }
  img.style.transform = `rotate(${rot}deg)`;
}

function render() {
  const A = window.Astronomy, now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()), dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const s = moonState(A, now), ev = phaseToday(A, dayStart, dayEnd), up = upcoming(A, now);
  showFrame(s.elongation, s.limbAngle);
  const head = el('div', 'today-head');
  head.append(el('p', 'today-date', fmtDay.format(now)), el('p', 'today-tz', fill(t.tz, { tz })));
  const name = ev ? t[QUARTER[ev.quarter]] : t[{ new: 'pNew', waxingCrescent: 'pWaxingCrescent', waxing: 'pWaxing', waning: 'pWaning', waningCrescent: 'pWaningCrescent' }[phaseKey(s.elongation)]];
  head.append(el('p', 'today-phase', name));
  if (ev) head.append(el('p', 'today-event', fill(t.todayAt, { name: t[QUARTER[ev.quarter]], time: fmtTime.format(ev.date) })));
  const rows = [
    [t.lLit, `${nInt.format(s.illumination)}%`, 'lit'], [t.lAge, fill(t.uDays, { n: n1.format(s.ageDays) }), 'age'],
    [t.lDist, fill(t.uKm, { n: nInt.format(km100(s.distanceKm)) }), 'dist'], [t.lDiam, `${n1.format(s.diameterArcmin)}′`, 'diam'],
    [t.lLibLon, `${nSigned.format(s.libLon)}°`, 'liblon'], [t.lLibLat, `${nSigned.format(s.libLat)}°`, 'liblat'],
    [t.lPhaseAngle, `${n1.format(s.phaseAngle)}°`, 'angle'],
  ];
  const dl = el('dl', 'today-facts');
  for (const [k, v, id] of rows) { const d = el('div'); const dd = el('dd', '', v); dd.dataset.fact = id; d.append(el('dt', '', k), dd); dl.append(d); }
  const quarters = list(t.qTitle, up.quarters.map((q) => [t[QUARTER[q.quarter]], when(q.date)]));
  const aps = list(t.apTitle, up.apsides.map((a) => [`${t[a.kind]} · ${fill(t.uKm, { n: nInt.format(km100(a.distanceKm)) })}`, when(a.date)]));
  const ecl = list(t.ecTitle, [[t[ECLIPSE[up.eclipse.kind]] || up.eclipse.kind, when(up.eclipse.date, true)]]);
  root.replaceChildren(head, dl, quarters, aps, ecl);
}

function tick() {
  try { if (!window.Astronomy) throw new Error('Astronomy Engine not loaded'); render(); }
  catch (e) { console.warn(e); root.replaceChildren(el('p', 'today-note', t.error)); }
}
tick();
(function schedule() { setTimeout(() => { tick(); schedule(); }, 60000 - (Date.now() % 60000) + 50); })();
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
