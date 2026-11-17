# today

Tools for the "Moon today" page (`/{lang}/today/`, `scripts/today.py`, `assets/today/`). The page no longer shows favourable/unfavourable days (app only):
it shows the Moon in the current phase and astronomical data, calculated in the browser by Astronomy Engine (`assets/vendor/astronomy-engine`, MIT).

- `assets/today/moon-data.js`: pure functions (illumination, age, distance, libration, phase angle, bright-limb position angle (Meeus 48.5), quarters, apsides, eclipse).
- `assets/today/today-ui.js`: DOM, refresh every minute and on `visibilitychange`.
- `render_phases.cjs`: renders 72 frames (elongation 0..355, step 5, mean libration, north up) with the shader of `assets/space/space.js` and the LRO textures
  -> `assets/today/phases/NNN.webp` (1600 px) and `NNN-800.webp` (800 px). Needs Playwright and system Chrome.
- `check_frames.py`: lit-pixel share of the frames vs (1 - cos elongation) / 2.
- `reference.mjs`: page numbers vs stored pyswisseph results (fixture of moonplan-ios). `load_astronomy.cjs`: loads the browser bundle in Node.
- `export_rules.py`, `parity.mjs`, `TodayParityDumpTests.swift.txt`, `assets/today/{today,rules,events}.js(on)`: the earlier planner-rules page. Not used by the page any more,
  kept for the parity test and `tools/moon-events`. Refresh `events.json` before the data range ends (2029-01-01).
