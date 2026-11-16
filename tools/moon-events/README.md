# moon-events

`gen.c` precomputes the Moon events used by the "Moon today" page and writes `assets/today/events.json`
(range 2026-11-01T00:00Z .. 2029-01-01T00:00Z, UTC epoch seconds, integers only).

It follows the Moonplan iOS app (MoonCore) so the page rates days exactly like the app's planner:
Moon and Sun come from the app's own Meeus series (`meeus.h`, a C port of MoonPosition, SunPosition, Nutation and the 2005-2150 deltaT;
`tables.h` is generated from the app's MoonTablesLR.swift); planets and the constellation come from Astronomy Engine
(`vendor/astronomy-engine`, the same file as the app's Vendor/AstronomyEngine).

```sh
V=/Users/admin/Desktop/Moonplan/vendor/astronomy-engine
cc -O2 -I$V -o gen gen.c $V/astronomy.c -lm && ./gen > ../../assets/today/events.json
```

JSON fields:

- `ph0`, `ph`: principal phases, starting 10 days before `from`. Kind of event i is `(ph0 + i) % 4` (0 new, 1 first quarter, 2 full, 3 last quarter).
- `s0`, `ing`: tropical sign index of the Moon at `from` and the times of its ingresses; the index after ingress k is `(s0 + 1 + k) % 12`.
- `c0`, `con`: garden element of the constellation at `from` (0 fruit, 1 root, 2 flower, 3 leaf) and pairs `time, element` for every change
  (Ophiuchus counts as Scorpius; other non-zodiac constellations use the J2000 ecliptic, as in MoonConstellation.swift).
- `voids`: pairs `start, end` of void-of-course windows (last Moon aspect 0/60/90/120/180/240/270/300 deg to Sun, Mercury..Pluto in the sign stay
  until the next ingress, as in VoidOfCourse.swift). Starts are floored, ends are ceiled to whole seconds.

The binary `gen` is not committed. Regenerate before 2029 is reached (and extend `to`).
