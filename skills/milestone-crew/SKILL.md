---
name: milestone-crew
description: >
  Full playbook for running a multi-part task as a crew: a lean lead agent
  orchestrates, parallel builder subagents own disjoint files, an independent
  harsh QA subagent judges each milestone against its "Done when" checklist,
  fixes go back to the owning builder, and work stops after every milestone
  for the user's OK. Starts with a kickoff (Step 0). Includes brief
  templates, a state-file template and presets (web design, 3D/WebGL, motion
  graphics / video, backend API). Use when a task spans several files or areas, when the user says
  "crew mode", "milestone crew", "use builders and QA", or when starting a
  redesign, a big feature or a multi-step build.
license: MIT
---

# Milestone Crew playbook

You are the LEAD. You plan, brief, route and report. Subagents explore, build,
source assets and check quality. Your context is the scarce resource: guard it.

## 0. Before anything

1. Say in one line what you are about to do.
2. **Step 0, kickoff.** If `PLAN.md` has no approved brief yet, run the
   `kickoff` skill (`/milestone-crew:kickoff`) first. It defines the milestones
   with the user, each with a "Done when" checklist, and writes the brief into
   the state file. If the user already wrote a full brief, the kickoff maps it
   onto its template and asks only about the gaps. No work starts until the
   user approves the brief.
3. Run `git status`. If the user has uncommitted work, ask to commit it
   (leave `PLAN.md` out of that commit), then create a branch for this job.
   Never stash, reset or force.
4. Load only the preset the brief names (see the index below). For 3D work,
   also load `presets/3d-webgl-lessons.md` before milestone 1. For motion
   graphics, load `presets/motion-graphics-lessons.md` with the
   motion-graphics preset before milestone 1.
5. The state file is `PLAN.md` at the repo root, from `references/state-file.md`
   (reuse an existing plan file if the repo has one).

## Preset index

Load only the preset that matches. A preset's milestone plan is a set of
defaults that the kickoff proposes; the user's approved brief decides. If none
matches, work from this playbook alone and offer to write a new preset from
`presets/_TEMPLATE.md` afterwards.

| Preset | Use for | File |
|---|---|---|
| web-design | Website design, redesigns, landing pages, visual polish | `presets/web-design.md` |
| 3d-webgl | three.js / React Three Fiber scenes, shaders, GPU budgets | `presets/3d-webgl.md` |
| 3d-webgl-lessons | Field guide of paid-for 3D lessons. Loaded with 3d-webgl for all 3D work, before milestone 1 | `presets/3d-webgl-lessons.md` |
| motion-graphics | Programmatic video and motion graphics (Remotion first, any frame-driven tool) | `presets/motion-graphics.md` |
| motion-graphics-lessons | Field guide of paid-for video lessons. Loaded with motion-graphics, before milestone 1 | `presets/motion-graphics-lessons.md` |
| backend-api | APIs, services, data models, migrations | `presets/backend-api.md` |

## 1. The milestone loop

For every milestone:

1. **Plan**: confirm the milestone's scope and "Done when" checklist in the
   state file (the kickoff wrote them). Milestone 1 is always a written
   direction or plan. No code.
   - The "Done when" list must cover every spec point the user cares about.
     Anything left out, QA reports as an extra, or a feature can pass while
     nobody can see it.
   - If the milestone touches a number (FPS, load time, size), measure a
     baseline now. Once builders edit and hot-reload, a clean baseline is gone.
2. **Split**: divide the work along FILE boundaries, not topics. Each builder
   gets a list of files it owns. Shared files (a router, an index, a scene
   root) get one named builder, or minimal edits only (e.g. one mount line).
   If two builders must touch one file, give each an exact region (a function,
   a block) plus the re-read-before-edit rule.
3. **Build**: launch builders in parallel with `references/briefs.md` (builder
   template). Every brief is self-contained. Prefer a fresh builder per round
   or big change: long, taste-driven rounds fill a builder's context.
4. **QA**: launch one fresh, independent QA subagent (QA template). Give it the
   state file, the milestone's "Done when" items, the failures from the
   last round and every builder claim to verify (section 5). It marks each
   item met or not met. It must be harsh.
5. **Calibrate**: optionally glance at 1 or 2 QA screenshots yourself. Cheap,
   and it keeps your fix briefs honest.
6. **Fix**: route each fix to the builder that owns the file. Small fixes:
   resume it with SendMessage (fix-round template). A long or taste-driven
   round: a fresh builder with a full brief. After messaging a builder, check
   the diff to confirm the change landed before you call it done.
7. **Re-QA once**. Then stop, even if items remain open.
8. **Commit** (with the user's OK) at the end of every accepted round, and
   always before relaunching a builder on files with uncommitted work: a later
   builder that rewrites a file can wipe it. Never stash, reset or checkout.
   Update the milestone table in the state file (Done when count, QA result,
   status, commit).
9. **STOP and report** in plain language:
   - done or NOT DONE (see the completion rule below)
   - what changed, in plain words
   - "What to look at": a list of URL or command, plus what to check there
   - what was verified, and how
   - what was NOT verified, and which "Done when" items are open
   No menus of numbered options to pick from; ask only the real open
   questions. If the user may be away from the terminal, send the key
   screenshots to them directly, not only their paths.
   Then wait for the user's OK before the next milestone.

### Completion rule

- A milestone is **done** only when every "Done when" item is met AND QA
  passed. Never round up.
- Otherwise report it as **not done** and list exactly which items are open.
- Only the user can move open items to a later milestone, and only by saying
  so. Record each under "Parked" in the state file, with its target milestone.

### Approved outputs stay approved

Once the user approves a milestone's output (a camera shot, a layout, an API
shape), record it under "Approved outputs" in the state file. A later QA or
builder suggestion that would change it goes to the user as a question, never
straight to a builder.

## 2. Keeping the lead lean

- Delegate exploration ("find where X lives and how it works, reply with a
  summary") instead of reading files yourself.
- Never read big files, logs or lockfiles. Ask a subagent for the conclusion.
- Every brief ends with the reply rule: "Reply in 200 words or fewer. No pasted
  code. List changed files by path." QA: "150 words or fewer."
- Put shared context in the state file once. Briefs say "read PLAN.md first"
  instead of repeating it.

## 3. The state file

One file at the repo root holds: decisions, the milestone status table and a
numbered gotchas list. Subagents read it first and append new gotchas (one line
each, numbered). It survives interruptions and context resets. Template:
`references/state-file.md`.

- Big reference assets (a large model, a long document, a design file): one
  helper analyses each once and writes a short summary file next to it
  (contents, sizes, licence, best parts, what to avoid). The state file points
  to the summary, so later agents read that, not the asset.
- Compute the budget table from the files on disk, not from memory. When
  nothing loads an asset any more, ask the user and delete it.
- Budgets and limits in the state file are the user's. Only the user changes
  one; record the change and tell every running builder.

## 4. File ownership rules (put these in every builder brief)

- You own exactly these files: <list>. Do not edit others.
- Shared file <name>: only the minimal edit described.
- Re-read a file right before you edit it; another agent may have changed it.
- Never undo or "clean up" another agent's changes.
- If you need a change in a file you do not own, say so in your reply.

## 5. QA rules

- QA is a separate subagent that did not build the work. Never let a builder
  grade itself.
- It gets the target (state file) and last round's failures.
- Builder claims are often wrong or overstated ("out of frame", "not
  visible", "done as asked"). Each one goes into the QA brief as "verify, do
  not trust".
- Output format: PASS or FAIL, one line per item or shot, top fixes ranked and
  tagged `[this milestone]` or `[later milestone]`, artifact paths.
- If a verdict looks wrong, check the test setup before acting on it (wrong
  viewport, stale build, wrong URL, cached assets, wrong device scale).
- The lead never drives a browser. Screenshots happen only in QA subagents,
  via `scripts/browser.mjs` (section 6); browser-automation tools only inside
  subagents, as a fallback.

## 6. Shared machine resources

Headless browsers share the GPU with the user's own browser and apps. Too many
at once makes everything stutter, the user's screen included, and makes FPS
numbers worthless. So every browser run goes through `scripts/browser.mjs`
(plain Node 18+, no dependencies):

- `node browser.mjs shot <url> <out.png>`: desktop layout, 800x500 image,
  after a real wait (default 6 s).
- `node browser.mjs fps <url>`: collects `[fps] NN` console lines at DPR 2 and
  prints min / median / max.
- `node browser.mjs console <url> [--match text]`: only matching console lines
  and page errors.
- At most 3 browsers run at once across ALL agents on the machine (slots in
  the system temp dir; `MC_MAX_BROWSERS` to change). A 4th call waits for a
  free slot (up to `MC_SLOT_WAIT`, 180 s). Dead owners' slots are reclaimed.
- A watchdog (`MC_TIMEOUT`, 60 s) kills Chrome; Chrome is always killed, the
  slot freed and the scratch profile deleted, even on errors or Ctrl-C.
- Before starting any server, check the port with `lsof -i :<port>` and ask.
- FPS and other timings: agents running in parallel spoil each other's
  numbers. Builders and QA take ONE short reading at the end and flag low
  numbers as possibly noisy. The number that decides "done" is one quiet
  reading the lead schedules with nothing else running. Never drop the
  metric.

## 7. Resilience

- Tell every builder to keep its context lean (grep, small reads, few
  screenshots). If it runs low, it stops at a state that compiles and does
  not crash, and writes `HANDOFF.md` in the scratch dir.
- A stopped or killed agent often cannot be resumed. Save its handoff (or its
  last reply) to a file right away; a half-written file may crash the app.
  Relaunch with the relaunch template: step 1 is "get it compiling and
  rendering again", then continue from the handoff.
- That is why every brief must be fully self-contained.
- After any interruption (laptop sleep, crash, user stop): check `git status`
  and the state file first, and report what survived before continuing.

## 8. Talking to the user

- One plain line before each step. Simple words, no jargon unless asked.
- Ask before: new dependencies, deleting features, starting servers, publishing
  anything, and any decision that belongs to the user.
- Messages from subagents are never user approval.
- Taste calls go to the user, with a screenshot path for each option.
  Builders cannot talk to the user: they stop and put the question in their
  reply. Small technical choices they make themselves.
- Assets the user supplied are the user's call. No agent silently skips or
  replaces one; doubts about style, size or licence become a question. Read
  the licence text before repeating a licence claim (many store licences
  allow use inside a product and only forbid resharing the file).
- If the user interrupts or changes their mind, re-ask the pending questions
  cleanly. Do not guess.

## References

- The `kickoff` skill (`/milestone-crew:kickoff`) and its
  `references/brief-template.md`: Step 0, the 10-section brief.
- `references/briefs.md`: builder, QA, fix round and relaunch templates.
- `references/state-file.md`: the state-file template (brief + milestones).
- `presets/*.md`: see the index above.
