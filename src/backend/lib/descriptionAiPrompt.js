/**
 * Dinamik sistem promptu: ürün Detay/Aciklama alanına göre iki varyant + mantık bariyerleri.
 */

const { normalizeSpace } = require("./textUtils");

/** Anlamlı teknik özet için minimum karakter (boşluklar hariç sayılmaz). */
const MIN_MEANINGFUL_DETAIL_LEN = 24;

/**
 * @param {string} text
 * @returns {boolean}
 */
function hasMeaningfulDetailText(text) {
  const t = normalizeSpace(String(text || "").replace(/\s+/g, " "));
  if (t.length < MIN_MEANINGFUL_DETAIL_LEN) return false;
  const letters = t.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
  if (letters.length < 8) return false;
  return true;
}

/** Tüm üretimlerde geçerli: sınav/sınıf tutarlılığı ve başlık önceliği. */
function buildCriticalLogicBlock() {
  return `DİKKAT ETMEN GEREKEN KESİN MANTIK KURALLARI (CRITICAL):
1. SINAV VE SINIF TUTARLILIĞI:
   - Eğer ürün adında veya kategorisinde 'TYT', 'AYT', 'YKS' geçiyorsa; bu kitap LİSE öğrencileri ve Üniversite adayları (9, 10, 11, 12. Sınıf ve Mezunlar) içindir. Metnin HİÇBİR YERİNDE 'LGS', '8. Sınıf' veya 'Ortaokul' kelimelerini KULLANAMAZSIN.
   - Eğer ürün adında veya kategorisinde 'LGS' geçiyorsa; bu kitap ORTAOKUL öğrencileri (8. Sınıf) içindir. Metnin HİÇBİR YERİNDE 'TYT', 'AYT', 'YKS' veya 'Lise' kelimelerini KULLANAMAZSIN.
   - Eğer ürün adında veya kategorisinde 'KPSS', 'ALES', 'DGS' geçiyorsa; hedef kitle yetişkinlerdir. Öğrenci veya okul sınıflarından bahsetme.
2. VERİ ÇATIŞMASI: Eğer sana verilen teknik detaylarda (Excel/veri alanlarında) ürün adı ile çelişen bir bilgi varsa (Örneğin ürün adı 'TYT Geometri' ama detaylarda 'LGS' yazıyorsa), HER ZAMAN ÜRÜN ADINI (Title) doğru kabul et ve çelişkili yanlış veriyi yoksay; o yanlış bilgiyi metne taşıma.`;
}

function buildSonucFormatiBlock() {
  return `SONUÇ FORMATI (içerik sırası — aşağıdaki kullanıcı mesajındaki HTML etiket kurallarına uyarak üret):
- Dikkat çekici bir giriş paragrafı.
- Ürünün öne çıkan özellikleri (madde işaretli liste).
- Hedef kitle ve faydaları (kime hitap ediyor, ne kazandırır? — mantık kurallarıyla tutarlı).
- Sıkça Sorulan Sorular (SSS): tam 3 adet mantıklı ve birbiriyle / ürün adıyla çelişmeyen soru-cevap.
- Kapanış: Metni şu cümleyle bitir (aynı anlamda, kelimesi kelimesine tercih edilir): "MaviKalem güvencesi ve hızlı kargo avantajıyla hemen sipariş verin."`;
}

/**
 * @param {{ kategori: string, urunAdi: string, detayMetni: string }}
 * @returns {{ systemInstruction: string, usedDetailBlock: boolean }}
 */
function buildDynamicDescriptionPrompt({ kategori, urunAdi, detayMetni }) {
  const kat = normalizeSpace(kategori) || "Genel";
  const ad = normalizeSpace(urunAdi) || "Ürün";
  const detay = normalizeSpace(detayMetni);

  const intro = `Sen uzman bir e-ticaret SEO ve içerik metin yazarısın. ${kat} kategorisindeki '${ad}' ürünü için profesyonel bir ürün açıklaması ve SSS (Sıkça Sorulan Sorular) yazacaksın.

Ürün adı (Title — çelişkide mutlak öncelik): '${ad}'
Kategori metni: '${kat}'

${buildCriticalLogicBlock()}
`;

  const footer = `

${buildSonucFormatiBlock()}`;

  if (hasMeaningfulDetailText(detay)) {
    const systemInstruction =
      intro +
      `
[ÜRÜN DETAYI — DOLU]
Sana verilen şu teknik detayları kullan: '${detay}'.
Yukarıdaki mantık kurallarına göre filtrele: çelişen veya ürün adıyla uyumsuz satırları metne alma; doğru ve tutarlı bilgileri SEO uyumlu, dikkat çekici ve madde işaretli satış metnine dönüştür.` +
      footer;

    return { systemInstruction, usedDetailBlock: true };
  }

  const systemInstruction =
    intro +
    `
[ÜRÜN DETAYI — BOŞ / YETERSİZ]
Kendi bilgi havuzunu kullanarak bu kitabın/ürünün müfredat durumunu ve içeriğini analiz et. Yukarıdaki mantık kurallarına SIKI SIKIYA bağlı kalarak, hedef kitlenin bilmek isteyeceği özellikleri kurgula ve SEO uyumlu, satışa ikna edici bir metin oluştur. Halüsinasyon yapma: ürün adında veya kategorisinde geçmeyen sınav/sınıf seviyesi iddiası üretme.` +
    footer;

  return { systemInstruction, usedDetailBlock: false };
}

/**
 * Çıktı formatı ve teknik özet — kullanıcı mesajı olarak gönderilir.
 * @param {Record<string, unknown>} facts extractProductFacts çıktısı
 * @param {string} strategyKey
 * @param {number} minAiWords
 * @returns {string}
 */
function buildGeminiUserPrompt(facts, strategyKey, minAiWords) {
  const strategyLabel = {
    stationery: "kırtasiye ürünü",
    book: "eğitim kitabı",
    set: "ürün seti",
    tech: "teknoloji ürünü",
    art: "sanatsal ürün",
    bag: "çanta veya taşıma ürünü",
    office: "ofis ürünü",
    kids: "çocuk odaklı ürün",
    generic: "e-ticaret ürünü"
  }[strategyKey] || "e-ticaret ürünü";

  const technicalSummary = [
    facts.materyal ? `Materyal: ${facts.materyal}` : "",
    facts.boyut ? `Boyut: ${facts.boyut}` : "",
    facts.agirlik ? `Ağırlık: ${facts.agirlik}` : "",
    facts.bolmeSayisi ? `Bölme sayısı: ${facts.bolmeSayisi}` : "",
    facts.renk ? `Renk: ${facts.renk}` : "",
    facts.yasGrubu ? `Yaş grubu: ${facts.yasGrubu}` : "",
    facts.karakter ? `Karakter/tema: ${facts.karakter}` : "",
    facts.yikanabilirlik ? `Temizlik: ${facts.yikanabilirlik}` : ""
  ]
    .filter(Boolean)
    .join(" | ");

  const closingExact =
    "MaviKalem güvencesi ve hızlı kargo avantajıyla hemen sipariş verin.";

  return `
Ürün türü bağlamı: ${strategyLabel}

Yapılandırılmış ürün alanları (varsa kullan; sistem talimatındaki mantık ve başlık önceliği bunlardan önce gelir):
- Ürün adı: "${facts.title}"
- Marka: "${facts.brand}"
- Kategori: "${facts.category}"
- Ana kategori: "${facts.mainCategory || ""}"
- Alt kategori: "${facts.subCategory || ""}"
- Renk: "${facts.color}"
- Uç kalınlığı: "${facts.leadSize}"
- Model no: "${facts.modelNo}"
- Stok kodu: "${facts.stockCode}"
- Yapılandırılmış teknik bilgiler: "${technicalSummary}"
- Birleştirilmiş teknik metin özeti: "${facts.detailsText || ""}"

Çıktı — SADECE HTML (başka açıklama yazma). Yapı şöyle olmalı:
1. <h2> içinde ürünün tam adı.
2. En az bir <p> dikkat çekici giriş paragrafı.
3. Bir <ul> ile öne çıkan özellikler (her madde <li>).
4. <h3>Hedef kitle ve faydalar</h3> ardından bir veya iki <p> (sistemdeki sınav/sınıf mantığına aykırı ifade yok).
5. <h3>Sıkça Sorulan Sorular</h3> ve tam 3 soru-cevap; her soru için kısa bir paragraf veya <p><strong>Soru?</strong> Cevap.</p> biçimi kullan; SSS içeriği ürün adı ve kategori ile çelişmesin.
6. Son olarak bir <p> ile kapanış cümlesi — metin şu ifadeyi içermeli ve bu cümleyle bitmeli: "${closingExact}"
7. Ürün adı metinde doğal biçimde geçsin.
8. Spam, abartılı satış dili ve gereksiz tekrar kullanma.
9. Kategoriye uygun terminoloji kullan; kitap dışı ürünlerde sınav isimlerini zorla kullanma.
10. Türkçe yaz; toplam metin en az ${minAiWords} kelime olsun (HTML etiketleri hariç düz metin kelime sayısı).
`.trim();
}

module.exports = {
  MIN_MEANINGFUL_DETAIL_LEN,
  hasMeaningfulDetailText,
  buildDynamicDescriptionPrompt,
  buildGeminiUserPrompt
};
