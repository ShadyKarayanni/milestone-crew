# Preset: backend-api

For APIs, services, data models and background jobs.

## Milestone plan

1. **Design doc** (no code): endpoints or interfaces, data model changes,
   error cases, migration plan, test plan. In the state file.
2. **Core model and interfaces**: types, schemas, migrations (written, not run
   against real data), stubs with failing tests.
3. **Implementation**: handlers and services, tests go green.
4. **Hardening**: validation, auth, limits, error paths, observability.
5. **Cleanup and docs**: remove dead paths, update API docs and changelog.

## File ownership

- Split by module: one builder per module or package (e.g. `users/`,
  `billing/`). Shared files such as the router, DI container or schema index
  get one named owner or minimal edits only (one registration line).
- Migrations have one owner per milestone. Never two agents writing migrations.

## How QA verifies

QA is two parts, both run by subagents that did not write the code:
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
