# milestone-crew

A Claude Code plugin for big, multi-part jobs. It turns your main session into
a lean **lead** that runs a small crew:

- **Builders** work in parallel, each owning its own files.
- An independent, **harsh QA** agent judges every milestone.
- Fixes go back to the builder that owns the files, then QA runs **once** more.
- It **stops after every milestone** and waits for your OK.

Small tasks are just done directly. Crew mode only kicks in when the work is
big enough to need it.

## Install

```
/plugin marketplace add ShadyKarayanni/milestone-crew
/plugin install milestone-crew@milestone-crew
```

Start a new session. That's it: the core rules are loaded automatically.

## How it works

```
 session start
      |
      v
 [hook] prints core/CORE.md  --->  short rules always in context (<= 50 lines)
      |
 big task? ---- no ---> just do it
      | yes
      v
 lead loads skill: SKILL.md + one matching preset
      |
      v
 +-------------------- per milestone ---------------------+
 |  plan in PLAN.md                                       |
 |     |                                                  |
 |     +--> builder A (owns files a*)  \                  |
 |     +--> builder B (owns files b*)   } in parallel     |
 |     +--> builder C (owns files c*)  /                  |
 |                    |                                   |
 |                    v                                   |
 |             independent QA  --FAIL--> fixes routed     |
 |                    |                   to owners       |
 |                    |                       |           |
 |                    |<------ re-QA once ----+           |
 |                    v                                   |
 |        commit + plain report  -->  STOP, wait for OK   |
 +--------------------------------------------------------+
```

The short core stays in every session so the main agent always knows the key
rules, without bloating the context. The long playbook, brief templates and
presets are only read when crew mode actually starts.

## File map

```
.claude-plugin/
  plugin.json            plugin manifest
  marketplace.json       lets this repo act as its own marketplace
hooks/
  hooks.json             SessionStart hook config
  session-start.sh       prints core/CORE.md (POSIX sh, no dependencies)
core/
  CORE.md                the injected core rules (keep <= 50 lines)
skills/milestone-crew/
  SKILL.md               full playbook + preset index
  references/
    briefs.md            builder, QA, fix-round and relaunch templates
    state-file.md        PLAN.md template
  presets/
    web-design.md        websites and redesigns
    3d-webgl.md          three.js / React Three Fiber scenes
    backend-api.md       APIs and services
    _TEMPLATE.md         starting point for a new preset
scripts/check.sh         validates the plugin (run before every commit)
.github/workflows/       runs check.sh on push and PR
```

## Add a preset in 3 steps

1. Copy `skills/milestone-crew/presets/_TEMPLATE.md` to
   `skills/milestone-crew/presets/<your-name>.md` and fill it in.
2. Add one row to the **Preset index** table in
   `skills/milestone-crew/SKILL.md` pointing at `presets/<your-name>.md`.
3. Run `sh scripts/check.sh`. It fails if the index and the files disagree.

## Edit the core

`core/CORE.md` is injected into every session, so every line costs context.

- Keep it at **50 lines or fewer** (`scripts/check.sh` enforces this).
- Only rules the main agent needs *before* it decides to load the skill belong
  here. Everything else goes in `SKILL.md`, `references/` or a preset.
- After editing, run `sh scripts/check.sh` and start a fresh session to see it.

## License

MIT, see [LICENSE](LICENSE).
