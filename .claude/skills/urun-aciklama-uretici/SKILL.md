---
name: urun-aciklama-uretici
description: "IdeaSoft tabanlı e-ticaret için SEO/GEO uyumlu, schema'lı ürün/kategori/marka açıklaması üretir. Gerçek ürün verisinden grounding zorunlu (uydurma yasak). Çıktı: Mopak şablonlu HTML + FAQPage JSON-LD + meta description. Tek ürün veya CSV ile toplu. seo-expert'in disiplinini (araştırma → kalite kapısı → temiz HTML) e-ticaret ürününe uyarlar."
---

# Ürün/Kategori/Marka Açıklama Üreticisi

`seo-expert` skill'inin metodolojisini (yapılandırılmış üretim + kalite kapısı +
schema'lı HTML) e-ticaret ürününe uyarlar.

**Blog değil.** Çıktı = ürün, kategori veya marka sayfası açıklaması.

## Üç içerik tipi

| Tip | Ne zaman | Uzunluk |
|-----|----------|---------|
| **Ürün** | Tek bir SKU/ürün açıklaması | 300-500 kelime |
| **Kategori** | Kategori sayfası ana metni | 250-400 kelime |
| **Marka/Sayfa** | Anahtar kelime girilince üretilen kısa marka veya statik sayfa metni | 150-300 kelime |

## Kullanım

```
/urun-aciklama-uretici --type product --input data/products/3083302.json
/urun-aciklama-uretici --type category --input data/categories/anaokul-cantasi.json
/urun-aciklama-uretici --type page --keyword "online kırtasiye" --brand "MaviKalem"

# Toplu
/urun-aciklama-uretici --type product --input data/bulk/products.csv --bulk
```

**Argümanlar:**
- `--type` (zorunlu): `product` · `category` · `page`
- `--input` (zorunlu): JSON dosyası (tek) veya CSV (bulk)
- `--bulk` (opsiyonel): toplu mod, her satır için tek tek üretir
- `--keyword` (opsiyonel): hedef anahtar kelimeyi override
- `--language` (opsiyonel): varsayılan `tr-TR`

## CSV girdi formatı (toplu)

Zorunlu kolonlar:

| Kolon | Açıklama | Örnek |
|-------|----------|-------|
| `id` | Ürün ID (IdeaSoft) | `3083302` |
| `ad` | Ürün adı | `Mopak 5701 Parmak Boyası Evalı 6'lı Set` |
| `marka` | Marka adı | `Mopak` |
| `kategori` | Kategori | `Anaokul / Boya` |
| `ozellikler_json` | Yapılandırılmış özellikler (JSON kaçışlı string) | `{"materyal":"su bazlı","standart":"EN71"}` |
| `hedef_kelimeler` | Birincil + ikincil anahtar kelimeler, virgülle | `parmak boyası, çocuk boya seti, eva sünger kalıp` |

İlk satır header. Eksik kolon → o satır skip, log'a yazılır.

---

## Pipeline

```
[1. Parse input]
    |
    v
[2. Grounding kontrolü]  ← uydurma yasak, sadece girdi verisi
    |
    v
[3. İçerik tipine göre yapıyı seç]
    |
    v
[4. Üret: HTML + FAQPage JSON-LD + meta]
    |
    v
[5. Kalite kapısı (urun-aciklama-incelemecisi subagent)] <----+
    |  PASS  → ileri                                          |
    |  RETRY → 2 deneme                                       |
    |  MANUEL → "manuel inceleme gerekli" işaretle ----+      |
    v                                                  |      |
[6. Çıktıya yaz]                                       |      |
    |                                                  |      |
    v                                                  |      |
[7. Toplu modsa sonraki satır] -----------------------------+
```

---

## Step 1 — Girdiyi ayrıştır

JSON girdisinde her ürün:
```json
{
  "id": "3083302",
  "ad": "Mopak 5701 Parmak Boyası Evalı 6'lı Set",
  "marka": "Mopak",
  "kategori": "Anaokul / Boya",
  "ozellikler": {
    "materyal": "su bazlı",
    "standart": "EN71",
    "icerik": "6 renk + Eva sünger kalıplar",
    "kullanim": "okul öncesi"
  },
  "hedef_kelimeler": ["parmak boyası", "çocuk boya seti", "eva sünger kalıp"]
}
```

CSV ise her satırı bu objeye dönüştür (`ozellikler_json` parse, `hedef_kelimeler` split).

## Step 2 — Grounding kontrolü (ZORUNLU)

**Tek kural: girdide olmayan hiçbir şey çıktıda olmayacak.**

Kontrol et:
- `ad`, `marka`, `kategori` boş mu? → eksikse satırı skip, "yetersiz veri" logla.
- `ozellikler` boş veya 2'den az alanı mı var? → "yetersiz özellik" uyarısı; üretebilirsin ama spec tablosu kısa olur.
- `hedef_kelimeler` boş mu? → "anahtar kelime yok" hatası, üretme.

**Asla yapma:**
- Karakter/figür ekleme (Hello Kitty üründe "Kuromi" yazma).
- Üründe olmayan malzeme/sertifika/iddia.
- Hedef kitle uydurma ("ev hanımları için ideal" gibi — veri yoksa yazma).

## Step 3 — İçerik tipine göre yapı

### Ürün (Mopak şablonu)

```html
<h2>{ad}</h2>

<p>{ad}, {birincil_kelime ile doğal cümle}. {Marka ve fonksiyonu anlatan ek cümle}.
{Hedef kitle veya kullanım bağlamı — sadece verilen kategoriden çıkarılabiliyorsa}.</p>

<p>{İkinci paragraf — ürünün ayırt edici 1-2 özelliği, ozellikler'den ground'lanmış}.</p>

<table style="width: 100%; border-collapse: collapse; ...">
  <tbody>
    <tr><th>Marka / Model</th><td>{marka} / {model_kodu_ad'tan_extract}</td>
        <th>Ürün Tipi</th><td>{kategori_son_seviye}</td></tr>
    <tr><th>Paket İçerik</th><td>{ozellikler.icerik}</td>
        <th>Sağlık/Standart</th><td>{ozellikler.standart || '—'}</td></tr>
    <tr><th>Uygulama Alanı</th><td colspan="3">{ozellikler.kullanim}</td></tr>
  </tbody>
</table>

<details>
  <summary>Detaylı İnceleme ve Kullanım İpuçları</summary>
  <p><strong>{Özellik 1}:</strong> {ozellikler'den ground'lanmış açıklama}.</p>
  <p><strong>{Özellik 2}:</strong> {ozellikler'den ground'lanmış açıklama}.</p>
  <p><strong>{Özellik 3}:</strong> {ozellikler'den ground'lanmış açıklama}.</p>
</details>

<h3>Sıkça Sorulan Sorular</h3>
<details>
  <summary>{Gerçek alıcı sorusu 1 — kategoriye özgü}</summary>
  <div>{Cevap — kısa, dürüst, ground'lanmış}</div>
</details>
<details>
  <summary>{Soru 2}</summary>
  <div>{Cevap}</div>
</details>
```

**SSS soru sayısı:** 2-4 arası. Klişe sorular yasak ("Bu ürün kaliteli mi?", "Hızlı kargo mu?"). Gerçek alıcı kaygıları: güvenlik standardı, yaş uygunluğu, temizlik, malzeme, kullanım süresi.

### Kategori

```html
<h2>{kategori_adı}</h2>

<p>{Kategori tanımı + birincil kelime}. {Kategorinin kim için, hangi ihtiyaca yönelik olduğu}.</p>

<h3>{Kategori}'nde Aranan Özellikler</h3>
<ul>
  <li>{Özellik 1 ve neden önemli}</li>
  <li>{Özellik 2}</li>
  <li>{Özellik 3}</li>
</ul>

<h3>Sıkça Sorulan Sorular</h3>
<!-- aynı SSS yapısı -->
```

### Marka/Sayfa (kısa)

```html
<h2>{başlık — anahtar kelimeyi içerir}</h2>
<p>{2-3 cümle tanıtım}.</p>
<p>{1 cümle CTA veya bağlam}.</p>
```

## Step 4 — Üret

- Birincil anahtar kelime `<h2>` ve **ilk paragrafta** doğal yer alır.
- İkincil kelimeler metin içine doğal serpiştirilir (kelime istifi YASAK — toplam tekrar > 7 ise düşür).
- Marka adı doğal sıklıkta (her cümlede değil).
- Cümle uzunluğu 8-22 kelime arasında değişsin (monotonluk yok).

### FAQPage JSON-LD

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{SSS sorusu 1}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{SSS cevabı 1 — HTML tag'siz, düz metin}"
      }
    },
    {
      "@type": "Question",
      "name": "{SSS sorusu 2}",
      "acceptedAnswer": { "@type": "Answer", "text": "{...}" }
    }
  ]
}
```

> **Not:** Sadece FAQPage üretiyoruz. IdeaSoft teması Product + BreadcrumbList schema'sını zaten basıyor — çift yazmıyoruz. Google FAQ rich result'ı Mayıs 2026'da kalktı ama FAQPage JSON-LD AI motorlarının (ChatGPT, Gemini, Perplexity) içeriği ayrıştırması için hâlâ değerli.

### Meta description

- 150-160 karakter.
- Birincil anahtar kelime ilk 60 karakterde.
- Bir somut fayda + 1 ayırt edici özellik içersin.
- Tüm büyük harf, üst üste işaret, emoji yok.

## Step 5 — Kalite kapısı

Üretilen bütünü (HTML + JSON-LD + meta) `urun-aciklama-incelemecisi` subagent'ına gönder.

Subagent kararı:
- **PASS** → Step 6'ya geç.
- **RETRY** → düzeltme önerileriyle Step 4'e dön. En fazla 2 retry.
- **MANUEL** → "manuel inceleme gerekli" işaretle, output'a yaz ama panel'de işaretli olsun. Bulk'ta bir sonraki satıra geç.

## Step 6 — Çıktıya yaz

```
data/output/
  products/{id}.html        ← HTML + meta + JSON-LD birleşik
  products/{id}.meta.json   ← {title, description, keywords}
  categories/{slug}.html
  pages/{slug}.html
  reports/quality-gate.csv  ← her satır: id, karar, retry_sayisi, notlar
```

## Step 7 — Toplu mod

CSV'nin her satırı için Step 1-6'yı tekrarla.
- Rate limit: `p-limit(3)` ile sınırlı paralel (API rules'tan miras).
- Her satırın sonucu `reports/quality-gate.csv`'ye eklenir.
- 10 satırda bir özet log: `[10/250] 8 PASS, 1 RETRY, 1 MANUEL`.
- Tek satır crash etse bile devam: satırı atla, log'a yaz.

## Çıktı raporu (skill bittiğinde)

```
✅ Tamamlandı.
Tip: product
İşlenen: 250
PASS:    218 (87%)
RETRY:    24 (10%)
MANUEL:    8  (3%)

Dosyalar:
- data/output/products/*.html (250)
- data/output/reports/quality-gate.csv

Sonraki adım: MANUEL işaretli 8 ürünü panelden gözden geçir, sonra IdeaSoft'a yazma akışına gönder.
```

---

## Kritik kurallar (özet)

- **Grounding:** girdide olmayan iddia/özellik/karakter YOK. Yetersiz veri → satırı atla.
- **Schema:** sadece FAQPage. Product/BreadcrumbList yazma (tema zaten basıyor).
- **HTML:** Mopak şablonu — H2, paragraf, spec tablo, Detaylı İnceleme, SSS. Bozuk inline-style YOK.
- **Kelime istifi:** birincil anahtar kelime metinde 7 kezden fazla görünmez.
- **Kalite kapısı:** `urun-aciklama-incelemecisi` agent'ından PASS gelmeden onaylanmış sayma.
- **IdeaSoft'a yazma SKILL'in görevi DEĞİL.** Bu skill üretir; geri yazma `src/ideasoft/` modülünün işi.