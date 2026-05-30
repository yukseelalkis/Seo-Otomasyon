#!/bin/bash
# .claude/hooks/format-on-save.sh
# PostToolUse hook — Edit|Write tetiklenince çalışır.
# TS/JS/JSON/MD/CSS dosyalarını prettier ile formatlar.
# prettier yoksa sessizce no-op (Claude'un akışını bozmaz).

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filename // empty' 2>/dev/null)

if [ -z "$FILE" ]; then
  exit 0
fi

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.md|*.mdx|*.css|*.scss|*.yml|*.yaml)
    if command -v npx >/dev/null 2>&1; then
      npx --no-install prettier --write "$FILE" 2>/dev/null || true
    fi
    ;;
esac

exit 0
