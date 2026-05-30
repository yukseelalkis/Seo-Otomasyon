#!/usr/bin/env bash
# apply.sh — seo-otomasyon-claude-scaffold'u hedef repo'ya uygular.
#
# Kullanim:
#   bash apply.sh                 # cwd hedef
#   bash apply.sh /yol/to/repo    # belirtilen yol hedef
#   bash apply.sh --dry-run       # sadece ne olacagini goster
#
# Ne yapar:
#   1. Hedef repo'yu dogrular (.git veya package.json olmali).
#   2. Mevcut catismayacak dosyalari .seo-otomasyon-backup-<tarih>/ altina yedekler.
#   3. Mevcut `claude/` (kucuk harf) klasorunu dagitir:
#      - ARCHITECTURE.md, ISSUES.md  -> docs/
#      - CLAUDE.md, SKILL.md         -> yedek (yenisi scaffold'da)
#   4. Scaffold dosyalarini yerlerine kopyalar.
#   5. .gitignore'a yeni satirlari append eder (uzerine yazmaz).
#   6. .sh dosyalarini executable yapar.
#   7. Ozet rapor.

set -euo pipefail

# -------- args --------
DRY_RUN=0
TARGET=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,21p' "$0"
      exit 0
      ;;
    *) TARGET="$arg" ;;
  esac
done

# Scaffold = scriptin oldugu klasor
SOURCE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
TARGET="${TARGET:-$PWD}"
TARGET="$(cd -- "$TARGET" &> /dev/null && pwd)"

# -------- helpers --------
TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$TARGET/.seo-otomasyon-backup-$TS"

say() { echo "  $*"; }
header() { echo ""; echo "==> $*"; }
do_or_say() {
  if [ "$DRY_RUN" -eq 1 ]; then
    say "[dry-run] $*"
  else
    eval "$@"
  fi
}

# -------- validate --------
header "Hedef repo dogrulanyor: $TARGET"
if [ ! -d "$TARGET/.git" ] && [ ! -f "$TARGET/package.json" ]; then
  echo "HATA: $TARGET bir repo gibi gorunmuyor (.git veya package.json bulunmuyor)."
  echo "       Hedef olarak repo kokunu ver: bash apply.sh /yol/to/seo-otomasyon"
  exit 1
fi
say "OK"

if [ "$DRY_RUN" -eq 1 ]; then
  header "DRY-RUN modu: hicbir dosya degistirilmeyecek"
fi

# -------- backup --------
header "Yedek klasoru olusturuluyor: .seo-otomasyon-backup-$TS/"
do_or_say "mkdir -p '$BACKUP_DIR'"

# Catismayacak mevcut dosyalari yedekle
for f in CLAUDE.md CLAUDE.local.md .mcp.json .gitignore; do
  if [ -e "$TARGET/$f" ]; then
    say "yedeklenecek: $f"
    do_or_say "cp -a '$TARGET/$f' '$BACKUP_DIR/$f'"
  fi
done

if [ -d "$TARGET/.claude" ]; then
  say "yedeklenecek: .claude/  (mevcut, uzerine yazilacak)"
  do_or_say "cp -a '$TARGET/.claude' '$BACKUP_DIR/.claude'"
fi

# Eski kucuk harf claude/ klasoru?
if [ -d "$TARGET/claude" ]; then
  say "yedeklenecek: claude/ (eski lowercase, dagitilacak)"
  do_or_say "cp -a '$TARGET/claude' '$BACKUP_DIR/claude'"
fi

# -------- eski claude/ klasorunu dagit --------
if [ -d "$TARGET/claude" ]; then
  header "Eski claude/ klasoru dagitiliyor"
  do_or_say "mkdir -p '$TARGET/docs'"

  for f in ARCHITECTURE.md ISSUES.md; do
    if [ -f "$TARGET/claude/$f" ]; then
      say "claude/$f  ->  docs/$f"
      do_or_say "mv '$TARGET/claude/$f' '$TARGET/docs/$f'"
    fi
  done

  # CLAUDE.md ve SKILL.md scaffold'da yenisi var; eskiyi at (zaten yedeklendi)
  if [ -f "$TARGET/claude/CLAUDE.md" ]; then
    say "claude/CLAUDE.md silinecek (yenisi scaffold'dan gelecek; yedek alindi)"
    do_or_say "rm -f '$TARGET/claude/CLAUDE.md'"
  fi
  if [ -f "$TARGET/claude/SKILL.md" ]; then
    say "claude/SKILL.md silinecek (yenisi .claude/skills/urun-aciklama-uretici/'de)"
    do_or_say "rm -f '$TARGET/claude/SKILL.md'"
  fi

  # Bos olan claude/ klasorunu sil
  if [ -d "$TARGET/claude" ] && [ -z "$(ls -A "$TARGET/claude" 2>/dev/null)" ]; then
    say "claude/ klasoru bos, siliniyor"
    do_or_say "rmdir '$TARGET/claude'"
  elif [ -d "$TARGET/claude" ]; then
    say "UYARI: claude/ klasorunde tanimadigim dosyalar var, klasoru elle gozden gecir."
  fi
fi

# -------- scaffold'u kopyala --------
header "Scaffold dosyalari yerlestiriliyor"

# Root: CLAUDE.md, CLAUDE.local.md, .mcp.json
for f in CLAUDE.md CLAUDE.local.md .mcp.json; do
  say "kopyala: $f"
  do_or_say "cp -a '$SOURCE_DIR/$f' '$TARGET/$f'"
done

# .claude/ klasoru
say "kopyala: .claude/ (tum alt klasorler)"
do_or_say "cp -a '$SOURCE_DIR/.claude' '$TARGET/.claude'"

# -------- .gitignore append --------
header ".gitignore guncellestiriliyor (append)"
if [ -f "$TARGET/.gitignore" ]; then
  # Daha onceden eklendi mi?
  if grep -q "Claude Code kisisel dosyalar" "$TARGET/.gitignore" 2>/dev/null; then
    say ".gitignore'da Claude Code bolumu zaten var, atlanyor"
  else
    say "append: $SOURCE_DIR/gitignore-additions.txt -> .gitignore"
    do_or_say "echo '' >> '$TARGET/.gitignore'"
    do_or_say "cat '$SOURCE_DIR/gitignore-additions.txt' >> '$TARGET/.gitignore'"
  fi
else
  say ".gitignore yok, scaffold'daki olusturuluyor"
  do_or_say "cp '$SOURCE_DIR/gitignore-additions.txt' '$TARGET/.gitignore'"
fi

# -------- chmod --------
header "Script'ler executable yapliyor"
do_or_say "chmod +x '$TARGET/.claude/statusline.sh'"
do_or_say "chmod +x '$TARGET/.claude/hooks/'*.sh"

# -------- ozet --------
header "Tamamlandi"
if [ "$DRY_RUN" -eq 1 ]; then
  echo ""
  echo "Bu DRY-RUN idi. Gercekten uygulamak icin: bash apply.sh"
  exit 0
fi

cat <<EOF

Yedek:    $BACKUP_DIR
Hedef:    $TARGET

Sonraki adimlar:
  1. cd $TARGET
  2. git status         # neler degistigini gor
  3. Claude Code'u yeniden baslat
  4. (Opsiyonel) jq yuklu mu? Yoksa: choco install jq / brew install jq / apt install jq
  5. /faz0-status komutunu dene (Claude Code icinde)
  6. git add . && git commit -m "chore(claude): .claude/ iskeletini kur"

Geri almak istersen:
  rm -rf $TARGET/.claude $TARGET/CLAUDE.md $TARGET/CLAUDE.local.md $TARGET/.mcp.json
  cp -a $BACKUP_DIR/* $TARGET/   # yedekleri geri yukle

EOF
