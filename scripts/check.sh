#!/bin/sh
# Validate the plugin. POSIX sh. Needs one of: python3, node or jq (for JSON).
set -u
cd "$(dirname "$0")/.." || exit 1
fail=0
ok()  { printf 'ok   %s\n' "$1"; }
bad() { printf 'FAIL %s\n' "$1"; fail=1; }

# 1. JSON parses
parse_json() {
  if command -v python3 >/dev/null 2>&1; then python3 -m json.tool "$1" >/dev/null 2>&1
  elif command -v node >/dev/null 2>&1; then node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$1" 2>/dev/null
  elif command -v jq >/dev/null 2>&1; then jq empty "$1" >/dev/null 2>&1
  else echo "need python3, node or jq to check JSON"; return 1; fi
}
for f in .claude-plugin/plugin.json .claude-plugin/marketplace.json hooks/hooks.json; do
  if [ -f "$f" ] && parse_json "$f"; then ok "$f parses"; else bad "$f missing or invalid JSON"; fi
done

# 2. CORE.md is 50 lines or fewer
lines=$(wc -l < core/CORE.md | tr -d ' ')
if [ "$lines" -le 50 ]; then ok "core/CORE.md is $lines lines (max 50)"; else bad "core/CORE.md is $lines lines (max 50)"; fi

# 3. Every preset in the SKILL.md index exists
skill=skills/milestone-crew
presets=$(grep -o 'presets/[A-Za-z0-9_-]*\.md' "$skill/SKILL.md" | grep -v '_TEMPLATE' | sort -u)
[ -n "$presets" ] || bad "no presets found in $skill/SKILL.md index"
for p in $presets; do
  if [ -f "$skill/$p" ]; then ok "$p exists"; else bad "$p listed in index but missing"; fi
done
for f in "$skill"/presets/*.md; do
  name="presets/$(basename "$f")"
  case "$name" in *_TEMPLATE.md) continue ;; esac
  echo "$presets" | grep -qx "$name" || bad "$name exists but is not in the SKILL.md index"
done
for r in references/briefs.md references/state-file.md presets/_TEMPLATE.md; do
  [ -f "$skill/$r" ] && ok "$r exists" || bad "$r missing"
done

# 4. Hook script runs and prints CORE.md
out=$(CLAUDE_PLUGIN_ROOT="$(pwd)" sh hooks/session-start.sh); rc=$?
if [ "$rc" -eq 0 ] && [ "$out" = "$(cat core/CORE.md)" ]; then ok "hook prints core/CORE.md"; else bad "hook failed (exit $rc) or output differs"; fi
out=$(env -u CLAUDE_PLUGIN_ROOT sh hooks/session-start.sh)
[ "$out" = "$(cat core/CORE.md)" ] && ok "hook works without CLAUDE_PLUGIN_ROOT" || bad "hook fallback path broken"

[ "$fail" -eq 0 ] && echo "All checks passed." || echo "Some checks failed."
exit "$fail"
