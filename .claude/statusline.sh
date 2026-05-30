#!/bin/bash
# .claude/statusline.sh
# Claude Code alt bar — sadece aktif modeli gösterir, mor + bold.

input=$(cat)

# Modeli olası birkaç alandan dene (Claude Code sürümleri arasında değişebilir)
model=$(echo "$input" | jq -r '.model.display_name // .model.id // .model // empty' 2>/dev/null)
model=${model:-unknown}

# ANSI renk kodları
PURPLE='\033[38;5;141m'   # canlı mor
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

printf "${DIM}model:${RESET} ${BOLD}${PURPLE}%s${RESET}" "$model"
