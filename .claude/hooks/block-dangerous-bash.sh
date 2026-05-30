#!/bin/bash
# .claude/hooks/block-dangerous-bash.sh
# PreToolUse hook — matcher="Bash"
# settings.json deny listesinin üstüne, regex bazlı esnek savunma hattı.
# Bloklarken Claude'a NEDEN söyler, kuralları öğrensin.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$CMD" ]; then
  exit 0
fi

# Desen → (regex, sebep) çiftleri
deny_with_reason() {
  local pattern="$1"
  local reason="$2"
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "$reason Pattern: \"$pattern\". Gerçekten gerekiyorsa terminalde elle çalıştır; AI üzerinden değil."
  }
}
EOF
  exit 2
}

# --- rm -rf ailesi ---
echo "$CMD" | grep -Eqi "rm[[:space:]]+-rf[[:space:]]+/" && \
  deny_with_reason "rm -rf /" "Root dizinden recursive silme yasaktır."
echo "$CMD" | grep -Eqi "rm[[:space:]]+-rf[[:space:]]+\." && \
  deny_with_reason "rm -rf ." "Mevcut dizini recursive silme yasaktır — proje silinebilir."
echo "$CMD" | grep -Eqi "rm[[:space:]]+-rf[[:space:]]+(\$HOME|~)" && \
  deny_with_reason "rm -rf \$HOME / ~" "Kullanıcı home dizinini silme yasaktır."

# --- SQL destruction ---
echo "$CMD" | grep -Eqi "DROP[[:space:]]+DATABASE" && \
  deny_with_reason "DROP DATABASE" "Veritabanı silme yasaktır. CLAUDE.md ve .claude/rules/db.md kuralı."
echo "$CMD" | grep -Eqi "DROP[[:space:]]+TABLE" && \
  deny_with_reason "DROP TABLE" "Tablo silme yasaktır — migration ile şema değiştir."
echo "$CMD" | grep -Eqi "DROP[[:space:]]+SCHEMA" && \
  deny_with_reason "DROP SCHEMA" "Şema silme yasaktır."
echo "$CMD" | grep -Eqi "TRUNCATE" && \
  deny_with_reason "TRUNCATE" "Tablo boşaltma yasaktır — veri kaybı geri alınamaz."
echo "$CMD" | grep -Eqi "DELETE[[:space:]]+FROM[[:space:]]+[a-zA-Z_]+[[:space:]]*(;|$)" && \
  deny_with_reason "DELETE FROM <tablo>" "WHERE'siz DELETE yasaktır — tüm satırları siler. Soft delete (is_deleted/deleted_at) kullan."

# --- Force push ailesi ---
echo "$CMD" | grep -Eqi "git[[:space:]]+push[[:space:]]+.*--force" && \
  deny_with_reason "git push --force" "Force push yasaktır — uzak geçmiş silinir, ekip çalışamaz."
echo "$CMD" | grep -Eqi "git[[:space:]]+push[[:space:]]+.*-f([[:space:]]|$)" && \
  deny_with_reason "git push -f" "Force push yasaktır — uzak geçmiş silinir."
echo "$CMD" | grep -Eqi "git[[:space:]]+reset[[:space:]]+--hard" && \
  deny_with_reason "git reset --hard" "Hard reset yasaktır — kaydedilmemiş çalışma kaybolur."

# --- Fork bomb ---
echo "$CMD" | grep -Eq ":\(\)\{[[:space:]]*:\|:&[[:space:]]*\};:" && \
  deny_with_reason ":(){:|:&};:" "Fork bomb tespit edildi — sistemi kilitler."

# --- curl/wget | sh|bash ---
echo "$CMD" | grep -Eqi "curl[[:space:]]+.+\|[[:space:]]*sh([[:space:]]|$)" && \
  deny_with_reason "curl ... | sh" "İnternetten gelen scripti doğrudan çalıştırma yasaktır — doğrulanmamış kod yürür."
echo "$CMD" | grep -Eqi "curl[[:space:]]+.+\|[[:space:]]*bash" && \
  deny_with_reason "curl ... | bash" "İnternetten gelen scripti doğrudan çalıştırma yasaktır."
echo "$CMD" | grep -Eqi "wget[[:space:]]+.+\|[[:space:]]*sh" && \
  deny_with_reason "wget ... | sh" "İnternetten gelen scripti doğrudan çalıştırma yasaktır."
echo "$CMD" | grep -Eqi "wget[[:space:]]+.+\|[[:space:]]*bash" && \
  deny_with_reason "wget ... | bash" "İnternetten gelen scripti doğrudan çalıştırma yasaktır."

exit 0
