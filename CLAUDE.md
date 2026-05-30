# CLAUDE.md — Proje Anayasası

> Bu dosya, projede çalışan her AI asistanının (Claude Code, Cursor) ve geliştiricinin
> uyması gereken kurallardır. Kod yazmadan önce **her zaman** burayı oku.

## 1. Projenin tek cümlelik tanımı

IdeaSoft tabanlı e-ticaret mağazaları için; anahtar kelime haritasından başlayıp
kategori ve ürün açıklamalarını **SEO/GEO uyumlu, schema'lı, ölçülebilir** şekilde
üreten ve IdeaSoft API ile geri yazan otomasyon.

**Bu bir blog/makale aracı değildir.** Çıktı = ürün ve kategori açıklamaları.

## 2. Hedef ve felsefe

- Hedef: kişisel yatırım / kişisel marka projesi. Önce **kendi mağazada** (mavikalem.tr) kanıtla.
- Her geliştirme adımı aynı zamanda bir "build-in-public" anı.
- **Erken karmaşıklık = ölüm.** Bir parçayı ancak gerçekten acı verince ekle.

## 3. Teknoloji yığını (sabit)

| Katman | Seçim | Neden |
|--------|-------|-------|
| Backend | Node.js + **TypeScript (strict)** | Hata derlemede yakalanır |
| AI üretim | Claude API (Messages) | Toplu işler için hızlı model, zor kategoriler için güçlü model |
| Veri tabanı | Başta **SQLite**, panel buluta çıkınca Postgres/Supabase | Sıfır kurulumla başla |
| Panel | **Next.js** (React) + Recharts | Tek çatı, Vercel'de bedava host |
| GSC | Google resmi Node istemcisi | Search Console API |
| Toplu işlem | `p-limit` ile sınırlı paralel | **Redis/BullMQ YOK** (ihtiyaç doğana dek) |

## 4. Mutlak kurallar (YAP)

- TypeScript `strict: true`. `any` kullanma.
- Üretilen her açıklama **gerçek ürün verisine bağlanmalı** (grounding). Model "uydurmamalı".
- Her çıktı kalite kapısından (bkz. `SKILL.md`) geçmeden onay ekranına gelmez.
- IdeaSoft'a yazmadan önce **insan onayı** zorunlu (Faz 1-2). Tam otomatik yalnızca
  güvenilen kategorilerde, sonradan açılır.
- Schema (JSON-LD) her ürüne basılır; geçerliliği kod içinde doğrulanır.
- Tüm dış API çağrıları rate-limit'e saygılı (`p-limit`) ve hata toleranslı olmalı.
- Para birimi, dil ve örnekler Türkçe/TR pazarına göre.

## 5. Mutlak kurallar (YAPMA)

- Tek tek elle panel işine geri dönme — her şey hat üzerinden.
- Kuyruk sistemi, mikroservis, Docker orchestration gibi şeyleri erken ekleme.
- "FAQ rich result çıkar" vaadi verme — bu özellik Google'da Mayıs 2026'da kaldırıldı.
  (FAQ schema yine de AI/GEO için tutulur; ayrıntı `SKILL.md`'de.)
- Anahtar kelimeyi istifleme (keyword stuffing). Doğal dil önce gelir.
- Ölçüm zemini (GSC + kontrol grubu) kurulmadan "işe yaradı" iddiası kurma.

## 6. Klasör yapısı (hedef)

```
/src
  /ideasoft      → IdeaSoft API istemcisi (oku/yaz, bulk)
  /gsc           → Search Console istemcisi (keyword + takip)
  /generate      → Üretim motoru (Claude API + seo-expert mantığı)
  /qc            → Kalite kontrol (kapı kuralları)
  /schema        → JSON-LD üretimi + doğrulama
  /db            → Veri modeli (keyword merkezli)
  /pipeline      → Orkestrasyon (çek→üret→QC→kuyruk)
/app             → Next.js paneli (önizleme + onay + takip)
/output          → Üretilen taslaklar (önizleme öncesi)
CLAUDE.md
SKILL.md
ARCHITECTURE.md
```

## 7. Tanım: "bitti" ne demek

Bir özellik ancak şu üçü sağlanınca biter:
1. Kalite kapısından geçiyor.
2. Önizleme ekranında render hâlinde doğru görünüyor.
3. Kendi mağazada en az 5 gerçek üründe denenmiş.
