#!/bin/bash
# .claude/hooks/protect-env.sh
# PreToolUse hook — matcher="Read|Edit|Write"
# Secret/credential dosyalarına AI erişimini engeller.
# .env.example serbest (şablon dosyası, anahtar içermez).

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [ -z "$FILE" ]; then
  exit 0
fi

# .env.example daima serbest — şablon dosyası
if echo "$FILE" | grep -Eqi "\.env\.example$"; then
  exit 0
fi

deny() {
  local matched="$1"
  local reason="$2"
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "$reason Korunan desen: $matched. Bu dosya AI'ya açık olmaz. Gereken değişken adlarını kullanıcıya sor, .env.example'a yaz, kullanıcı kendi .env'ine değerleri girsin."
  }
}
EOF
  exit 2
}

# --- .env ailesi ---
echo "$FILE" | grep -Eqi "(^|/)\.env$" && \
  deny ".env" "Çalışma ortamı sırları."
echo "$FILE" | grep -Eqi "(^|/)\.env\." && \
  deny ".env.*" "Çalışma ortamı sırları (production/staging vb.)."

# --- secrets klasörü ---
echo "$FILE" | grep -Eqi "(^|/)secrets(/|$)" && \
  deny "secrets/" "Secret klasörü."

# --- generic credentials ---
echo "$FILE" | grep -Eqi "credentials" && \
  deny "credentials" "Kimlik bilgisi dosyası."

# --- SSH anahtarları ---
echo "$FILE" | grep -Eqi "(^|/)\.ssh(/|$)" && \
  deny ".ssh/" "SSH dizini."
echo "$FILE" | grep -Eqi "id_rsa($|\.pub$)" && \
  deny "id_rsa" "SSH özel/kamu anahtarı."
echo "$FILE" | grep -Eqi "id_ed25519($|\.pub$)" && \
  deny "id_ed25519" "SSH özel/kamu anahtarı."

# --- AWS ---
echo "$FILE" | grep -Eqi "(^|/)\.aws/credentials" && \
  deny ".aws/credentials" "AWS kimlik bilgileri."
echo "$FILE" | grep -Eqi "(^|/)\.aws/config" && \
  deny ".aws/config" "AWS yapılandırması (token içerebilir)."

# --- Google service account ---
echo "$FILE" | grep -Eqi "service-account.*\.json$" && \
  deny "service-account*.json" "Google service account anahtarı."
echo "$FILE" | grep -Eqi "gcp-key.*\.json$" && \
  deny "gcp-key*.json" "Google Cloud anahtar dosyası."

# --- Diğer yaygın secret formatları ---
echo "$FILE" | grep -Eqi "\.pem$" && \
  deny "*.pem" "Sertifika / özel anahtar dosyası."
echo "$FILE" | grep -Eqi "\.p12$" && \
  deny "*.p12" "PKCS#12 sertifika konteyneri."

exit 0