# 3D/WebGL lessons (field guide)

Hard-won lessons from shipping a scroll-driven three.js / React Three Fiber
scene inside a Next.js site. Example context: a rainy night street, with the
camera walking down it and one composed shot per page section.

Load this with `3d-webgl.md` before milestone 1. Copy the lessons that apply
into the brief's "Gotchas already paid for". Each lesson gives the problem,
the fix and a number where one was measured.

## 1. Setup and framework (Next, R3F, React Compiler)

1. Lazy-loading the Canvas with `next/dynamic` loses the WebGL context under
   StrictMode. Import it statically and keep one Canvas for the page.
2. To pause the scene when it is off screen, use `frameloop="never"` rather
   than unmounting it. It renders zero frames, and scrolling back is instant.
3. React Compiler lint: no `ref.current` in render, no `Math.random()` in
   render or `useMemo` (use a seeded PRNG), no mutating `useMemo` or `useThree`
   values, and pass `useMemo` an inline function. Mutate three objects in
   `useFrame` through refs.
4. The compiler also forbids writing uniforms through a memoised material.
   Keep per-frame uniform objects at module scope, or in a plain class driven
   from `useFrame`, and pass them in.
5. drei `useProgress` never reaches 100 when nothing loads, so a loader
   waiting for it never lifts. Treat "idle for 500 ms" as loaded.
6. `@react-three/postprocessing` has `postprocessing` only as a peer. Don't
   import it directly unless you add it to package.json. Use the enum's number
   with a comment instead (AgX tone mapping is `7`).

## 2. Assets and budgets

1. CC0 sources (Poly Haven, whose API lists files) need no attribution.
   Record source and license anyway. A full street shipped at 4.2 MB of 3D:
   three 1K texture sets (3.1 MB) plus one model (1.1 MB).
2. Build simple architecture in code (gates, lanterns, lattices, eaves, roof
   tiles, cloth). Sky, moon, rain, ripples, mist and puddle masks are shaders.
   All of that costs 0 bytes.
3. At night, skip the HDRI. A code-built environment from a few drei
   `Lightformer`s (a moon disc, two warm strips), with `frames={1}` and
   `resolution={64}`, is enough for wet reflections. The HDRI was 1.25 MB for
   little gain.
4. Textures: 1K WebP, with AO, roughness and metal packed into one "arm" map.
   Sample big surfaces in world space (repeat in metres). The same stone
   texture at a smaller scale reads as gravel.
5. Poly Haven 1K PNGs are often 16-bit, and some normal maps carry alpha.
   Encode with `cwebp -noalpha`, which also strips to 8-bit.
6. Normal maps are about 90% of texture weight. Encode them near-lossless
   (level 60 is about 46 dB). Lossy q95 is only 28.5 dB, which reads as lumpy
   shading. Level 40 (41 dB) saves about 25% if the budget bites.
7. Exception: a normal map that is already a JPEG. Near-lossless keeps its
   artifacts and grew one from 1.2 to 3.2 MB, so use a lossy quality there.
8. Model pipeline with gltf-transform (pin the CLI version): `prune` (drop
   unused UV sets), `join` (fewer draw calls), 512 px WebP, then meshopt last.
   One 4.2 MB model came out at 1.13 MB without simplifying.
9. meshopt stores dequantizing rotation and scale on mesh nodes. Never reset
   a cloned node's rotation or scale. drei `useGLTF` decodes meshopt by default.
10. `gltf-transform validate` cannot check `EXT_meshopt_compression`, so a
    clean validate does not prove the geometry decodes. Look at it in the scene.
11. WebP ships with no transcoder, but it decodes to full RGBA in GPU memory.
    Move to KTX2 (plus the KTX2 loader) only if GPU memory becomes the limit.
12. Give each heavy asset a keep-or-cut rule in milestone 1, for example
    "stays only if it compresses to 1.2 MB or less, else a code-built stand-in".
13. Store-bought and scanned models often ship with unlit materials, odd
    units or a different up axis. Check the material type and scale before
    use, and give them lit materials so they react to the scene's lights
    and fog.

## 3. Materials and look

1. Puddles: use ONE ground material with a world-space noise mask, never a
   reflector mesh per puddle. Inside the mask: roughness near 0, darker albedo
   and ripple normals. Outside: damp, rough stone.
2. Puddle edges: use warped fbm noise, and let a blurred AO read (a fixed deep
   mip) nudge the threshold, so water gathers along the joints while the edge
   stays a smooth curve. Soften the edge with `fwidth` (for example
   `smoothstep(t - 0.05, t + max(0.12, 2.5 * fwidth(n)), n)`). A hard threshold
   looked like circles cut out of the ground.
3. Wet ground needs one reflection that runs continuously from damp stone
   into the puddle: blurred (a higher mip) and smeared vertically on damp stone,
   which gives the lantern streaks of a wet street, then sharper as the water
   deepens. Switching between two looks draws a rim.
4. On wet ground the planar mirror must replace three's environment
   specular: scale `reflectedLight.indirectSpecular` down by wetness. Stacked,
   the environment's blurry sheen draws a pale rim round every puddle.
5. A flat mirror only shows what is in front of the camera across the plane.
   A shot looking away from an object can never show its reflection.
6. Ripple rings on a reflection must be refraction, not paint. Offset the
   mirror lookup at each crest (project a displaced world point with the
   mirror's texture matrix) toward the reflected object, so the highlight is
   the object itself. A painted overlay line reads as UI.
7. A "far" object is really at a finite distance (a moon at 350 m). Its
   mirror image is shifted by parallax, here by most of a moon radius. Compute
   reflection points from the real distance, never from the direction alone.
8. Fine lattices (2.6 cm slats on a 7.5 cm period) make moiré. Fade the
   colour AND the normal to the surface behind once a period covers fewer than
   about 5 px.
9. Measure that period where the view ray crosses the lattice plane (the
   `fwidth` of the crossing coordinate), not on the face being drawn. Side
   faces seen down a street look straight at the camera, so their own
   footprint never triggers the fade.
10. Emissive paper (lanterns, paper windows) does most of the lighting with
    bloom. Shader it as brighter where you look through it, darker at the caps
    and silhouette, with fine rib bands and fibre noise. Draw emblems as
    distance bands so they stay crisp at any size.
11. Moon: a disc in code, with limb darkening (edge about 1/8 of the centre in
    linear), soft maria from fixed-seed noise so it has the same face on every
    load, a thin corona and a wide faint halo. Hold it at a fixed distance from
    the camera so it never parallaxes. Keep it a real object so the mirror
    sees it.
12. Sky: use a warm gradient with most of the change near the horizon, plus
    broad, low-contrast drifting cloud and a lift in the haze near the moon. A
    flat grey band between rooflines looks cheap.
13. Night palette: warm light comes only from things (lamps, windows). The
    only cool is the moon, kept grey-silver. Saturated blue reads as stock
    "night".
14. Six-sided lathe parts need `flatShading` (lathe normals shade a hexagon
    as round). Smooth curved parts need it off, so split them into two
    materials.
15. Rows of buildings: build 3 or 4 module variants, then instance and mirror
    them.
16. What read as cheap: hero objects that are low-poly with no bevels or
    profile, hard puddle edges, overlay rings, flat sky bands, a clipped-white
    moon and blue night. Research a real profile for hero objects before
    modelling them. Simple primitives (smooth cylinders, bare boxes) read as
    low-poly near the camera: use real asset parts, bevels and enough
    segments, and drop props that can only be made low-poly.
17. When you deform a shape (curve, bend, lift), everything attached to it
    must follow: undersides, walls, trims, and particles or drips that run
    along its edges. Check it from every camera, or gaps and floating parts
    appear.
18. When a surface reads as the wrong material (stone that reads as wood,
    metal that reads as plastic), check the light hitting it before
    re-texturing. A strong warm light on a dark, down-facing stone face read
    as a wooden plank, and a full surface-breakup pass barely changed it.
    Find which light is responsible first (toggle lights with `?off=`).
19. In a dark scene, fine detail (wood grain, a small metal pull, stains)
    vanishes at viewing size. Judge it in a screenshot at the real size, not
    only in an enlarged crop, and lift tone or contrast a little so it reads.

## 4. Lighting, shadows and post

1. Static shadows: create the Canvas with `shadows={{ autoUpdate: false }}`,
   then set `shadowMap.needsUpdate` for about 3 frames after casters mount.
   One frame can miss late meshes. Use one shadow caster (the key light).
2. A `directionalLight` target is not in the scene. Set its position and call
   `updateMatrixWorld()` in a layout effect, or the light and its shadow camera
   aim at the origin.
3. Geometry finer than a shadow texel beats into dark V bands (2.6 cm slats
   against a 4.7 cm texel, from a 2048 map over a 96 m box). Let it receive
   shadows, not cast them.
4. Any extra `gl.render` into a target also runs the shadow pass while
   `needsUpdate` is set. An unlit pass skips it. A lit pass (a mirror) redraws
   shadows, which is fine, but know it happens.
5. `@react-three/postprocessing` forces `NoToneMapping` on the renderer. Tone
   map with the `ToneMapping` effect, and set exposure through
   `gl.toneMappingExposure` (0.92 worked for a dark scene).
6. AgX desaturates and compresses highlights, so a palette hex fed in as-is
   shows darker and greyer. Solve for the linear input that displays as the hex
   (a cream moon needed about (3.6, 2.9, 1.5)).
7. Bloom: render HDR into a half-float buffer and use threshold 1.0, so only
   emissives (lamps, windows) glow. Lit stone and wood stay under it, so the
   scene never goes soft. Settings used: intensity 0.42, radius 0.55,
   smoothing 0.3, `mipmapBlur`, 5 levels (4 on low).
8. Bloom clips bright discs (moon, sun) to white. Either keep the disc under
   the threshold and draw its halo by hand, or solve it for AgX and let it
   bloom on purpose.
9. If the mirror must not bloom but the disc should, swap in a sub-threshold
   face for the mirror pass in `onBeforeRender`.
10. Many lamps, few lights: use up to 6 real point lights (no shadows),
    reassigned each frame to the sources nearest the camera, biased ahead.
    Only positions change, so nothing recompiles. Every other lamp adds a warm
    pool on walls and ground through one shader term reading a shared light
    list.
11. Ambient: a very low warm hemisphere light plus the small code-built
    environment at `environmentIntensity` about 0.22.
12. With a post chain, turn off canvas MSAA (`antialias: false`, composer
    `multisampling={0}`) and add SMAA on the high tier only.

13. A light inside solid matter (a stone lantern, a lamp housing): the solid
    material must not glow. Use a small emissive core plus a point light
    inside, and check other systems that add glow sprites or halos to every
    light, so they skip this one or match it.

## 5. Atmosphere (fog, mist, rain, ripples)

1. Height fog: patch `THREE.ShaderChunk`'s fog chunks once at import, before
   any program compiles. Every fogged material then gets it, drei's included.
   No full-screen pass needed.
2. Height fog needs the world position in the fog chunk. The cheap form is
   `transpose(mat3(viewMatrix)) * (mvPosition.xyz - viewMatrix[3].xyz)`, which
   equals `inverse(viewMatrix) * mvPosition` for a rigid view.
   `mvPosition` already includes `instanceMatrix`, so instanced meshes fog
   correctly.
3. Integrate the ground mist analytically along the ray: density
   `A * exp(-y / H)` (A 0.11 per m, H 0.5 m). Break it into slowly drifting
   noise banks about 4 m by 12 m. Use exponential distance fog, which never
   closes into a flat wall.
4. three refreshes only the fog colour, near, far and density on every
   material, including ones you do not own. To animate fog everywhere,
   repurpose `fog.near` as a clock and `fog.far` as visibility. Comment this
   loudly, and never set `near` as a start distance again.
5. The mirror camera sits below the ground, so use `abs(cameraPosition.y)`
   in height fog. Otherwise every reflection is seen through the densest mist
   twice.
6. Keep ground mist out of the first 3.5 m from the lens, or low and
   looking-down shots are fogged over.
7. Tint the mist warm near lamps from the same light list, squashed in y so
   the light spreads sideways through the low layer.
8. Linear fog cannot hide an end wall 30 m away. Run the geometry well past
   the last shot (rows to 100 m for a 60 m walk) so no shot sees the end.
9. GPU rain as ONE `LineSegments` draw: two vertices per streak sharing a
   seed. The vertex shader drops it through a box wrapped around the camera,
   so the CPU does nothing per drop. Counts: 6000, 3000 and 1200 by tier.
10. A streak is the drop's path relative to the camera during one film
    exposure, so the rain leans when the camera moves. Keep it faint, lit only
    near lamps or backlit by the moon, and fade drops right at the lens (they
    read as slashes).
11. Ripple normals: render them procedurally into a small tiling render
    target (256 px, 128 on low) from an unlit scene. Each drop is a
    `sin(k(d - t)) * exp(-d)` packet with an analytic slope (one evaluation per
    texel, not three). Hash on the wrapped cell so the map tiles.

## 6. Camera and composition

1. The shot list comes first (milestone 1): one composed shot per section,
   with position, look-at, FOV, what is in frame, and the text side. Alternate
   the text sides so the subject sits opposite the text.
2. If the page snaps to section tops, shot i rests at
   `progress = i / (N - 1)`, not at `(i + 0.5) / N`. Key every shot through one
   `shotProgress(i)` helper.
3. Per-shot FOV: about 42 for normal shots, 50 looking up and 40 for the
   close-up, eased between them. FOV is vertical, so below aspect 0.75 widen it
   to keep the horizontal angle, capped at 70.
4. Re-aim infinitely far objects (moon, sun) per shot and ease them with the
   camera. Nobody notices a moon moving.
5. Key those objects from a target screen position (unproject it), not from
   guessed angles. Guesses landed behind a beam and behind an eave.
6. Keep bright props out of the top 12% of every shot, where the nav lives,
   and off the text side. Respace the props rather than move an approved
   camera.
7. Some compositions are impossible. Sweep the yaw before arguing: showing a
   window while keeping a landmark out of a corner needed yaw 75.
8. Leave a gap in the geometry where a low shot looks up. Otherwise it sees
   only eave undersides.
9. Damp frame-rate independently: `k = 1 - exp(-10 * delta)`. A fixed
   `lerp(0.1)` settles at different speeds at 60 and 144 Hz.
10. With a smooth scroller, snap logic must read the native scroll position.
    The smoothed progress lags up to about 1 s, and a snap reading it undoes
    jumps that already landed.
11. Add a path-check script (plain Node, no browser, part of `npm run check`).
    It should assert that the shots match the content sections, rests land on
    shots, there are no jumps, the camera moves one way along the path, it
    stays inside bounds, and it keeps clearance from obstacles (0.5 m).

## 7. Performance

1. Measure at DPR 2, not only DPR 1. 60 fps at DPR 1 hid 30 to 38 at DPR 2.
   A fill-bound street ran about 40 fps at DPR 2 on an M-series laptop.
2. Capping DPR at 1.5 draws 44% fewer pixels than 2. Cap the high tier there
   unless DPR 2 is measured to hold.
3. The costs that were found: fill rate at DPR 2, a full-resolution bloom
   bright-pass, transmission buffers and mirror resolution. Measure each with
   `?off=` before cutting anything.
4. Bloom's `mipmapBlur` runs its bright-pass at full canvas size, and it
   ignores `resolutionScale`. At DPR 2 that is a whole extra half-float frame.
   Set `luminancePass.resolution.scale = 0.5` through a ref.
5. Give the planar mirror a fixed pixel budget (960 x 600, times a tier
   scale squared), not a fraction of the drawing buffer. DPR 2 then costs the
   same as DPR 1. Ripples and blur throw away finer detail anyway.
6. Render the mirror to a half-float, mipmapped target, so the shader blurs
   by picking a mip.
7. When the camera is at rest (moving under 0.004 in its matrix), redraw the
   mirror every other frame, and keep the texture matrix it was drawn with.
8. drei `MeshReflectorMaterial`, or any mirror, renders every frame even when
   hidden. "Off" means unmounted.
9. No `transmissionSampler`, and no full-screen half-float transmission
   buffers at DPR 2 (context loss). Transmission re-draws the scene per buffer,
   8 times a frame in one scene.
10. Quality tiers: guess the tier at startup from `hardwareConcurrency`,
    `deviceMemory` and `(pointer: coarse)`, not `useDetectGPU` (it fetches from
    a CDN). Let drei `PerformanceMonitor` step down live.
11. Tier levers that worked:
    - DPR: 1.5 / 1.5 / 1.25
    - shadow map: 2048 / 1024 / 512, all static
    - mirror: 1/2 res, 1/4 res, or environment only on low
    - point lights: 6 / 4 / 2
    - rain: 6000 / 3000 / 1200
    - post: bloom + SMAA + vignette + grain / bloom + vignette / cheap bloom + vignette
12. Static shadows (section 4) make a 2048 map almost free after the first
    frames.
13. Main-thread geometry work (marching squares, rebuilt meshes): run it at
    30 Hz, not every frame, while the clock still accumulates every frame.
14. Confirm a frame-rate problem in a production build before chasing it.
    One long chase turned out to be dev-build overhead.
15. Spend detail only where a camera sees it. Before tiling or detailing a
    whole surface, check which faces the approved cameras ever show. Full
    coverage can cost millions of triangles for nothing.

## 8. QA and dev hooks

1. `?at=N` jumps the camera to shot N with no damping. With GSAP
   ScrollSmoother, jump with `smoother.scrollTop(y)`, never `smooth(0)` plus
   `window.scrollTo`: the content transform can stay at 0, and 4 of 6 loads
   showed the hero text over shot N.
2. `?fps` logs `[fps] NN` once a second from a `useFrame` counter.
3. `?off=rain,mist,post,reflect,shadows,fog,bloom,smaa,lights` turns named
   passes off, so each one's cost is measured, not guessed.
4. `?mark=T` holds a timed moment at T seconds (a drop landing, a logo
   forming), so QA can screenshot a moment that only lasts a beat. It combines
   with `?at` (for example `?at=5&mark=2.5`).
5. Gate every hook on `NODE_ENV !== "production"`. Read the URL once on the
   client, inside Canvas children (never server-rendered), so there is no
   hydration mismatch.
6. Headless Chrome `--screenshot` (with or without `--virtual-time-budget`)
   captures before WebGL draws, so the image is black. Capture through the
   DevTools protocol (`Page.captureScreenshot`) after a real wait.
7. Heavy shots need about 10 s before capture. A 6 s wait gave a black shot
   (`browser.mjs shot --wait 10000`).
8. Test browsers share the GPU with the user's own browser. Take FPS with
   only one headless browser running, and treat headless FPS as relative, not
   as the user's number. Take a baseline before builders start (their edits
   and hot reloads spoil later readings), and let one quiet reading, with
   nothing else running, decide "done".
9. Watch for context loss in every QA run:
   `browser.mjs console <url> --match "Context Lost"`.

## 9. Workflow

1. `next build` and a running `next dev` share the `.next` folder. Building
   mid-session can corrupt the dev server's cache, and it then hangs on
   "Starting..." or panics about its cache.
2. To avoid that, stop dev first or build into a separate folder (a
   `distDir` from an env var). To recover: stop dev, delete `.next`, restart.
   Never delete its lock file while it is writing.
3. Parallel builders: shared scene files (the scene root, the global shader
   patch, the shot and light lists) get one owner. Others ask for a one-line
   mount edit.
4. A global `ShaderChunk` patch changes every material, so any edit to it
   needs screenshots of every shot, not just the one being fixed.
5. Keep one data module for the lamp list (walls, mist, rain and point lights
   all read it), so moving a lamp moves its light everywhere.
6. When deleting a component, delete its check script and its `npm run check`
   entry in the same commit.
7. If the framework has no option to build into another folder, build from a
   copy: sync the repo (minus dependencies, build output, `.git` and big raw
   assets) to a scratch folder, copy dependencies in with copy-on-write
   (`cp -Rc` on macOS), and build there. Some bundlers (Turbopack) reject a
   symlinked `node_modules` that points outside the project root.
8. Before a fix round, make sure QA or an audit names the exact mesh and file
   behind each problem in a screenshot ("the bar above the lantern" is not
   enough). Builders lost whole fix rounds guessing which mesh a crop showed.
