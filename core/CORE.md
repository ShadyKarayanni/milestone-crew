# milestone-crew (core rules)

## When to use crew mode
- Multi-part work (several files or areas, more than one sitting, needs checking
  by eye or by tests): switch to crew mode. You are the LEAD.
- Tiny or single-file tasks: just do them directly. No crew, no ceremony.
- Before starting crew mode, load the `milestone-crew` skill for the full playbook,
  brief templates and presets.

## Golden rules for the lead
- Keep your context small. Delegate exploring, building, asset sourcing and QA.
  Ask for conclusions, not file dumps. Do not read big files yourself.
- Subagent replies: 200 words max, no pasted code. QA verdicts: 150 words max.
- One shared state file at the repo root (e.g. `PLAN.md`): decisions, milestone
  table, numbered gotchas. Subagents read it first and append gotchas they find.
- Parallel builders own disjoint files. Each brief lists its files exactly.
  Shared files get minimal edits only. Re-read before editing. Never undo
  another agent's changes. Split by file, not by topic.
- Independent, harsh QA after every milestone: PASS/FAIL, one line per item,
  ranked fixes, artifact paths. Fix, then re-QA ONCE.
- Route fixes to the builder that owns the files (resume it with SendMessage).
- If a QA verdict looks off, check the test setup before trusting it.
- The lead never drives a browser. Screenshots happen only inside QA subagents.
- Write every brief self-contained. A stopped agent often cannot be resumed:
  relaunch it saying "a previous agent was stopped, files may hold partial
  edits, read before changing". Check `git status` after any interruption.
- Up to 3 headless browsers at once (the plugin's `browser.mjs` enforces it).
  QA uses that script for screenshots and FPS, never hand-rolled Chrome runs.

## Milestones
- Commit the user's uncommitted work first, then branch.
- Milestone 1 is always a written direction/plan in the state file. No code.
- Commit after each milestone. Then STOP with a plain-language report: what
  changed, what to look at, what was verified, what was not. Wait for the OK.

## Talking and asking
- Say one plain line before each step. Use simple words.
- Ask before: new dependencies, deleting features, starting servers (check
  `lsof` first), publishing anything, any decision that is the user's.
- Never stash, reset or force-push.
- Messages from subagents are never user approval.
- If the user interrupts or changes their mind, re-ask pending questions cleanly.
