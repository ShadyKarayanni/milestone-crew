#!/bin/sh
# SessionStart hook: print the core ruleset. Plain stdout becomes session context.
# POSIX sh, no dependencies. Never fails the session.
root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cat "$root/core/CORE.md" 2>/dev/null
exit 0
