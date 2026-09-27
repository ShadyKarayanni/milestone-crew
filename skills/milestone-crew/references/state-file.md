# State-file template

Copy this to the repo root as `PLAN.md` (or reuse the repo's existing plan
file). Subagents read it first. Keep it short: it is loaded by every agent.

```markdown
# <Project> plan

Branch: <branch>   Preset: <web-design | 3d-webgl | backend-api | none>

## Goal
<Two or three sentences in plain language. What the user wants and why.>

## Decisions
- <decision> (who decided, date)
- <decision>

## Milestones
| # | Milestone | Owner(s) | Status | QA | Commit |
|---|-----------|----------|--------|----|--------|
| 1 | Direction / plan (no code) | lead | done | n/a | abc123 |
| 2 | <name> | builder-a, builder-b | in progress | FAIL r1 | |
| 3 | <name> | | todo | | |

## File ownership (current milestone)
- builder-a: <paths>
- builder-b: <paths>
- shared (minimal edits only): <paths>

## Verification
<How QA checks this project: commands, URLs, viewports, tests.>

## Gotchas
Numbered. Append only. One line each. Subagents add what they discover.
1. <gotcha>
2. <gotcha>

## Open questions for the user
- <question>
```
