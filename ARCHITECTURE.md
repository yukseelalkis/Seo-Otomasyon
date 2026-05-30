# ARCHITECTURE.md — Mimari ve Karar Kayıtları

## 1. Sistemin akışı (7 adım)

```
1. Anahtar kelime haritası   (GSC verisi + ürün listesi → hangi kategori/ürün hangi kelimeyi hedefler)
        ↓
2. Kategori içeriği          (harita kelimeleriyle kategori açıklaması)
        ↓
3. Ürün içeriği              (aynı kelime ailesi + HTML + schema)
        ↓
4. Kalite kontrol            (doğruluk + teknik + SEO/GEO + okunabilirlik — bkz. SKILL.md)
        ↓
5. Önizle ve onayla          (render hâlinde, tek tek — insan onayı)
        ↓
6. Geri yaz                  (IdeaSoft API: kategori + ürün, toplu)
        ↓
7. Takip                     (sıralama + tıklama + AI görünürlük)
        ↓
   ↻ Takip sonuçları 1. adımı (kelime haritası) günceller — döngü sürekli işler
```

## 2. Bileşenler ve veri akışı

```
[IdeaSoft API] ←→ [Otomasyon Çekirdeği (Node.js)] ←→ [Onay paneli (sen)]
 (ürün+kategori,        ├─ Veri modeli (keyword merkezli)         (render önizleme,
  oku ve yaz)           ├─ Üretim motoru (Claude API + skill)      tek tek onay)
                        └─ Kalite kontrol
[Search Console] ───────→ (keyword + takip verisi)          [Takip paneli]
 (yalnızca içeri)                                            (sıra + tıklama + AI)
```

- **IdeaSoft API**: çift yönlü (ürünleri okur, onaylananları geri yazar). Bulk update destekli.
- **Search Console**: yalnızca veri kaynağı (keyword + performans).
- **seo-expert mantığı**: üretim motorunun içinde yaşar.

## 3. Veri modeli (keyword merkezli — taslak)

```
categories      (id, ideasoft_id, ad, slug, aciklama_html, schema_json, durum)
products        (id, ideasoft_id, category_id, ad, marka, stok_kodu,
                 ozellikler_json, aciklama_html, schema_json, meta_desc, durum)
keywords        (id, kelime, tip[primary|secondary|longtail], arama_hacmi)
category_keywords (category_id, keyword_id)   ← kategori-kelime eşleşmesi
product_keywords  (product_id, keyword_id)    ← kaskad: ürüne inen kelimeler
content_versions  (id, product_id|category_id, html, schema, qc_raporu,
                   durum[taslak|onaylandi|yayinda], olusturma_tarihi)
tracking          (id, product_id|category_id, keyword_id, tarih,
                   gosterim, tiklama, ort_pozisyon, ai_gorunurluk)
```

`durum` ve `content_versions` sayesinde: taslak → onay → yayın izlenir, eski/yeni
karşılaştırılabilir (öncesi/sonrası ölçüm).

## 4. Yol haritası (veri bağımlılığına göre)

| Faz | Ne çıkar | Kişisel marka anı |
|-----|----------|-------------------|
| **0 · Ölçüm zemini** (~1 hafta) | GSC bağlı, treated/control işaretli, baz metrikler | "FAQ rich result öldü, e-ticaret ne yapmalı?" + kendi vaka |
| **1 · Ürün hattı MVP** (~2-3 hafta) | Çek→üret→QC→onay→yaz; tek tek panel işine son | "1000 ürünü elle değil hatla güncelledim" |
| **2 · Keyword + kategori** (~2-3 hafta) | Kelime haritası + kategori içeriği + kaskad + schema | Kaskad mantığını anlatan teknik post |
| **3 · Takip + GEO** (sürekli) | Dashboard + AI'da kaynak gösterilme takibi; ROI | "Organik +%X, artık ChatGPT kaynak gösteriyor" |

> Süreler solo ve kabadır. Faz 0 atlanmaz — ölçüm zemini olmadan "işe yaradı mı" kanıtlanamaz.

## 5. Karar kayıtları (neden böyle?)

- **Neden SQLite (başta)?** Sıfır kurulum, tek dosya. Panel buluta çıkınca Postgres/Supabase.
- **Neden kuyruk yok?** Toplu üretim `p-limit` ile sıralı/sınırlı paralel olarak yeter.
  Redis/BullMQ erken karmaşıklıktır; solo projeyi yavaşlatır.
- **Neden insan onayı (Faz 1-2)?** Yanlış açıklamanın 1000 ürüne basılma riski. Önce güven, sonra otomatikleştir.
- **Neden Product schema'yı kendimiz enjekte edebilmeliyiz?** IdeaSoft teması yalnızca temel
  Product + BreadcrumbList basıyor; özellik tablosu ve SSS yapılandırılmış veriye yansımıyor.
- **Neden ölçüm = moat?** Açıklama üretmek meta (IdeaSoft'ta bedava var). "Yazdım + GSC'de
  tıklama arttı + AI kaynak gösteriyor" diyebilen sistem = rakibin yapmadığı tek şey.

## 6. Riskler (akılda tut)

1. **Schema teknik tavanı**: görsel HTML tablo/SSS ≠ geçerli JSON-LD. Enjeksiyon + doğrulama şart.
2. **IdeaSoft API gating**: API modülü her pakette yok; yalnızca ana admin yetki verir → müşteri onboarding sürtünmesi.
3. **Platform bağımlılığı**: tek platforma (IdeaSoft) yaslı. Konumlandırma "tamamlayıcı" olmalı, "rakip" değil.
