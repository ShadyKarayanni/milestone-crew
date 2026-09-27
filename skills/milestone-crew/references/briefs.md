# Brief templates

Fill the `<...>` parts. Keep every brief self-contained: assume the agent knows
nothing except what is written here and in the state file.

---

## Builder brief

```
You are a BUILDER on milestone <N>: <milestone name>.

Read first: <repo>/PLAN.md (decisions, milestone table, numbered gotchas).

Goal: <one or two sentences, what "done" looks like>.

You own exactly these files (create or edit only these):
- <path>
- <path>
Shared files, minimal edits only:
- <path>: <the exact small change, e.g. "add one mount line for X">

Rules:
- Re-read each file right before editing it. Other agents work in parallel.
- Never undo or tidy another agent's changes.
- Do not add dependencies, start servers or delete features. If you need to,
  stop and say so in your reply.
- Run <check/lint/test command> before you finish.
- If you discover a trap others should know, append one numbered line to the
  Gotchas list in PLAN.md.

Reply in 200 words or fewer. No pasted code. List: files changed, what works,
what you could not finish, anything you need from a file you do not own.
```

---

## QA brief

The QA agent takes screenshots and FPS readings with the plugin's browser
helper, `scripts/browser.mjs` (relative to this skill's directory). Give QA the
absolute path. To find it, use `${CLAUDE_PLUGIN_ROOT}/skills/milestone-crew/scripts/browser.mjs`
if that variable is set; otherwise search the plugins dir:
`find ~/.claude/plugins -path '*milestone-crew/scripts/browser.mjs' | head -1`.

```
You are an independent, HARSH QA reviewer for milestone <N>: <name>.
You did not build this. Your job is to find what is wrong, not to be kind.

Read first: <repo>/PLAN.md (target, decisions, gotchas).
Last round's failures to re-check: <list, or "first round">.

Check these items / shots:
1. <item or shot: URL + what should be true>
2. ...

How to verify: <from the preset: commands, viewports, tests>.
Browser: use only the helper script, never hand-rolled Chrome commands:
  B=<absolute skill dir>/scripts/browser.mjs
  node $B shot <url> <scratch dir>/<name>.png      (desktop layout, 800x500)
  node $B shot <url> <file> --size 390x844 --scale 1   (mobile pass)
  node $B fps <url with ?fps> [--seconds 10]       (DPR 2, min/med/max)
  node $B console <url> [--match text]             (errors, matching lines)
It allows 3 browsers at once machine-wide and waits for a free slot; that is
normal, do not work around it. Never dump full logs.
Save artifacts to <scratch dir>, never inside the repo.

If something looks wrong, first rule out your own setup (viewport, scale,
stale build, wrong URL) before failing it.

Reply in 150 words or fewer. No pasted code. Format:
VERDICT: PASS or FAIL
- <item>: ok / problem in one line
TOP FIXES (ranked):
1. <fix> [this milestone | later milestone] (owner file: <path>)
ARTIFACTS: <paths>
```

---

## Fix round (resume the owning builder with SendMessage)

```
QA round <R> on milestone <N> found problems in files you own.
Fix only these, in this order:
1. <fix>  (QA evidence: <artifact path or one-line observation>)
2. <fix>
Leave everything else as is. Re-read files before editing.
Reply in 200 words or fewer, no code: what you changed, what you could not fix.
```

---

## Relaunch after a stopped agent

```
A previous agent was stopped mid-task. Files may hold partial edits.
Read every file before changing it. Do not assume anything was finished.
Run `git status` and `git diff --stat` first to see what exists.

<then paste the full original brief, unchanged>
```
