# CLAUDE.md — Proje Anayasası

> Projede çalışan her AI asistanı (Claude Code, Cursor) ve geliştirici bu kurallara uyar.
> Kod yazmadan önce **her zaman** burayı oku. 200 satırı geçmemeli — operasyonel
> detaylar `.claude/` altında.

## 1. Projenin tek cümlelik tanımı

IdeaSoft tabanlı e-ticaret mağazaları için **konu kümesi (topical authority) odaklı,
GSEO + GEO uyumlu içerik motoru**. Bir tema seçilir → anahtar kelimeler çıkarılır →
kategori + blog + ürün içeriği eşgüdümlü üretilir → IdeaSoft API ile yazılır →
schema/GEO doğrulanır → sonuç ölçülür.

**Bu bir blog/makale aracı DEĞİL** — e-ticaret motoru. Blog üretimi tek alt yetenek
(`seo-expert` skill), ana amaç ürün/kategori SEO+GEO görünürlüğü.

## 2. Hedef ve felsefe

- **Hedef:** Kişisel yatırım / kişisel marka projesi. İlk doğrulama: **mavikalem.tr**.
- Her geliştirme adımı aynı zamanda bir **"build-in-public"** anı.

## 3. Teknoloji yığını

| Katman | Seçim |
|--------|-------|
| Backend | Node.js + **TypeScript (strict)** |
| AI üretim | Claude API (Messages) + `seo-expert` mantığı |
| DB | SQLite → Postgres/Supabase (buluta çıkınca) |
| Panel | Next.js + React + Recharts |
| Paralel iş | `p-limit` (Redis/BullMQ YOK) |
| Veri kaynağı | IdeaSoft API + Google Search Console API |

> Web-only proje. Flutter/Dart/mobile YOK.

## 4. Mutlak kurallar (YAP)

- Üretilen her içerik **gerçek veriye bağlı (grounding)** olmalı. Model uydurmaz.
- Her çıktı **kalite kapısından** (`urun-aciklama-incelemecisi` agent) geçer.
- IdeaSoft'a yazmadan önce **insan onayı** (Faz 1-2). Tam otomatik yalnızca güvenilen kategorilerde.
- **FAQPage schema (JSON-LD)** her üründe; kod içinde doğrulanır.
- Dış API çağrıları **`p-limit`** ile sınırlı ve **retry + Retry-After** disiplinli.
- **TypeScript `strict: true`**, `any` yasak (gerekçe yazılmadıysa).
- Dil, para birimi, örnekler **TR pazarına** göre.
- Başarı iddiası **ölçümle** (GSC + AI görünürlük) gelir, "his" değil.

## 5. Mutlak kurallar (YAPMA)

- **Veritabanını silme/sıfırlama komutu** (`DROP`, `TRUNCATE`, `DELETE FROM`, `supabase db reset`). `.claude/settings.json` deny + `block-dangerous-bash.sh` zaten engelliyor.
- `.env`, anahtar veya secret'ı **oku / log'la / commit'le**. `.env*` deny'de, `protect-env.sh` ek savunma.
- **Erken karmaşıklık ekleme** — kuyruk, mikroservis, Docker orchestration vb. ihtiyaç doğmadan.
- **Tek tek elle panel işine geri dönme** — her şey üretim hattı üzerinden.
- **"FAQ rich result çıkar"** vaadi verme. Google Mayıs 2026'da bu özelliği kaldırdı. FAQ schema GEO/AI için tutulur, rich result için değil.
- **Keyword stuffing** yapma — birincil kelime metinde > 7 kez görünmez. Doğal dil önce.
- **Üründe olmayan iddia / karakter / özellik** ekleme. (Hello Kitty üründe "Kuromi" yazma — gerçek bir hata.)
- Ölçüm zemini (GSC + kontrol grubu) kurulmadan **"işe yaradı"** iddiası kurma.

## 6. Klasör yapısı (mevcut + hedef)

`×` işaretli olanlar Faz 1/2'de oluşacak:

```
seo-otomasyon/
├── src/
│   ├── ideasoft/      × Faz 1 — IdeaSoft API istemcisi
│   ├── gsc/           × Faz 0 — Search Console istemcisi
│   ├── generate/      × Faz 1 — Üretim motoru
│   ├── qc/            × Faz 1 — Kalite kontrol
│   ├── schema/        × Faz 2 — JSON-LD üretimi
│   ├── db/            × Faz 0/1 — Veri modeli
│   └── pipeline/      × Faz 1 — Orkestrasyon
├── app/               × Faz 1 — Next.js paneli
├── data/
│   ├── input/         × CSV/JSON girdiler
│   ├── output/        × Üretilen HTML/meta/schema
│   └── reports/       × Kalite + takip raporları
├── docs/              ✓ ARCHITECTURE.md, ISSUES.md, runbook'lar
├── scripts/           ✓ Mevcut
├── .cursor/           ✓ Cursor planları (paralel kullanılabilir)
├── .claude/           ✓ AI asistan kuralları
├── CLAUDE.md          ✓ Anayasa (bu dosya)
├── CLAUDE.local.md    ✓ Kişisel, gitignored
├── README.md          ✓
├── .gitignore         ✓
├── .mcp.json          ✓
└── package.json       ✓
```

## 7. Bitti ne demek?

Bir iş ancak şu kontrol noktalarını geçince **biter**:

**İçerik tarafında (üretilen açıklama / blog / kategori):**
1. `urun-aciklama-incelemecisi` agent'ından **PASS** gelir.
2. Önizleme ekranında **render hâlinde doğru** görünür (tablo + SSS + schema sırasız değil).
3. **Gerçek mağazada test:** mavikalem.tr'de en az 5 üründe denenmiş, kırılma yok.

**Kod tarafında:**
4. `tsc --noEmit` temiz, ESLint hatasız.
5. `code-reviewer` agent'tan "Temiz" raporu.
6. İlgili ISSUES.md issue'su kapatılmış.

## 8. `.claude/` rehberi

- **`settings.json`** — izinler, hooks, output style, statusline
- **`skills/`** — model-invokable yetenekler
  - `seo-expert/` — blog/makale üretimi (mevcut skill kopyası)
  - `urun-aciklama-uretici/` — ürün/kategori/marka açıklaması (projeye özel)
- **`agents/`** — alt-ajanlar (yalıtık context)
  - `code-reviewer` — mentor, 5 açıdan inceleme
  - `security-auditor` — pragmatic güvenlik
  - `debugger` — Sherlock metodolojisi
  - `urun-aciklama-incelemecisi` — kalite kapısı
- **`commands/`** — slash komutlar
  - `/commit` · `/faz0-status` · `/review-product`
- **`hooks/`** — otomatik tetikleyiciler
  - `format-on-save.sh` · `block-dangerous-bash.sh` · `protect-env.sh`
- **`rules/`** — glob kapsamlı kurallar
  - `api.md` (token + p-limit + retry) · `db.md` (yıkıcı yasak + soft delete)
- **`output-styles/terse.md`** — kısa Türkçe teknik stil
- **`statusline.sh`** — model gösterimi
- **`plugins/`** — şimdilik boş, gerekçe `plugins/README.md`'de