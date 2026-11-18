# Preset: backend-api

For APIs, services, data models and background jobs.

## Default milestone plan

Defaults the kickoff proposes, not a fixed plan. The kickoff fits them to
the project, adds a "Done when" checklist to each, and the user approves.

1. **Design doc** (no code): endpoints or interfaces, data model changes,
   error cases, migration plan, test plan. In the state file. It fixes the
   contracts exactly (routes, request and response shapes, status codes,
   helper signatures, shared error classes as text to copy). That is what
   lets everything after it run in parallel.
   Builders: one, because it is one document.
2. **Core model and interfaces**: types, schemas, migrations (written, not run
   against real data), stubs with failing tests.
   Builders: one per module or route file, plus one migrations owner.
3. **Implementation**: handlers and services, tests go green.
   Builders: one per module or route file. Parallel with M2 for every part
   that needs only the M1 contracts; the parts that call M2's helpers are a
   follow-up for the same builder, waiting for the helper file.
4. **Hardening**: validation, auth, limits, error paths, observability.
   Builders: one per module, as in M3.
5. **Cleanup and docs**: remove dead paths, update API docs and changelog.
   Builders: code cleanup, and docs. The API docs need only the M1 contracts,
   so they can run parallel with M4; the changelog waits for M4.

**A frontend in the same job** is its own milestone, parallel with the
backend milestones once M1 fixed the contract. It builds against the typed
contract (or a mock), and a short follow-up wires it to the real API.

Worked example of what a serial plan misses: "M2 shared helpers" was two
parts in two route files, so two builders. "M3 tools + chat contract" was
blocked on M2, but only 5 of its 10 tools used M2's helpers; the chat route
and the other 5 tools start in parallel with M2. "M4 frontend" was blocked on
M3, but the contract was fixed in M1, so it runs in parallel with M2 and M3.

## File ownership

- Split by module: one builder per module or package (e.g. `users/`,
  `billing/`). Shared files such as the router, DI container or schema index
  get one named owner or minimal edits only (one registration line).
- Migrations have one owner per milestone. Never two agents writing migrations.

## How QA verifies

QA is two parts, both run by subagents that did not write the code. Before
that, a **QA prep** agent runs while the builders build: from the base branch
only, it lists the original behaviour the change touches (status codes,
error bodies, locks and transactions, side effects, auth), so QA checks for
regressions against that list, not against what the builders say.
1. **The test suite**: full run, plus lint and type checks. Report counts and
   the names of failing tests only.
2. **A reviewer subagent that tries to break the change**: bad input, missing
   auth, concurrency, large payloads, partial failures, backward compatibility.
   It reports concrete failing cases, ranked.

## Dev hooks to add

- A single command that runs lint, types and tests (`make check` or similar).
- Seed data or fixtures for local runs.
- A way to run one test file fast.

## Ask first (always)

- Running migrations anywhere but a throwaway local database.
- Anything that deletes or rewrites data.
- Changing public API contracts or removing endpoints.
- New dependencies or new infrastructure (queues, caches, databases).
- Touching secrets, credentials or environment config.

## Gotchas

1. Tests that pass alone but fail together usually share state; check fixtures.
2. Migrations must be reversible or clearly marked as not.
3. Never point tests at a shared or production database.

## Budgets

- Test suite runtime target (write it in the state file).
- Latency target for key endpoints, if performance matters.
