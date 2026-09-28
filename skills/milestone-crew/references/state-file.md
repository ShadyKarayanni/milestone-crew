# State-file template

Copy this to the repo root as `PLAN.md` (or reuse the repo's existing plan
file). The kickoff (`/milestone-crew:kickoff`) writes it; subagents read it
first. Sections 1 to 10 are the brief (full hints in the kickoff skill's
`references/brief-template.md`). Keep it short: every agent loads it.

```markdown
# <Project> plan

Branch: <branch>   Preset: <web-design | 3d-webgl | motion-graphics | backend-api | none>
Brief: <draft, awaiting approval | approved YYYY-MM-DD>

## 1. Goal
<One paragraph: what, for whom, and the problem being solved.>

## 2. How we work
- Lead orchestrates, keeps its context small. Subagents explore, build, QA.
- Subagent replies <200> words max, no code. QA verdicts <150> words max.
- This file is the shared state. Read it first. Append gotchas to section 8.

## 3. Rules
- Narrate each step. Ask before new deps, deletions, servers, publishing.
- Never stash, reset or force-push. Stop after every milestone for an OK.

## 4. Git
Commit current work first, then branch <branch>. One commit per milestone:
`Milestone <N>: <name>`. Trailer: <trailer or none>.

## 5. What we want
- Concept: <...>
- Must-haves: <...>
- Colours and brand: <...>
- Keep: <copy, features, fonts, build checks>
- Devices and performance: <targets>

## 6. Assets and sources
- Sources and licences: <...>   Budgets: <...>
- Approved new dependencies: <list or none>

## 7. Stack and existing code
- Stack: <...>   Run / check / build: <commands>
- Reuse: <...>   Obsolete: <...>

## 8. Gotchas
Numbered. Append only. One line each. Subagents add what they discover.
1. <gotcha>

## 9. Milestones
Done = every "Done when" item met AND QA passed. Otherwise "not done", with
the open items listed. Stop after each milestone and wait for the user's OK.

| # | Milestone | Done when | QA | Status | Commit |
|---|-----------|-----------|----|--------|--------|
| 1 | Direction / plan (no code) | 3/3 met | PASS | done | abc123 |
| 2 | <name> | 2/4 met | FAIL r1 | not done: 2b, 2d | |
| 3 | <name> | 0/3 | | todo | |

### M1: Direction / plan (no code)
- Scope: <...>
- Done when:
  - [x] 1a. <observable criterion>
- QA method: <...>
- Commit: `Milestone 1: <name>`

### M2: <name>
- Scope: <in; out>
- Done when:
  - [ ] 2a. <observable criterion>
  - [ ] 2b. <criterion>
- QA method: <who and how>
- Commit: `Milestone 2: <name>`

## 10. Verification
- QA subagent only. How: <commands, URLs, viewports, tests>.
- Must pass before any "done": <build, lint, tests, budgets>.

## Approved outputs
Things the user signed off. Changing them needs the user's yes, not a builder.
- <M2: hero layout, approved YYYY-MM-DD>

## Parked
Open "Done when" items the user explicitly moved to a later milestone.
- <2d. item> -> M<N> (user, YYYY-MM-DD)

## Decisions
- <decision> (who decided, date)

## File ownership (current milestone)
- builder-a: <paths>
- builder-b: <paths>
- shared (minimal edits only): <paths>

## Open questions for the user
- <question>
```
