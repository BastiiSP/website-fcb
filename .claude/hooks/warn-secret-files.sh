#!/usr/bin/env bash
# PreToolUse-Hook: warnt vor Edits an Dateien mit Secrets (.env.local, .mcp.json).
# Blockiert nicht hart (beide Dateien werden gelegentlich legitim geändert, z. B. neue
# Env-Var oder MCP-Server), fragt aber per "ask" nach, damit ein Secret nicht
# versehentlich sichtbar wird oder in einen Commit rutscht (beide stehen in .gitignore,
# dürfen also ohnehin nie ins Repo).
set -euo pipefail

input="$(cat)"
file_path="$(echo "$input" | jq -r '.tool_input.file_path // empty')"

case "$file_path" in
  */.env.local | .env.local | */.mcp.json | .mcp.json)
    reason="Diese Datei enthält Secrets (Supabase Keys/Service-Role-Key, MCP-Tokens). Änderung wirklich beabsichtigt? Niemals committen – beide Dateien stehen in .gitignore."
    jq -n --arg reason "$reason" \
      '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":$reason}}'
    ;;
  *)
    exit 0
    ;;
esac
