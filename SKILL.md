---
name: urun-aciklama-uretici
description: "IdeaSoft mağazaları için SEO/GEO uyumlu, schema'lı ürün ve kategori açıklaması üretir. Anahtar kelime haritasından besler, gerçek ürün verisine bağlar, kalite kapısından geçirir, JSON-LD şema üretir. seo-expert skill'inin ürün açıklamasına uyarlanmış halidir."
---

# Ürün/Kategori Açıklama Üretici

`seo-expert` skill'inin metodolojisini (araştırma → kalite kapısı → schema'lı HTML)
**blog yazısı yerine ürün ve kategori açıklamasına** uyarlar.

## Temel fark (seo-expert'ten)

| seo-expert | Bu skill |
|------------|----------|
| Tek konu, uzun makale | Çok sayıda kısa ürün açıklaması (toplu) |
| Konudan araştırır | Anahtar kelime haritasından + gerçek ürün verisinden besler |
| Article + FAQ schema | **Product** + FAQPage schema |
| Tek seferlik HTML | IdeaSoft API'ye toplu geri yazılır |

## Girdi

Her ürün için: ad, marka, kategori, varsa özellikler/stok kodu, hedef anahtar kelimeler
(keyword haritasından gelir). Kategori için: kategori adı + o kategorinin kelime kümesi.

## Üretim adımları

### 1. Bağla (grounding) — ZORUNLU
Açıklamayı **yalnızca verilen gerçek ürün verisinden** üret. Üründe olmayan özellik,
malzeme veya karakter ekleme. (Örn. "Hello Kitty" ürününe "Kuromi" yazma — bu gerçek bir
hatadır ve kalite kapısı bunu yakalamak zorundadır.)

### 2. Yapı (HTML iskeleti)
Her ürün açıklaması şu yapıda olmalı:
- `<h2>` ürün başlığı (marka tekrarı yapma)
- 1-3 paragraf doğal dil tanıtım (anahtar kelimeyi **doğal** yerleştir, istifleme)
- `<table>` özellik tablosu (marka/model, malzeme, içerik, kullanım alanı vb.)
- `<details>` "Detaylı İnceleme" (opsiyonel, kategoriye göre)
- `<h3>` Sıkça Sorulan Sorular — 2-4 gerçek alıcı sorusu

### 3. Keyword kaskadı
Kategori açıklamasında belirlenen kelime ailesi, o kategorideki ürün açıklamalarında da
tutarlı geçmeli. Kategori → ürün tutarlılığı kalite kapısında denetlenir.

### 4. Schema (JSON-LD)
- **Product** schema her üründe (rich result için geçerli, IdeaSoft teması basmıyorsa enjekte et).
- **FAQPage** schema SSS bloğu için.
  > Not: Google FAQ *rich result*'ı Mayıs 2026'da kaldırdı. Schema yine de tutulur çünkü
  > ChatGPT/Gemini/Perplexity gibi AI motorları içeriği ayrıştırırken kullanır (GEO değeri).
  > Müşteriye "FAQ rich result çıkar" sözü verilmez.
- Üretilen JSON-LD kod içinde **doğrulanmalı** (geçersizse kalite kapısı reddeder).

## Kalite kapısı (insan onayından ÖNCE — geçemezse retry)

seo-expert'teki 18 maddelik mantığa benzer; ürün açıklamasına uyarlanmış kontrol listesi:

**Doğruluk (en kritik — fail = otomatik retry):**
- [ ] Açıklama doğru ürünü/karakteri/markayı anlatıyor (Kuromi tipi hata yok).
- [ ] Üründe olmayan hiçbir özellik/iddia eklenmemiş.

**Teknik:**
- [ ] HTML geçerli; bozuk inline-style yok (örn. `padding: 109px` gibi yazım hatası).
- [ ] Product + FAQPage JSON-LD geçerli (doğrulayıcıdan geçti).
- [ ] Meta description dolu, 150-160 karakter, anahtar kelimeli.

**SEO/GEO:**
- [ ] Birincil anahtar kelime başlıkta ve ilk paragrafta, **doğal** (istif yok).
- [ ] Kategori-ürün kelime tutarlılığı sağlanmış.
- [ ] SSS gerçek alıcı sorularını yanıtlıyor (AI'nın kaynak göstereceği netlikte).

**Okunabilirlik:**
- [ ] Tek paragraf değil; yapısal (başlık + tablo + SSS).
- [ ] Aşırı tekrar yok; cümleler akıcı.

Skor < eşik → en fazla 2 kez retry. Geçemezse "manuel inceleme gerekli" işaretiyle
onay ekranına düşür (sessizce yayınlama).

## Çıktı

- Render edilebilir HTML (önizleme ekranı için)
- Ayrı JSON-LD schema bloğu
- Meta description
- Kalite kapısı raporu (hangi kontroller geçti/kaldı)

→ Onay ekranına gider. Onaylanan, IdeaSoft API ile geri yazılır.
