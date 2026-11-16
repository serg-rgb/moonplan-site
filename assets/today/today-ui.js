// "Moon today" page: fills the live block (day facts, two lists, 7-day strip) in the visitor's time zone.
import { dayFacts, evaluate, localDate, addDays, lastNewMoon } from './today.js';
import { moonPhase } from '../space/moonphase.js';

const root = document.querySelector('[data-today]');
const t = JSON.parse(document.getElementById('today-i18n').textContent);
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k]);

function reasonText(reasons) {
  const out = [];
  for (const r of reasons) {
    const s = r.t === 'phase' ? t[{ waxing: 'rWaxing', waning: 'rWaning', new: 'rNew', full: 'rFull' }[r.v]]
      : r.t === 'void' ? t.rVoid : r.t === 'none' ? '' : t.rCal;
    if (s && !out.includes(s)) out.push(s);
  }
  return out.join(' · ');
}

async function main() {
  const [ev, rules] = await Promise.all(['events.json', 'rules.json'].map((f) => fetch(new URL(f, import.meta.url)).then((r) => r.json())));
  const today = localDate(tz, Date.now());
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i), facts = dayFacts(ev, tz, date);
    const results = rules.activities.map((a) => ({ a, v: evaluate(a, facts) }));
    return { date, facts, results, good: results.filter((r) => r.v.rating === 'good' || r.v.rating === 'veryGood').length, avoid: results.filter((r) => r.v.rating === 'avoid').length };
  });
  if (days[0].facts.dayStart / 1000 < ev.from || days[6].facts.dayStart / 1000 > ev.to) throw new Error('date outside the data range');
  const fmtLong = new Intl.DateTimeFormat(t.locale, { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtWeek = new Intl.DateTimeFormat(t.locale, { timeZone: tz, weekday: 'short' });
  const fmtDay = new Intl.DateTimeFormat(t.locale, { timeZone: tz, day: 'numeric' });
  const groupName = new Map(rules.groups.map((g) => [g.id, g.names[t.lang]]));
  const order = rules.groups.map((g) => g.id);
  let selected = 0;

  function list(title, kind, results) {
    const sec = el('section', 'today-list today-' + kind);
    sec.append(el('h2', '', title));
    if (!results.length) { sec.append(el('p', 'today-empty', t.empty)); return sec; }
    for (const g of order) {
      const rows = results.filter((r) => r.a.group === g).sort((x, y) => (y.v.rating === 'veryGood') - (x.v.rating === 'veryGood'));
      if (!rows.length) continue;
      sec.append(el('h3', '', groupName.get(g)));
      const ul = el('ul');
      for (const r of rows) {
        const li = el('li');
        const name = el('span', 'name', r.a.names[t.lang]);
        if (r.v.rating === 'veryGood') name.append(el('em', 'vg', t.vg));
        li.append(name, el('span', 'why', reasonText(r.v.reasons)));
        ul.append(li);
      }
      sec.append(ul);
    }
    return sec;
  }

  function render() {
    const d = days[selected], f = d.facts, isToday = selected === 0;
    const ref = isToday ? Date.now() : f.noon;
    const age = Math.floor((ref / 1000 - lastNewMoon(ev, Math.floor(ref / 1000))) / 86400) + 1;
    const phase = f.hasNew ? t.phaseNew : f.hasFull ? t.phaseFull : f.waxing ? t.phaseWaxing : t.phaseWaning;
    root.replaceChildren();
    const head = el('div', 'today-head');
    head.append(el('p', 'today-date', fmtLong.format(new Date(f.noon))), el('p', 'today-tz', fill(t.tz, { tz: tz.replace(/_/g, ' ') })));
    const facts = el('ul', 'today-facts');
    for (const s of [phase, fill(t.lit, { p: Math.round(moonPhase(new Date(ref)).fraction * 100) }), fill(t.age, { n: age })]) facts.append(el('li', '', s));
    head.append(facts);
    const lists = el('div', 'today-lists');
    lists.append(list(t.good, 'good', d.results.filter((r) => r.v.rating === 'good' || r.v.rating === 'veryGood')),
      list(t.avoid, 'avoid', d.results.filter((r) => r.v.rating === 'avoid')));
    const strip = el('section', 'today-strip');
    strip.append(el('h2', '', t.strip));
    const row = el('ul');
    days.forEach((x, i) => {
      const li = el('li'), b = el('button', '', '');
      b.type = 'button'; b.setAttribute('aria-pressed', String(i === selected));
      const when = new Date(x.facts.noon);
      b.setAttribute('aria-label', `${i === 0 ? t.todayWord + ', ' : ''}${fmtLong.format(when)}: ${fill(t.stripFmt, { g: x.good, a: x.avoid })}`);
      if (i === 0) b.classList.add('is-today');
      const c = el('span', 'counts');
      c.append(el('b', 'g', String(x.good)), el('b', 'a', String(x.avoid)));
      b.append(el('span', 'wd', fmtWeek.format(when)), el('span', 'dt', fmtDay.format(when)), c);
      b.addEventListener('click', () => { selected = i; render(); root.querySelector('.today-strip [aria-pressed=true]').focus(); });
      li.append(b); row.append(li);
    });
    const legend = el('p', 'legend');
    legend.append(el('span', 'g', t.good), el('span', 'a', t.avoid));
    strip.append(row, legend);
    root.append(head, lists, strip);
  }
  render();
}

main().catch((err) => { console.error('today:', err); root.replaceChildren(el('p', 'today-note', t.error)); });
