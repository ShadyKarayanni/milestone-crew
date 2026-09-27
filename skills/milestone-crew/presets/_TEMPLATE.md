# Preset: <name>

<One line: what kind of work this preset is for.>

## Default milestone plan

Defaults the kickoff proposes, not a fixed plan. The kickoff fits them to
the project and the user approves. Every "Done when" item must be observable:
something a QA agent can check and mark met or not met.

1. **Direction / plan** (no code, written in the state file).
   Done when: <the direction covers X, Y, Z; the user has approved it>.
2. **<milestone>**: <scope>.
   Done when: <observable criterion>; <criterion>.
3. **<milestone>**: <scope>.
   Done when: <observable criterion>; <criterion>.
4. **<milestone>**: <scope>.
   Done when: <observable criterion>; <criterion>.
5. **<polish / performance / cleanup>**: <scope>.
   Done when: <budgets met, checks pass, final QA passes>.

## How QA verifies

- <Commands, tests, screenshots, viewports. What counts as PASS.>
- <How to keep QA runs short and cheap on the machine.>

## Dev hooks to add

- <Small dev-only switches that make QA deterministic, e.g. jump-to-state flags.>

## Ask first

- <Risky actions specific to this kind of work.>

## Gotchas

1. <A trap that cost time before, and how to avoid it.>

## Budgets

- <Size, speed, cost or time budgets, with starting numbers.>
