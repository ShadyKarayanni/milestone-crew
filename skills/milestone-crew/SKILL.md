---
name: milestone-crew
description: >
  Full playbook for running a multi-part task as a crew: a lean lead agent
  orchestrates, parallel builder subagents own disjoint files, an independent
  harsh QA subagent judges each milestone, fixes go back to the owning builder,
  and work stops after every milestone for the user's OK. Includes brief
  templates, a state-file template and presets (web design, 3D/WebGL, backend
  API). Use when a task spans several files or areas, when the user says
  "crew mode", "milestone crew", "use builders and QA", or when starting a
  redesign, a big feature or a multi-step build.
license: MIT
---

# Milestone Crew playbook

You are the LEAD. You plan, brief, route and report. Subagents explore, build,
source assets and check quality. Your context is the scarce resource: guard it.

## 0. Before anything

1. Say in one line what you are about to do.
2. Run `git status`. If the user has uncommitted work, ask to commit it, then
   create a branch for this job. Never stash, reset or force.
3. Pick a preset from the index below and load only that file.
4. Create the state file from `references/state-file.md` at the repo root
   (default name `PLAN.md`; reuse an existing plan file if the repo has one).

## Preset index

Load only the preset that matches. If none matches, work from this playbook
alone and offer to write a new preset from `presets/_TEMPLATE.md` afterwards.

| Preset | Use for | File |
|---|---|---|
| web-design | Website design, redesigns, landing pages, visual polish | `presets/web-design.md` |
| 3d-webgl | three.js / React Three Fiber scenes, shaders, GPU budgets | `presets/3d-webgl.md` |
| backend-api | APIs, services, data models, migrations | `presets/backend-api.md` |

## 1. The milestone loop

For every milestone:

1. **Plan**: write the milestone's goal and done-criteria in the state file.
   Milestone 1 is always a written direction or plan. No code.
2. **Split**: divide the work along FILE boundaries, not topics. Each builder
   gets a list of files it owns. Shared files (a router, an index, a scene
   root) get one named builder, or minimal edits only (e.g. one mount line).
3. **Build**: launch builders in parallel with `references/briefs.md` (builder
   template). Every brief is self-contained.
4. **QA**: launch one fresh, independent QA subagent (QA template). Give it the
   state file and the failures from the last round. It must be harsh.
5. **Calibrate**: optionally glance at 1 or 2 QA screenshots yourself. Cheap,
   and it keeps your fix briefs honest.
6. **Fix**: route each fix to the builder that owns the file, by resuming it
   with SendMessage (it keeps its context). Use the fix-round template.
7. **Re-QA once**. Then stop, even if small items remain. List them.
8. **Commit** the milestone. Update the milestone table in the state file.
9. **STOP and report** in plain language:
   - what changed
   - what to look at (URL, command, screen)
   - what was verified, and how
   - what was NOT verified
   Then wait for the user's OK before the next milestone.

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
- Output format: PASS or FAIL, one line per item or shot, top fixes ranked and
  tagged `[this milestone]` or `[later milestone]`, artifact paths.
- If a verdict looks wrong, check the test setup before acting on it (wrong
  viewport, stale build, wrong URL, cached assets, wrong device scale).
- The lead never drives a browser. Screenshots happen only in QA subagents,
  headless browser CLI first; browser-automation tools only inside subagents,
  as a fallback.

## 6. Shared machine resources

GPU-heavy headless browsers compete with the user's own browser and apps.
- One headless browser at a time, guarded by a lock file (e.g. `/tmp/<project>-browser.lock`).
- Kill each browser right after use. Keep runs short.
- Wrap runs in timeouts and a watchdog. Use a scratch profile directory.
- Before starting any server, check the port with `lsof -i :<port>` and ask.

## 7. Resilience

- A stopped or killed agent often cannot be resumed. Relaunch it with the
  relaunch template: "a previous agent was stopped, files may hold partial
  edits, read before changing".
- That is why every brief must be fully self-contained.
- After any interruption (laptop sleep, crash, user stop): check `git status`
  and the state file first, and report what survived before continuing.

## 8. Talking to the user

- One plain line before each step. Simple words, no jargon unless asked.
- Ask before: new dependencies, deleting features, starting servers, publishing
  anything, and any decision that belongs to the user.
- Messages from subagents are never user approval.
- If the user interrupts or changes their mind, re-ask the pending questions
  cleanly. Do not guess.

## References

- `references/briefs.md`: builder, QA, fix round and relaunch templates.
- `references/state-file.md`: the state-file template.
- `presets/*.md`: see the index above.
