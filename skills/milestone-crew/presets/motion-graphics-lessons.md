# Motion graphics lessons (field guide)

Hard-won lessons from a 30 s product showreel and a 70 s, 4K, 60 fps UI demo
video (a look-alike of a web app, cursor, captions, real click and typing
sounds), both built in Remotion 4.0.481 by a lead, parallel builders and QA
subagents. Most apply to any frame-driven video tool. Sections 11 and 12 are
for UI demo videos and for a series of them.

Load this with `motion-graphics.md` before milestone 1 (before milestone 0
if you install skills). Copy the lessons that apply into the brief's
"Gotchas already paid for". Each lesson is the trap, then the fix.

## 1. Setup and licensing

1. Remotion needs a paid company licence for companies over 3 people. Ask at
   kickoff, before choosing it. Free route: HTML/CSS/JS, headless Chrome
   frame capture, ffmpeg.
2. Mixed `remotion` / `@remotion/*` versions break rendering. Pin all of them
   to one exact version. Never run `npx remotion upgrade` mid-project.
3. Keep renders (`out/`) in `.gitignore`. Commit sources, fonts with their
   OFL text, and sounds with a `SOUNDS.md` licence log.
4. Remotion caches its headless Chrome in `node_modules/.remotion`. No system
   Chrome is needed.

## 2. Skills

1. Worth installing: `remotion-dev/skills` (official),
   `iart-ai/motion-design-skills` (animation principles, beat-sync editing,
   shot composition, logo animation, art direction; MIT) and
   `iart-ai/kinetic-typography-skills` (MIT). Install with
   `npx skills add <repo> -a claude-code`.
2. Skip GSAP skills. They teach real-time animation, not frame-driven.
3. Unreviewed skills can carry scripts, network calls and broad triggers.
   Have a subagent review every installed skill before committing it.
4. Community skills teach CSS keyframes, GSAP and Framer, which render wrong
   in Remotion. Write that into the gotchas list.
5. Some Remotion skill pages need newer versions (motion-blur 4.0.529,
   light-leaks 4.0.500). Check the version before following one.
6. The remotion-markup sfx page streams remotion.media sounds via
   `@remotion/sfx`, with unclear licences. Don't use it without asking.
7. Some skills start Studio (a server) or run `create-video`. Ask before
   letting either run.
8. Repos that gitignore `.claude/*` block committing project skills. Use
   `git add -f .claude/skills`, or ask before changing `.gitignore`.
9. Broad-trigger skills ("animated background", "animate a headline", "logo
   animation") hijack normal app UI work. Keep them on the video branch or
   install them at user level.

## 3. Storyboard (milestone 1)

1. Cuts placed by feel drift off the music. Put a beat grid in the state
   file: 120 BPM at 30 fps is 15 frames per beat, so every cut is a multiple
   of 15.
2. Gaps and overlaps hide in a hand-written shot table. Make it cover
   0..N-1 exactly and have QA parse it with a script.
3. Back-to-back shots with the same main technique feel repetitive, even
   when the same move has two names. Forbid it in the rules.
4. Copy drifts from the product. Every line is verbatim from the product
   source or labelled "shortened".
5. Text held too briefly can't be read. Keep a legibility table: no more
   than ~3 words per second of hold.
6. Long transitions feel slow. Keep them to 6 frames or fewer.
7. Off-beat accents look like mistakes to QA. Label deliberate ones.
8. A harsh storyboard QA failed round 1 on copy fidelity and repeated
   techniques. Cheap on paper, expensive in code: run it.

## 4. Timeline and code

1. CSS transitions and animation libraries render wrong frame by frame.
   Animate only with `useCurrentFrame`, `interpolate` and `spring`.
2. Hard-coded global frames break when a shot moves. One `brand.ts` holds
   tokens, fonts, BEAT/BAR helpers and a SHOTS table; scenes read their
   frames from it.
3. `TransitionSeries` overlaps sequences and shifts cuts off the beat grid.
   Use plain Sequences; each scene handles its own in and out.
4. Load fonts with `@remotion/google-fonts` `loadFont()`, only the weights
   used. Use a local TTF where you need glyph outlines.
5. `backdrop-filter` glass breaks under 3D transforms. Fake the glass with a
   pre-blurred background layer.
6. Odometer counters: clip each digit column with a soft gradient mask.
   Hide leading zeros, or "630,957" reads as "0,630,957".
7. Parallel builders collide on shared files. Split by scene file, one owner
   for `Promo.tsx` and `Root.tsx`, `brand.ts` append-only.
8. A timeline that waits on other builders can't compile. Every builder
   creates STUB scene files first.
9. Match cuts between two builders' scenes don't line up. Write a handoff
   contract: exact rect, colour and frame of the shared shape.
10. A hard cut between two unrelated pictures reads as broken; the user
    called it out. Make it one continuous move: the same elements carry
    across the cut (a page wall spins into the vortex the logo slams out of),
    driven by one deterministic function of global frame and seed.
11. Fade in from black: a full-frame overlay in the root composition,
    opacity 1→0 over ~9 frames, keeping length and grid. The frame-0 sound
    must swell in with it.
12. A spring only reaches 1 a few frames after it starts (a 15 f slam at
    ~4.5 f, an 8 f pop at ~4 f), so impacts land late. Start it that many
    frames before the hit frame.
13. A frame-driven background inside a `<Sequence>` restarts at every cut,
    so it jumps. Drive continuous layers from the absolute frame.
14. `@remotion/google-fonts` downloads the font files at render time.
    Renders need network access.

## 5. Look and technique choice

1. Full animation is an expensive way to find the look. Make 3 style frames
   first (hook, product card, end card).
2. Taste-heavy techniques (text morphs) can't be picked on paper. Build 2 or
   3 short variant clips and let the user choose.
3. Blur plus alpha-threshold "goo" reads as dated (2016 CodePen).
4. What was tried for a text morph: a liquid-glass SVG filter, a raw-WebGL
   SDF "liquid metal" shader, and a crisp "magic move" glide. The user
   picked the glide: shared letters travel on springs, the rest blur and
   lift out, with a staggered resolve.
5. A single mid-morph still can look like a blob. Judge morphs from motion.
6. Raw WebGL in a canvas works in headless Remotion with `--gl=angle`. Read
   `3d-webgl-lessons.md` first.
7. An official wordmark in the brand colour can vanish on a dark background.
   Ask before using a white-filled copy of the same paths.
8. Don't repeat the URL under a wordmark that already contains it.

## 6. QA

1. Container duration lies: Remotion's silent AAC pads it to ~30.06 s.
   ffprobe the VIDEO stream for frame count and fps.
2. Toolkit: a 1 fps contact sheet (`fps=1` plus `tile`), single frames with
   `select=eq(n\,N)`, `ebur128=peak=true` for loudness, `silencedetect` or an
   energy-onset script on an SFX-only render for sync.
3. Renders can be stale. Prove they aren't with PSNR against fresh stills.
4. ffmpeg scene detection misses dark hard cuts, even at 0.1. Diff frames
   at the known boundaries instead.
5. A contact-sheet frame caught mid-animation misleads ("the logo is too
   small"). Check settled frames before raising a fix.
6. Most real issues were craft, not checklist: pops before slams,
   first-frame glide gaps, bold-to-thin handoffs, blank-looking wipes. Keep
   a "fix, then re-QA once" loop.

## 7. Rendering and performance

1. 900 frames at 1080p took ~85 s on Apple Silicon, with ~5 headless Chrome
   renderers on ~8 cores at 100% CPU. Users notice. Offer `--concurrency`.
2. Sound-only changes don't need a full re-render. Render audio only
   (`--codec=wav`), master it, mux with `-c:v copy` onto the silent video.
   About a minute.

## 8. Sound

1. Agents can't hear. Check by proxy (astats, ebur128, spectrograms, onsets),
   but taste needs the user's ears. Send clips early.
2. Safest licence: sounds generated by your own code (a Node synth plus
   ffmpeg polish). ZzFX sounds 8-bit unless heavily processed.
3. Node writing to ffmpeg's stdin without draining its stdout DEADLOCKS: hung
   7+ minutes at 0% CPU. Use temp files, or `spawnSync` with `input` and
   `maxBuffer`, and a `timeout` on every call. Check `ps` when an agent seems
   stuck.
4. Tonal shimmer tails, bell or FM chimes and rising-tone risers read as
   "metallic / outdated". What worked: a pitch-dropping sub boom plus a short
   dark noise punch, no tail; a dark noise swell for the riser.
5. Boom recipe in ffmpeg: `aevalsrc` sine with an exponential pitch drop and
   decay, plus lowpassed pink noise with a fast decay, mixed and limited.
6. One multi-note file whose spacing differs from the visuals reads as out
   of sync. Count the visual events: every pill, line or chip that animates
   gets its own cue on its exact frame.
7. Mix targets: −14 LUFS integrated, true peak ≤ −1 dBTP, impacts getting
   louder toward the finale. Keep the master step (gain plus limiter) in a
   script.

## 9. Working with the user

1. A category word widens the job: "metal sounds" became 8 changed sounds
   and the user was furious. Change EXACTLY the files or frames at the
   timestamps given. If label and timestamps disagree, trust the timestamps
   or ask one question.
2. Late deadlines ("10 minutes") leave no time for agents. The lead makes
   tiny edits (cue frames, a filter pass) directly.
3. A remote user can't see the terminal. Send stills, short clips and full
   cuts as they're made, even before QA.
4. Builders follow stale storyboard wording. Record every user pick in
   Decisions and supersede old ones explicitly ("goo" → "glide").
5. Jargon questions ("Soft or Crisp cursor variant? Dialog overlay?")
   confused the user. Pick small visual craft calls yourself and say what
   they'll see in one plain line. Sounds are the opposite: never pick a
   click, key set or song; give 3–5 audible options.
6. A re-QA still running after the user watched and approved the fix reads
   as ceremony. Say in one line what it still guards, offer to stop it and
   commit, and log "re-QA waived by user".
7. Short batch jobs (a set of GIFs, ~1 h) annoyed the user with milestone
   stops and routine asks. Ask at kickoff whether to stop per milestone;
   if not, cap QA at one round and send results straight to them.

## 10. Agent ops

1. Subagents may claim "the user said X" when the lead never relayed it; the
   user may have typed into the agent's transcript view. Surface it and
   verify. Don't assume either way.
2. Long-context builders drift. For a new, isolated deliverable, brief a
   fresh agent tightly instead of resuming a 300k-token builder.
3. Shells may alias `mv` to `mv -i`, so ffmpeg outputs silently fail to
   replace files. Use `command mv -f`.
4. Several `gh` accounts may be logged in, and the active one may lack org
   access. Check `gh auth status`; push with a one-off credential helper for
   the right account instead of switching the global one.
5. macOS has no `timeout` command, so "a timeout on every call" silently
   fails. Use `perl -e 'alarm shift; exec @ARGV' 600 <cmd>`, or run it in
   the background and kill it after N seconds. Kill hung renders (0% CPU).
6. `node_modules` can be silently incomplete: a package in `package.json`
   not installed, and the first render fails mid-milestone. Check it
   before the first render (`npm ls --depth=0`); fix with `npm ci` only
   after the user's OK.
7. A `git rebase main` rewrote a video branch's history (and pulled in an
   app change). Never rebase or force-push without asking.

## 11. UI demo / explainer videos

Look-alike and storyboard

1. Screenshots go soft at 4K and can't animate. Hand-build a look-alike of
   the app in the video project, with every label copied verbatim from the
   app's source code (or labelled "shortened"). No screenshots.
2. Animating how you think the app works gets it wrong: 5 of 30 gotchas
   were app facts (what hide does, what search keeps, popover vs dialog).
   Read the app's code for every step before it goes in the storyboard.
3. Fake data must look obviously fake (John Doe v. ACME General Hospital,
   Dr. Jane Roe, `ACME_ER_Records.pdf`). No real names or data.
4. A state set in a close-up must show wherever the real app shows it (a
   highlight added in the editor also shows in the table cell later).
5. 4K: design at 1920×1080 and render with `--scale=2`; drafts at scale 1.
   Use only vector or 2×+ raster assets, or they go soft.

Camera and captions

6. Cuts break the "watch me use it" feel. Use one continuous camera,
   `screen = A + Z·(p − F)`, with named presets (full view, caption side,
   caption top, close-ups at Z 1.3–1.7); moves of 48–70 f, no idle drift.
7. Keep one app card mounted the whole video, fed by `appState(frame)` per
   scene. Builder handoffs are state contracts: rows, view, camera preset,
   cursor spot.
8. A caption that enters while the camera still moves gets slid over by
   the card. Bring it in after ≥ 60% of the move's frames (≥ 85% from a
   close-up); leave the caption framing only after its fade-out ends.
9. Captions sit in a side panel beside the zoomed-out card (Z ~0.84), or
   as a one-line headline above when the side panel shrinks the UI too far.

Cursor and tilt

10. Cursor waypoints live in app space, so the cursor sticks to the UI
    while the camera moves, and it keeps one screen size (~28 px) at every
    zoom. Paths curve one way; duration = clamp(distance ÷ 900 px/s,
    24 f, 60 f), eased fast start, long settle.
11. Storyboard pixel numbers missed: the real dialog had a 2-line
    description and a new table grid moved every target. Aim the cursor
    from the layout constants the look-alike itself is drawn from.
12. Tilt driven by the tilted cursor feeds back on itself. Use the
    UNTILTED cursor position averaged over the previous 24 f; caps 3.5°
    side to side, 2.3° up-down, perspective 2000 px; hold it while hidden.
13. A cursor parked on text being typed or read hides it (even the input's
    clear ✕). In close-ups, park it below and to the right of the text.
14. `backdrop-filter` (4.5) fails on every dialog and popover inside the
    tilted card. On a white theme, a flat ~20% grey veil read better than
    the app's 80% black.

Typing

15. Typing sometimes started before the mouse finished moving. Order:
    cursor arrives → settles 8–15 f (60 fps) → click with sound → 6–12 f
    pause → first key. Vary the gaps slightly per shot and compute them
    from the cursor's actual arrival frame, not the storyboard's.
16. QA steps through every typing shot frame by frame: arrival, click and
    first key in that order, with those gaps.
17. The user found 11–14.5 chars/s too fast and ~7 too slow. ~10 chars/s
    with a seeded human rhythm worked: gaps 3–14 f at 60 fps, mostly 4–8,
    8–9 after spaces, one longer pause before a key word.

Sound

18. A 30-sound synthesized palette (pops, whooshes, ticks) approved on a
    quick listen was rejected in the video. What worked: only real
    recorded mouse clicks and keyboard typing plus one light song. Propose
    that from the start; 8.2 is for promos.
19. A palette approved on its own proves nothing. Play sounds in a short
    clip of the actual video before placing them everywhere.
20. Clicks: one identical short sample every time (user's pick, ~50 ms,
    180 Hz low-cut). Keys: ~19 single presses cut from recordings, never
    one of the last 6, rate 0.97/1/1.03, ±2 dB; fuller presses for space.
21. Cut each recorded hit 0.5 ms before the first sample above 10% of its
    peak (~70 ms per key), so the onset lands on its frame.
22. Clicks and keys came out too loud over the song; the user had them
    lowered 5 dB. Final: click peaks ~4 dB over song peaks, ~−19.5 LUFS.
23. Free-music licences limit use (Mixkit's covers web, social and online
    ads, not TV, radio, DVDs or games). Log each file and check the use.
24. One shared theme file (frames, layout, cues) means sound reads its
    frames at render time, so retimes need no sound edits.

Shared files

25. A builder rewrote the whole shared theme file and wiped another
    builder's block. Append-only means targeted edits inside your own
    marked block, never a full-file write.

## 12. A series of feature videos

1. Branch switching between videos breaks parallel work. Give each
   feature video its own git worktree off the base video branch
   (`git worktree add ../<repo>-demo-<feature> -b demo-<feature> <base>`).
2. Each video lives in its own `src/demo-<feature>/` folder. The base
   video's shared files are read-only: copy one into your folder to fork
   it. `Root.tsx` gets one `<Composition>` line per video.
3. Worktrees have no `node_modules` (gitignored). Symlink each one to the
   base checkout's `node_modules`: one install, same pinned versions.
4. Parallel full renders choke the machine. Use a machine-wide lock: `mkdir
   /tmp/<project>-render.lock` (atomic) before a full render, `rmdir` in a
   `trap ... EXIT`. One full render at a time, `--concurrency=50%` on 10
   cores.
5. Run one master agent per feature video, each following the crew
   playbook with its own `PLAN.md` in its worktree and the base video's
   lessons copied into its gotchas.
