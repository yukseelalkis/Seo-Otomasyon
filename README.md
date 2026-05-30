# SEO-Otomasyon

> IdeaSoft tabanlı e-ticaret mağazaları için **konu kümesi (topical authority) odaklı,
> GSEO + GEO uyumlu içerik motoru.** Bir tema seçersin; sistem anahtar kelimeleri çıkarır,
> kategori + blog + ürün içeriğini eşgüdümlü üretir, zamanla planlar, IdeaSoft'a yazar,
> schema/GEO açısından doğrular ve sonucu ölçer.

![durum](https://img.shields.io/badge/durum-erken%20a%C5%9Fama-orange)
![node](https://img.shields.io/badge/Node.js-18%2B-green)
![lang](https://img.shields.io/badge/TypeScript-strict-blue)
![odak](https://img.shields.io/badge/odak-GSEO%20%2B%20GEO-purple)

---

## Bu sadece bir "ürün açıklaması üreticisi" değil

Standart araçlar tek bir ürün için tek paragraf üretir. Bu proje bir **strateji motorudur**:
bir tema (örn. "online kırtasiye ürünleri") etrafında, o temanın anahtar kelimeleriyle
**birbirini güçlendiren çok sayıda içerik yüzeyi** üretir ve hepsini ölçülebilir kılar.

## GSEO + GEO nedir, neden ikisi birden?

- **GSEO (Google SEO)**: klasik arama — sıralama, tıklama, schema, sayfa yapısı.
- **GEO (Generative Engine Optimization)**: ChatGPT, Gemini, Perplexity gibi yapay zeka
  motorlarının cevap üretirken senin içeriğini **kaynak göstermesi**.

Google FAQ *rich result*'ları Mayıs 2026'da kaldırıldı; yapılandırılmış içeriğin değeri
artık görsel SERP kutusunda değil, **AI'ın içeriği ayrıştırıp alıntılamasında.** Bu yüzden
proje GEO-önceliklidir.

## Nasıl çalışır (adımlar)

```mermaid
flowchart TD
    A["1 · Tema / strateji seç<br/><small>örn. online kırtasiye</small>"] --> B["2 · Anahtar kelime araştırması<br/><small>GSC + araştırma → kümeler</small>"]
    B --> C["3 · Çok yüzeyli içerik<br/><small>kategori + blog + ürün (kaskad)</small>"]
    C --> D["4 · İçerik takvimi<br/><small>hangi içerik ne zaman</small>"]
    D --> E["5 · Kalite kontrol + onay<br/><small>render önizleme, tek tek</small>"]
    E --> F["6 · Yayınla<br/><small>IdeaSoft API, toplu</small>"]
    F --> G["7 · Doğrula & düzelt<br/><small>schema.org / GEO kontrolü</small>"]
    G --> H["8 · Takip<br/><small>sıralama + tıklama + AI</small>"]
    H -.->|↻ sonuçlar stratejiyi günceller| A

    classDef strateji fill:#7a2e43,stroke:#d4537e,color:#ffffff;
    classDef uretim fill:#3c3489,stroke:#7f77dd,color:#ffffff;
    classDef sen fill:#854f0b,stroke:#ef9f27,color:#ffffff;
    classDef ideasoft fill:#0c447c,stroke:#378add,color:#ffffff;
    classDef takip fill:#0f6e56,stroke:#1d9e75,color:#ffffff;

    class A,B strateji;
    class C,D uretim;
    class E sen;
    class F ideasoft;
    class G,H takip;
```

**Renk anlamları:** 🔴 Strateji · 🟣 Üretim · 🟠 Sen (onay) · 🔵 IdeaSoft · 🟢 Takip

## Neden farklı / neden savunulabilir?

- **Eşgüdüm**: tek tema → kategori + blog + ürün, hepsi aynı kelime mimarisinde.
- **Platforma yazar**: içeriği üretip bırakmaz; IdeaSoft API ile toplu günceller.
- **Doğrula-düzelt döngüsü**: schema okunuyor mu / AI alıntılıyor mu kontrol eder, düzeltir.
- **GEO-öncelikli + niş**: Türk e-ticaret / IdeaSoft ekosistemine özel.
- **Ölçülebilir**: "his" değil — GSC ve AI görünürlüğüyle kanıt.

## Mimari

```mermaid
flowchart LR
    IS["IdeaSoft API<br/><small>oku / yaz · bulk</small>"] <--> CORE
    GSC["Search Console<br/><small>keyword + performans</small>"] --> CORE
    CORE <--> PANEL["Panel<br/><small>önizleme + onay + takvim</small>"]
    CORE --> TRACK["Takip paneli<br/><small>sıra + tıklama + AI</small>"]

    subgraph CORE ["İçerik Motoru · Node.js"]
        direction TB
        K["Strateji & keyword haritası"]
        G2["Çok yüzeyli üretim<br/><small>Claude API + seo-expert</small>"]
        Q["Kalite kontrol"]
        S["Schema üretimi + doğrulama"]
        V["Doğrula & düzelt"]
    end

    classDef src fill:#0c447c,stroke:#378add,color:#ffffff;
    classDef meas fill:#0f6e56,stroke:#1d9e75,color:#ffffff;
    classDef human fill:#854f0b,stroke:#ef9f27,color:#ffffff;
    class IS src;
    class GSC,TRACK meas;
    class PANEL human;
```

## Teknoloji yığını

| Katman | Seçim |
|--------|-------|
| Backend | Node.js + TypeScript (strict) |
| AI üretim | Claude API (Messages) + `seo-expert` mantığı |
| Veri tabanı | SQLite → Postgres/Supabase (keyword merkezli) |
| Panel | Next.js + Recharts |
| Veri kaynağı | IdeaSoft API + Google Search Console API |
| Planlama | Basit içerik takvimi (cron seviyesinde; ağır kuyruk yok) |
| Toplu işlem | `p-limit` |

## Yol haritası

- [ ] **Faz 0 — Ölçüm zemini + teşhis**: GSC bağlantısı, treated/control gruplama, baz
      metrikler, schema.org doğrulama (SSS/Product okunuyor mu?).
- [ ] **Faz 1 — Ürün hattı MVP**: çek → üret → kalite kontrol → onay → IdeaSoft'a yaz.
- [ ] **Faz 2 — Strateji + çok yüzeyli içerik**: tema seç → keyword haritası → kategori +
      blog + ürün içeriği (kaskad) → schema enjeksiyonu → içerik takvimi.
- [ ] **Faz 3 — Takip + GEO + doğrula/düzelt**: sıralama/tıklama dashboard, AI'da kaynak
      gösterilme takibi, schema okunmuyorsa otomatik düzeltme döngüsü.

## Kurulum

> Proje erken aşamada. Adımlar geliştirme ilerledikçe güncellenecek.

```bash
git clone https://github.com/yukseelalkis/Seo-Otomasyon.git
cd Seo-Otomasyon
npm install
# .env: IdeaSoft API (client id/secret), Claude API key, GSC kimlik bilgileri
```

## Proje dokümanları

- [`CLAUDE.md`](./CLAUDE.md) — proje anayasası ve kuralları (AI asistanı için)
- [`SKILL.md`](./SKILL.md) — üretim mantığı ve kalite kapısı
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — mimari, veri modeli, karar kayıtları
- [`ISSUES.md`](./ISSUES.md) — açılacak iş kalemleri (örnek issue'lar)

## Durum

Aktif geliştirme — kişisel yatırım / build-in-public projesi. İlk doğrulama
[mavikalem.tr](https://www.mavikalem.tr) üzerinde yapılıyor.
