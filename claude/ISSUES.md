# ISSUES.md — Açılacak İş Kalemleri (örnek issue'lar)

Bu dosya, GitHub'da açacağın issue'ların hazır taslağıdır. Her birini kopyalayıp
GitHub > Issues > New issue ile aç, ya da aşağıdaki `gh` CLI komutlarıyla toplu aç.

## Önerilen etiketler (önce bunları oluştur)

`faz-0` · `faz-1` · `faz-2` · `faz-3` · `setup` · `research` · `feature` ·
`ai` · `qc` · `seo` · `geo` · `frontend` · `infra` · `measurement` · `content`

---

## Faz 0 — Ölçüm zemini + teşhis

### Issue 1: Google Search Console bağlantısı ve baz metrik toplama
**Etiketler:** `faz-0` `setup` `measurement`
**Açıklama:** GSC API ile siteye bağlan, ürün URL'i bazında gösterim/tıklama/ortalama
pozisyon verisini çek ve baz (öncesi) metrikleri kaydet.
- [ ] GSC API kimlik doğrulaması (servis hesabı / OAuth)
- [ ] Sayfa bazlı performans verisini çekip DB'ye yazma
- [ ] Son 3 ayın baz metrik anlık görüntüsü alınmış

### Issue 2: schema.org doğrulama — ürünlerin SSS/Product schema'sı okunuyor mu?
**Etiketler:** `faz-0` `seo` `geo` `research`
**Açıklama:** Örnek ürün URL'lerini schema.org / Rich Results Test'ten geçir. Product ve
FAQPage işaretlemesi geçerli mi, SSS içeriği yapılandırılmış veriye yansıyor mu? Yansımıyorsa
bunu Faz 1/2'de açıklama güncellemesiyle çözeceğiz.
- [ ] 10 örnek ürün için schema doğrulama sonucu tablosu
- [ ] "Okunuyor / okunmuyor" durumu kategori bazında not edildi
- [ ] Eksik schema tipleri listelendi (örn. SSS yansımıyor)

### Issue 3: Treated / Control ürün gruplaması
**Etiketler:** `faz-0` `measurement`
**Açıklama:** Güncellenmiş ve güncellenmemiş ürünleri ayrıştır; "hepsi birden" yapıldıysa
fark-içinde-fark için dokunulmamış grup belirle.
- [ ] Ürünler treated/control olarak etiketlendi
- [ ] Site geneli organik trend baz alınacak şekilde kuruldu

---

## Faz 1 — Ürün hattı MVP

### Issue 4: IdeaSoft API istemcisi (oku/yaz + bulk)
**Etiketler:** `faz-1` `feature` `infra`
**Açıklama:** OAuth (client id/secret) ile bağlan; ürün/kategori oku, açıklama+meta yaz,
çoklu ürün güncelleme uç noktasını kullan. Rate limit'e `p-limit` ile uy.
- [ ] Kimlik doğrulama ve token yönetimi
- [ ] Ürün/kategori okuma
- [ ] Tekil + toplu güncelleme (açıklama, meta, schema alanı)
- [ ] Hata/yeniden deneme toleransı

### Issue 5: Üretim motoru — Claude API + seo-expert mantığı (ürün açıklaması)
**Etiketler:** `faz-1` `feature` `ai`
**Açıklama:** Gerçek ürün verisinden (grounding) yapısal açıklama üret: H2/H3 + tablo + SSS.
Toplu işler için hızlı model, zor kategoriler için güçlü model.
- [ ] Ürün verisini prompt'a bağlama (uydurma yok)
- [ ] HTML iskelet + JSON-LD üretimi
- [ ] Model kademelendirme (maliyet kontrolü)

### Issue 6: Kalite kapısı modülü
**Etiketler:** `faz-1` `feature` `qc`
**Açıklama:** Onaydan önce çalışan denetim. Geçemezse en fazla 2 retry, sonra "manuel
inceleme" işareti.
- [ ] Doğruluk: yanlış karakter/marka (Kuromi tipi) yakalanıyor
- [ ] Teknik: bozuk inline-style (109px tipi), geçersiz JSON-LD, boş meta
- [ ] SEO/GEO: kelime istifi, başlıkta anahtar kelime, kategori-ürün tutarlılığı
- [ ] Kalite raporu üretiliyor

### Issue 7: Önizleme + tek tek onay paneli (Next.js)
**Etiketler:** `faz-1` `feature` `frontend`
**Açıklama:** Üretilen içeriği **render hâlinde** (tablo/SSS görünür) göster, tek tek onayla,
onaylananı IdeaSoft'a yaz.
- [ ] Render önizleme görünümü
- [ ] Onayla / reddet / düzenle akışı
- [ ] Onaylananları toplu yazma tetikleyici

---

## Faz 2 — Strateji + çok yüzeyli içerik

### Issue 8: Anahtar kelime haritası (GSC + araştırma → kümeler)
**Etiketler:** `faz-2` `feature` `seo`
**Açıklama:** Bir tema gir (örn. "online kırtasiye"); GSC verisi + araştırmadan kelime
kümeleri çıkar, kategori ve ürünlere ata.
- [ ] Tema → kelime kümesi üretimi
- [ ] Kelimelerin kategori/ürüne eşlenmesi (kaskad temeli)

### Issue 9: Çok yüzeyli içerik üretimi (kategori + blog + ürün)
**Etiketler:** `faz-2` `feature` `content`
**Açıklama:** Seçilen tema altında kategori açıklaması, blog yazısı (seo-expert mantığı) ve
ürün açıklamalarını **aynı kelime ailesiyle** eşgüdümlü üret.
- [ ] Kategori içeriği üretimi
- [ ] Blog üretimi (seo-expert uyarlaması)
- [ ] Ürün açıklamalarına kelime kaskadı
- [ ] Yüzeyler arası tutarlılık kontrolü

### Issue 10: Schema enjeksiyonu + JSON-LD doğrulama
**Etiketler:** `faz-2` `feature` `seo` `geo`
**Açıklama:** Tema temasının basmadığı Product/FAQPage JSON-LD'yi üret, doğrula, içeriğe ekle.
- [ ] Product + FAQPage JSON-LD üretimi
- [ ] Geçerlilik doğrulaması (geçersizse kalite kapısı reddeder)

### Issue 11: İçerik takvimi / zaman planlaması
**Etiketler:** `faz-2` `feature`
**Açıklama:** Hangi içeriğin ne zaman üretilip yayınlanacağını planlayan basit takvim.
- [ ] İçerik takvimi veri modeli
- [ ] Zamanlanmış üretim/yayın (cron seviyesinde — ağır kuyruk yok)

---

## Faz 3 — Takip + GEO + doğrula/düzelt

### Issue 12: Takip paneli — GSC sıralama/tıklama dashboard
**Etiketler:** `faz-3` `feature` `measurement`
**Açıklama:** Güncellenen içeriklerin öncesi/sonrası performansını site baz trendine karşı göster.
- [ ] Ürün/kategori bazlı öncesi-sonrası grafik
- [ ] Site baz trendiyle fark-içinde-fark görünümü

### Issue 13: GEO görünürlük takibi (AI motorlarında kaynak gösterilme)
**Etiketler:** `faz-3` `feature` `geo`
**Açıklama:** Hedef sorgularda ChatGPT/Gemini/Perplexity senin ürün/markanı kaynak
gösteriyor mu? Tarih damgalı kaydet.
- [ ] Sorgu seti tanımı
- [ ] Periyodik kontrol + kayıt
- [ ] Görünürlük zaman serisi

### Issue 14: Doğrula & düzelt döngüsü
**Etiketler:** `faz-3` `feature` `seo` `geo`
**Açıklama:** schema.org'da SSS/Product okunmuyorsa ilgili açıklamayı işaretle ve güncelleme
hattına geri ver. (Faz 0'daki teşhisi otomatik hâle getirir.)
- [ ] Periyodik schema doğrulama
- [ ] "Okunmuyor" işaretli içerikleri yeniden üretim kuyruğuna alma

---

## Araştırma

### Issue 15: Pazar & rakip analizi — topic-cluster + GEO araçları
**Etiketler:** `research`
**Açıklama:** Surfer, MarketMuse, Frase gibi konu-küme araçları ve Profound/Otterly gibi GEO
takip araçlarını incele; bizim niş farkımızı (IdeaSoft entegrasyonu + TR + yazma döngüsü) netleştir.
- [ ] Rakip karşılaştırma tablosu
- [ ] Bizim ayrışma noktası tek paragrafta

---

## Toplu açmak için (opsiyonel — gh CLI)

```bash
# Önce etiketleri oluştur (örnek)
gh label create faz-0 --color FBCA04
gh label create geo   --color 6F42C1
# ... diğer etiketler

# Sonra bir issue aç (örnek)
gh issue create --title "GSC bağlantısı ve baz metrik toplama" \
  --body "GSC API ile ürün URL bazında performans verisini çek..." \
  --label faz-0,setup,measurement
```
