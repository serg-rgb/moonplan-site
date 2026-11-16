// Prints the rating of every exported activity for 400 days in three cities, one line per (city, day, activity),
// in the same format as the temporary Swift test TodayParityDumpTests (see tools/today/README.md).
// Usage: node tools/today/parity.mjs > js.txt
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dayFacts, evaluate, addDays, dateKey } from '../../assets/today/today.js';

const dir = fileURLToPath(new URL('../../assets/today/', import.meta.url));
const ev = JSON.parse(readFileSync(dir + 'events.json', 'utf8'));
const rules = JSON.parse(readFileSync(dir + 'rules.json', 'utf8'));
const cities = [['Moscow', 'Europe/Moscow'], ['New York', 'America/New_York'], ['Tokyo', 'Asia/Tokyo']];
const DAYS = Number(process.argv[2] || 400);
const out = [];
for (const [name, tz] of cities) {
  for (let n = 0; n < DAYS; n++) {
    const date = addDays({ y: 2026, m: 11, d: 16 }, n);
    const facts = dayFacts(ev, tz, date);
    for (const a of rules.activities) {
      const v = evaluate(a, facts);
      out.push(`PARITY\t${name}\t${dateKey(date)}\t${a.id}\t${v.rating}\t${v.voidLowered}`);
    }
  }
}
process.stdout.write(out.join('\n') + '\n');
