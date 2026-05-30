# seo-otomasyon-claude-scaffold

Bu zip, `seo-otomasyon` repon için tam `.claude/` ekosistemini içerir.
Tüm dosyalar sohbette tek tek konuşularak şekillendirildi.

## Hızlı kullanım

```bash
# 1. Zip'i bir klasöre aç (repo'ya değil!)
unzip seo-otomasyon-claude-scaffold.zip
cd seo-otomasyon-claude-scaffold

# 2. Önce dry-run ile ne yapacağını gör (önerilen)
bash apply.sh --dry-run /yol/to/seo-otomasyon

# 3. Gerçek uygula
bash apply.sh /yol/to/seo-otomasyon
```

`apply.sh` argümansız çalıştırılırsa **bulunduğu dizini** hedef sayar — bu durumda
zip'i repo köküne aç ve oradan çalıştır.

## Apply.sh ne yapar?

1. Hedef gerçekten bir repo mu kontrol eder (`.git` veya `package.json` arar).
2. Çakışacak dosyaları **`.seo-otomasyon-backup-<tarih>/`** altına yedekler.
3. Mevcut **eski `claude/`** (küçük harf) klasörünü dağıtır:
   - `ARCHITECTURE.md`, `ISSUES.md` → `docs/`
   - `CLAUDE.md`, `SKILL.md` → yedek (yenileri scaffold'dan gelir)
   - `claude/` klasörü boşalınca silinir
4. Scaffold dosyalarını yerlerine kopyalar.
5. `.gitignore`'a yeni satırları **append** eder (üzerine yazmaz, daha önce eklendiyse atlar).
6. `.sh` dosyalarını executable yapar.
7. Özet rapor verir + geri alma talimatı.

## İçerik (25 dosya)

```
.
├── apply.sh
├── README.md
├── gitignore-additions.txt          # .gitignore'a eklenecek satırlar
├── CLAUDE.md                        # proje anayasası
├── CLAUDE.local.md                  # kişisel override (gitignored)
├── .mcp.json                        # MCP sunucu config
└── .claude/
    ├── settings.json                # izinler, hooks, output style, statusline
    ├── statusline.sh                # alt bar: model adı (ANSI renkli)
    ├── skills/
    │   ├── seo-expert/              # blog/makale (mevcut skill kopyası)
    │   │   ├── SKILL.md
    │   │   └── scripts/             # quality-gate, format-html, generate-image
    │   └── urun-aciklama-uretici/
    │       └── SKILL.md             # ürün/kategori/marka açıklaması skill'i
    ├── agents/                      # alt-ajanlar (yalıtık context)
    │   ├── code-reviewer.md         # mentor, 5 açıdan inceleme
    │   ├── security-auditor.md      # pragmatic güvenlik
    │   ├── debugger.md              # Sherlock metodolojisi
    │   └── urun-aciklama-incelemecisi.md   # kalite kapısı denetçisi
    ├── commands/                    # slash komutlar
    │   ├── commit.md                # /commit (TR Conventional Commits)
    │   ├── faz0-status.md           # /faz0-status (ön koşul kontrolü)
    │   └── review-product.md        # /review-product (kalite kontrol)
    ├── hooks/                       # otomatik tetikleyiciler
    │   ├── format-on-save.sh        # prettier (PostToolUse)
    │   ├── block-dangerous-bash.sh  # rm -rf, DROP, force-push blokla
    │   └── protect-env.sh           # .env, secrets, credentials koru
    ├── rules/                       # glob kapsamlı kurallar
    │   ├── api.md                   # token, p-limit, retry, schema doğrulama
    │   └── db.md                    # yıkıcı yasak, soft delete, prepared stmt
    ├── output-styles/
    │   └── terse.md                 # kısa TR teknik stil
    └── plugins/
        └── README.md                # boş, gerekçe içeride
```

## Sonraki adımlar

Uygulamadan sonra:

1. `cd /yol/to/seo-otomasyon`
2. `git status` — neler değişti gör.
3. **jq** yüklü mü kontrol et (hook'lar için şart):
   - Windows: `choco install jq` veya https://jqlang.org/download
   - macOS: `brew install jq`
   - Linux: `apt install jq`
4. Claude Code'u yeniden başlat (settings.json'u okusun).
5. `/faz0-status` slash komutunu dene — ölçüm zeminin nerede gör.
6. `git add . && git commit -m "chore(claude): .claude/ iskeletini kur"`

## Geri alma

`apply.sh` her şeyi `.seo-otomasyon-backup-<tarih>/` altına yedekler. Geri almak için:

```bash
rm -rf .claude CLAUDE.md CLAUDE.local.md .mcp.json
cp -a .seo-otomasyon-backup-<tarih>/* .
```

## Bilinen detaylar

- **`CLAUDE.local.md`** ve **`.claude/settings.local.json`** `.gitignore`'da — commit'e
  girmemeli. `git status`'ta görünmedikleri doğrula.
- **`seo-expert`** skill scripti `${CLAUDE_PROJECT_DIR}/.claude/skills/seo-expert/scripts/...`
  yoluna refere ediyor. Repo kökünde çalıştığın sürece düzgün resolve olur.
- **`.mcp.json`** boş — ihtiyaç doğunca `_examples`'tan kopyala.
- **`CLAUDE.local.md`** içinde örnek değerler var (mavikalem.tr, branch konvansiyonu);
  kendi tercihlerine göre düzenle.
