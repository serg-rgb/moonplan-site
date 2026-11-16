# today

Data and checks for the "Moon today" page (`/{lang}/today/`, `scripts/today.py`, `assets/today/`).

- `export_rules.py`: planner_rules.json of the app -> `assets/today/rules.json` (approved, no needsSourceCheck; 40 activities). No notes/synonyms; signs and garden elements as indexes.
- `../moon-events/gen.c`: `assets/today/events.json` (phases, sign changes, garden element changes, void windows).
- `assets/today/today.js`: day facts and `evaluate` (port of DayFacts/DayEvaluator); `today-ui.js`: DOM.
- `parity.mjs`: `node tools/today/parity.mjs > js.txt` prints PARITY lines for 3 cities x 400 days x 40 activities (48,000 lines).
- `TodayParityDumpTests.swift.txt`: the temporary app-side test producing the same lines (see its header). Compare with `diff`.

Note: the stored template reads the ids from rules.json and writes to /tmp/swift_parity.txt; the actual run used the same code with the 40 ids inlined and wrote to a scratch file.

Result of the run on 2026-11-16 against the worktree moonplan-ios-1.2 (branch fix/audit-1.2): 48,000 lines, 0 differences.
Refresh events.json before the data range ends (2029-01-01).
