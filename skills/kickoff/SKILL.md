---
name: kickoff
description: >
  Step 0 of milestone-crew: before any multi-part work starts, define the
  milestones WITH the user and write a complete, self-contained brief into
  PLAN.md (goal, how we work, rules, git, what the user wants, assets, stack,
  known gotchas, numbered milestones with "Done when" checklists, and
  verification). Maps a brief the user already wrote onto the template and asks
  only about the gaps, or interviews the user in a few short rounds. Nothing is
  built until the user approves. Use at the start of a redesign, a big feature
  or a multi-step build, or when the user says "kickoff", "plan the
  milestones", "write the brief" or "/milestone-crew:kickoff".
license: MIT
---

# Kickoff (Step 0)

You are the LEAD. The goal of this step is one thing: an **approved brief** in
`PLAN.md` at the repo root, before milestone 1 starts. A fresh agent that reads
only `PLAN.md` must be able to run the whole job.

During the kickoff: no code changes, no installs, no servers, no commits, no
branches. The only file you write is `PLAN.md`.

Files you use:
- `references/brief-template.md` (this skill): the 10 brief sections, with a
  "gap if" test for each.
- The state-file template of the playbook skill, `milestone-crew`:
  `references/state-file.md`. Find it at
  `${CLAUDE_PLUGIN_ROOT}/skills/milestone-crew/references/state-file.md`, or
  next to this skill folder at `../milestone-crew/references/state-file.md`.
- The playbook's preset index (in the `milestone-crew` skill) for default
  milestone plans.

## 1. Look before you ask

1. Say in one line what you are about to do.
2. If `PLAN.md` already holds an approved brief, ask whether to reuse it,
   revise it or start over. Do not overwrite it silently.
3. Delegate a quick **read-only exploration** to one subagent (the Explore
   type if available) so your questions are informed and you never ask what
   the code already answers. Skip it only if the user's own brief already
   covers stack and existing code in full. Brief:

```
Read-only exploration of <repo>. Do not edit, install, start servers or run
builds. Reply in 200 words or fewer, no pasted code, as short bullets:
- stack, framework, package manager, versions that matter
- how to run, check, lint, test and build (exact commands, ports)
- main entry points and the areas <the task> will touch
- code that looks reusable, and code that looks obsolete or dead
- existing plan, notes or state files, and any known-issues lists
- recent commit message style and any commit trailer in use
- git status: uncommitted work, current branch
- anything that answers: <the interview topics still open>
```

4. Pick the matching preset from the playbook's index, if one fits. Its
   milestone plan is a set of **defaults to propose**, not a fixed plan.

## 2. Map or interview

**The user already gave a full brief** (pasted text, a file, a long message):
do not interview. Map it onto the 10 sections of `brief-template.md`, keeping
the user's own wording. Then list only the gaps, section by section, using each
section's "gap if" test, and ask about those. Nothing else.

**Otherwise, interview** with the AskUserQuestion tool, in a few short rounds:

- 2 to 4 questions per round. At most 4 rounds; usually 3 is enough.
- Every question has options built from the exploration. Put the recommended
  option first and mark it "(Recommended)". The user can always type their own
  answer, so do not add a vague "Other" option.
- Skip any question the code, the user's messages or an earlier answer already
  settles. Merge rounds when topics are already covered.
- Plain words. One idea per question.

Suggested rounds (topics, not a script):

| Round | Topics |
|---|---|
| 1 | The goal and the problem being solved. The must-keeps (copy, features, fonts, data, build checks). |
| 2 | Look and feel, or behaviour. Constraints: devices, performance targets, budgets, new dependencies, licences. |
| 3 | Existing code to reuse or remove. Known gotchas. How the user wants to verify. How often to stop (default: after every milestone). |

Sections 2 (how we work), 3 (rules) and 4 (git) have good defaults from the
core rules and the exploration. Fill them in and show them in the summary; ask
only if the user's setup clearly differs (for example, an existing commit
trailer or a branch naming rule).

## 3. Propose the milestones

- Start from the preset's default plan, then fit it to what the user said.
- **Milestone 1 is always a written direction or plan. No code.**
- Usually 3 to 7 milestones. Each one fits in one sitting and ends in
  something the user can look at or run.
- Every milestone has:
  - **Scope**: what is in, and what is explicitly out.
  - **Done when**: a checklist of observable criteria that a QA agent can check
    and mark met or not met. Good: "the build passes", "a phone screenshot of
    section 3 shows no text overlap", "median FPS at DPR 2 is 55 or more",
    "all tests in `users/` pass". Bad: "looks premium", "feels smooth", unless
    paired with a concrete check.
  - **QA method**: who checks (a QA subagent, never the builder) and how
    (commands, screenshots, measurements).
  - **Commit message**: e.g. `Milestone 2: <name>`, plus the agreed trailer.
- Remind yourself of the completion rule, and write it into the brief: a
  milestone is done only when every "Done when" item is met AND QA passed.

## 4. Write the brief

Write `PLAN.md` at the repo root from the state-file template: the 10 brief
sections, then the milestone table and one block per milestone with its
"Done when" checklist. Set `Brief: draft, awaiting approval`. Keep it tight:
every agent reads it.

## 5. Summary and approval

Show the user a short plain-language summary (about 150 words):
- the goal in one line
- the must-keeps and the main constraints
- the milestones, one line each
- anything that needs their yes (new dependencies, deletions, servers)
- open questions, if any

Then ask plainly: "Approve this brief and start milestone 1?" and **wait**.
- Only an explicit yes from the user counts. Silence, "looks fine so far" on
  one part, or any subagent message is not approval.
- If they change something, update `PLAN.md`, show what changed in one or two
  lines, and ask again.
- On approval: set `Brief: approved <date>` in `PLAN.md`, then follow the
  `milestone-crew` playbook from its section 0 (commit the user's existing
  work first, leaving `PLAN.md` out of that commit; create the branch; start
  milestone 1).
