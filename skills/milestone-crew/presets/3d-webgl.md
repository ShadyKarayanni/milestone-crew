# Preset: 3d-webgl

For three.js / React Three Fiber (R3F) scenes. Combine with `web-design.md`
when the scene lives inside a website.

## Milestone plan

1. **Direction doc** (no code): mood, references, camera shot list with
   look-at points, asset list with sources and licenses, MB budget, FPS targets.
2. **Blockout and camera path**: simple geometry, camera moving through every
   shot, automated path check.
3. **Materials and lighting**: real assets, textures, shadows, fog.
4. **Atmosphere and effects**: particles, post-processing, reflections.
5. **Performance and quality tiers**: measure, cut, tier, polish.

## Dev hooks to add

- `?at=N`: jump the camera to shot N, no tween.
- `?fps`: log `[fps] NN` once a second.
- `?off=pass1,pass2`: disable named passes/effects to measure each one's cost.
- `?dpr=N`: force a device pixel ratio for testing.
- A path-check script that samples the camera path and fails if the camera
  goes through geometry or a look-at target leaves the frame.

## How QA verifies

- Screenshots per shot via `?at=N` (see `web-design.md` for the headless
  command and rules).
- **Measure FPS at DPR 2, not only DPR 1.** 60 FPS at DPR 1 once hid 30 to 38
  at DPR 2. Use `?off=` to find which pass costs what.
- Check for WebGL context loss in the logs (grep, do not dump).
- One GPU-heavy browser at a time; the user's own browser slows down otherwise.

## Gotchas

1. Do not lazy-load the Canvas with `next/dynamic`: under StrictMode the WebGL
   context gets lost.
2. meshopt compression puts dequantizing transforms on nodes. Never reset a
   clone's rotation or scale.
3. Avoid transmission materials and full-screen half-float buffers at DPR 2:
   they cause context loss.
4. drei `MeshReflectorMaterial` renders even when hidden. Unmount it instead.
5. Many small reflective patches (puddles): ONE material with a noise mask and
   one shared reflection, never one reflector each. Give them soft edges.
6. React Compiler lint: no `ref.current` in render; no `Math.random` in render
   or memo (use a seeded PRNG); no mutating memo or `useThree` values. Mutate
   in `useFrame`.
7. Static shadows: set `shadowMap.autoUpdate = false`, then `needsUpdate` once.
8. GPU particles (rain etc.) as one `LineSegments` draw call.
9. Ripple normals: render procedurally into a small render target.
10. Height fog: patch `ShaderChunk` rather than a full-screen pass.
11. Bloom clips bright discs (a moon, a sun) to white. Give them a controlled,
    hand-made glow instead.
12. Fine lattices and grids cause moiré. Fade them out with distance.
13. Infinitely far objects (moon, sun) can be re-aimed per shot for composition.
14. Quality tiers from `navigator.hardwareConcurrency`, `navigator.deviceMemory`
    and `matchMedia('(pointer: coarse)')`. Not `useDetectGPU` (it fetches from a
    CDN). Add drei `PerformanceMonitor` to step down at runtime.
15. Cap DPR around 1.5 when fill rate is the limit.

## Assets

- Budget in MB, set in milestone 1, tracked in the state file.
- Prefer CC0 sources (e.g. the Poly Haven API). Record source and license.
- Optimize with gltf-transform: WebP textures plus meshopt.
- Build simple architecture (boxes, beams, poles, planes) in code instead of
  downloading models.
- Asset sourcing is a subagent job; the lead only sees the summary.

## Budgets (starting points)

- 60 FPS at DPR 1.5 on a mid laptop; no context loss at DPR 2.
- Draw calls and total MB written in the state file and re-measured each milestone.
