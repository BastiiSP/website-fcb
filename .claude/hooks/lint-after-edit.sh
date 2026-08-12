#!/usr/bin/env bash
# PostToolUse-Hook: lintet nach Edits an *.ts/*.tsx-Dateien.
# Grund: Es gibt aktuell keine CI-Lint-Prüfung für dieses Projekt (kein Lint-Step in
# .github/workflows) – ohne diesen Hook fallen Lint-Fehler erst beim manuellen
# `npm run lint` oder gar erst im Vercel-Build auf.
set -uo pipefail

input="$(cat)"
file_path="$(echo "$input" | jq -r '.tool_input.file_path // empty')"

case "$file_path" in
  *.ts | *.tsx)
    ;;
  *)
    exit 0
    ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

lint_output="$(npm run lint 2>&1)"
lint_status=$?

if [ "$lint_status" -ne 0 ]; then
  # Exit 2 zeigt stderr Claude direkt an, damit der Lint-Fehler noch in derselben
  # Session behoben werden kann statt erst beim nächsten `npm run lint` aufzufallen.
  echo "$lint_output" >&2
  exit 2
fi

exit 0
