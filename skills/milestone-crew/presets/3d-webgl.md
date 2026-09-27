# Preset: 3d-webgl

For three.js / React Three Fiber (R3F) scenes. Combine with `web-design.md`
when the scene lives inside a website.

## Default milestone plan

Defaults the kickoff proposes, not a fixed plan. The kickoff fits them to
the project, adds a "Done when" checklist to each, and the user approves.

1. **Direction doc** (no code): mood, references, camera shot list with
   look-at points, asset list with sources and licenses, MB and FPS targets (see Targets).
2. **Blockout and camera path**: simple geometry, camera moving through every
   shot, automated path check.
3. **Materials and lighting**: real assets, textures, shadows, fog.
4. **Atmosphere and effects**: particles, post-processing, reflections.
5. **Performance and quality tiers**: measure, cut, tier, polish.

## Lessons: read before milestone 1

`3d-webgl-lessons.md` holds the paid-for gotchas and recipes (framework,
assets, materials, lighting, atmosphere, camera, performance, QA, workflow).
Load it before milestone 1 and copy the ones that apply into the brief's
"Gotchas already paid for". New lessons go there, not here.

## Dev hooks to add

`?at=N`, `?fps`, `?off=pass1,pass2`, `?mark=T` (hold a timed moment) and a
path-check script. How to build each: lessons section 8 (hooks) and
section 6 (path check).

## How QA verifies

- Screenshots per shot via `?at=N` with `scripts/browser.mjs shot` (see
  `web-design.md`).
- FPS with `browser.mjs fps "<url>?fps"` (DPR 2 by default), and `?off=` to
  cost each pass. Pitfalls: lessons sections 7 and 8.
- Context loss: `browser.mjs console <url> --match "Context Lost"`.

## Assets

- MB budget set in milestone 1 (see Targets), tracked in the state file.
- Record source and license for every asset. Sources, compression settings
  and sizes achieved: lessons section 2.
- Asset sourcing is a subagent job; the lead only sees the summary.

## Targets (example defaults: milestone 1 sets the real ones per project)

- A MacBook-class laptop holds 60 FPS at DPR 2.
- A mid-range phone holds 30 FPS or better.
- 3D assets total 5 MB or less.
- Text paints immediately, before the 3D scene is ready.
- Write the chosen targets in the state file and re-measure each milestone.
