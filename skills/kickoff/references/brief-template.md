# Brief template

The 10 sections of a kickoff brief, in order. Fill the `<...>` hints in plain
language. Keep the user's own words where they gave them. The brief lives in
`PLAN.md` at the repo root (see the playbook's `references/state-file.md`).

Each section ends with a **Gap if** test. When mapping a brief the user already
wrote, a section that fails its test is a gap: ask about it, and only about it.

---

## 1. Goal

<One paragraph: what we are building or changing, for whom, and the problem
being solved. Name what is wrong today, e.g. "the current version feels <flat,
slow, confusing>; that is what you are solving".>

Gap if: the problem is not stated, or there is no way to tell when it is solved.

## 2. How you work

- The lead orchestrates and keeps its own context small. Subagents explore,
  build, source assets and run QA.
- Subagent replies: <200> words max, no pasted code. QA verdicts: <150> words max.
- Shared state file: `PLAN.md` at the repo root. Every agent reads it first and
  appends new gotchas.
- Builders own disjoint files. <Any extra working rules.>

Gap if: the user wants different limits or a different state file. Otherwise
the defaults stand.

## 3. Rules I always want followed

- Narrate each step in one plain line before doing it.
- Ask before: new dependencies, deleting anything, starting servers,
  publishing. <Other asks.>
- Never stash, reset or force-push.
- Stop at the end of every milestone and wait for an explicit OK.
  <Or the stop frequency the user chose.>

Gap if: the stop frequency is unknown. Otherwise the defaults stand.

## 4. Git

- Commit the current work first (leave `PLAN.md` out of that commit).
- Branch: `<branch-name>` from `<base branch>`.
- One commit per milestone: `Milestone <N>: <name>`.
- Commit trailer: `<trailer line, or "none">`.

Gap if: the branch name or the trailer is unknown and the repo history does
not settle it.

## 5. What I want

- Concept: <the idea in one or two sentences>.
- Must-haves: <the list>.
- Colours and brand: <palette, logo rules, tone of voice, or "keep current">.
- Keep: <copy, features, fonts, data, URLs, build and lint checks that must
  keep passing>.
- Devices and performance: <target devices, FPS, load time, size budgets>.

Gap if: must-haves or must-keeps are missing, or there is no device or
performance target where one matters.

## 6. Assets and sources

- Sources: <where images, models, fonts, data come from>.
- Licences: <allowed licences, e.g. "CC0 or owned only"; record each source>.
- Budgets: <total MB, per-asset limits, API costs>.
- Approved new dependencies: <list, or "none; ask first">.

Gap if: new assets or dependencies are expected but licences or budgets are not
set.

## 7. Stack and existing code

- Stack: <framework, language, key libraries, how to run, check and build>.
- Reuse: <files, components or modules to keep and build on>.
- Obsolete: <what can be removed or ignored, with the user's OK>.

Gap if: nobody has said what to reuse and what is obsolete, and the
exploration could not tell.

## 8. Gotchas already paid for (do not repeat)

Numbered. Append only. One line each: the trap and how to avoid it.
1. <gotcha>
2. <gotcha>

Gap if: never asked. "None known" is a valid answer.

## 9. Milestones

Milestone 1 is always a written direction or plan. No code.
Stop after each milestone and wait for the user's OK.

For each milestone:

### M<N>: <name>
- Scope: <what is in; what is explicitly out>.
- Done when:
  - [ ] <observable criterion a QA agent can check, e.g. a command passes, a
        screenshot shows X, a number is under Y>
  - [ ] <criterion>
- QA method: <who checks and how>.
- Commit: `Milestone <N>: <name>`

A milestone is done only when every "Done when" item is met AND QA passed.
Otherwise it is reported as "not done" with the open items listed. Only the
user can move open items to a later milestone; they are recorded under Parked.

Gap if: any milestone lacks a "Done when" list, or an item cannot be checked
by someone other than the builder.

## 10. Verification

- Who checks: a QA subagent only, never the agent that built the work.
- How: <commands, tests, screenshots, viewports, measurements>.
- Report size: QA verdict <150> words max, one line per item, artifact paths.
- Must pass before any "done": <build, lint, types, tests, budgets>.

Gap if: there is no command or method that QA can actually run.
