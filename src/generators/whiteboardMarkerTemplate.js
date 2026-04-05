const { pickVariant } = require("../lib/textUtils");

function valueOrDefault(value, fallback = "Belirtilmemiş") {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  return value;
}

function yesNo(value) {
  if (value === true) return "Evet";
  if (value === false) return "Hayır";
  return "Belirtilmemiş";
}

function buildTableRow(label, value) {
  return `
<tr style="border-bottom: 1px solid #eaeaea;">
  <th style="background-color: #f9f9f9;">${label}</th>
  <td>${valueOrDefault(value)}</td>
</tr>`;
}

function buildWhiteboardMarkerDescription(facts) {
  const seed = facts.variationSeed || `${facts.stockCode}-${facts.title}`;

  const introVariants = [
    `<strong>${facts.title}</strong>, beyaz yazı tahtalarında net ve akıcı yazım sağlayan kullanışlı bir tahta kalemidir. Ofis, okul ve eğitim ortamlarında rahat kullanım sunar.`,
    `<strong>${facts.title}</strong>, beyaz yazı tahtalarında yazı ve işaretleme işlemleri için geliştirilen pratik bir tahta kalemidir. Günlük kullanımda temiz ve okunabilir yazım deneyimi sağlar.`,
    `<strong>${facts.title}</strong>, eğitim ve ofis kullanımına uygun yapısıyla beyaz tahtalarda düzenli, belirgin ve konforlu yazım sağlayan bir üründür.`
  ];

  const bodyVariants = [
    `${valueOrDefault(facts.tipType, "Yuvarlak uç")} yapısı sayesinde dengeli yazım sunar ve yazılar daha kolay okunur. ${facts.technology ? `${facts.technology} özelliği sayesinde kapağı açık kalsa bile kurumaya karşı dayanıklıdır.` : "Günlük kullanımda pratiklik sağlayan bir yapıya sahiptir."} ${facts.erasable ? "Gözeneksiz yüzeylerden kuru bezle kolayca silinebilir." : ""}`,
    `${valueOrDefault(facts.tipThickness, "Standart")} uç kalınlığı ile yazı tahtasında kontrollü kullanım sağlar. ${facts.usageArea ? `${facts.usageArea} gibi alanlarda verimli kullanım sunar.` : "Farklı kullanım senaryolarında pratiklik sunar."} ${facts.refillable ? "Yeniden doldurulabilir yapısıyla uzun süreli kullanım avantajı sağlar." : ""}`,
    `Tahta üzerinde net iz bırakacak şekilde tasarlanan bu model, günlük kullanımda hem pratiklik hem de düzenli yazım avantajı sunar. ${facts.chemicalContent ? `${facts.chemicalContent} yapısıyla ürün özelliklerini destekler.` : ""}`
  ];

  const faqSurface = `${facts.title} hangi yüzeylerde kullanılabilir?`;
  const faqErase = `${facts.title} kolay silinir mi?`;
  const faqCap = `Kapağı açık kalırsa kurur mu?`;

  return [
    `<h2>${facts.title}</h2>`,
    `<p>${pickVariant(introVariants, `${seed}-intro`)}</p>`,
    `<p>${pickVariant(bodyVariants, `${seed}-body`)}</p>`,
    `<table style="width: 100%; border-collapse: collapse; border: 1px solid #eaeaea; text-align: left;" cellpadding="8">`,
    `<tbody>`,
    buildTableRow("Marka", facts.brand),
    buildTableRow("Ürün Tipi", facts.productType || "Tahta Kalemi"),
    buildTableRow("Kullanım Alanı", facts.usageArea),
    buildTableRow("Uç Tipi", facts.tipType),
    buildTableRow("Uç Kalınlığı", facts.tipThickness),
    buildTableRow("Mürekkep Türü", facts.inkType),
    buildTableRow("Silinebilirlik", facts.erasable ? "Kuru Bezle Silinebilir" : "Belirtilmemiş"),
    buildTableRow("Teknoloji", facts.technology),
    buildTableRow("Yeniden Doldurulabilir", yesNo(facts.refillable)),
    buildTableRow("Renk", facts.color),
    buildTableRow("Kimyasal İçerik", facts.chemicalContent),
    buildTableRow("Stok Kodu", facts.stockCode),
    `</tbody>`,
    `</table>`,
    `<h3>Sıkça Sorulan Sorular</h3>`,
    `<p><strong>${faqSurface}</strong> ${valueOrDefault(facts.faqSurfaceAnswer, facts.usageArea || "Beyaz yazı tahtaları üzerinde kullanılabilir.")}</p>`,
    `<p><strong>${faqErase}</strong> ${valueOrDefault(facts.faqEraseAnswer, facts.erasable ? "Evet, uygun yüzeylerden kuru bezle kolayca silinebilir." : "Silinebilirlik bilgisi belirtilmemiştir.")}</p>`,
    `<p><strong>${faqCap}</strong> ${valueOrDefault(facts.faqCapAnswer, facts.technology ? `Hayır, ${facts.technology} özelliği sayesinde kurumaya karşı dayanıklıdır.` : "Bu özellik belirtilmemiştir.")}</p>`,
    `<p>Siz de <strong>${facts.title}</strong> tercih ederek yazı tahtalarında net, temiz ve pratik kullanım avantajı elde edebilirsiniz.</p>`
  ].join("");
}

module.exports = {
  buildWhiteboardMarkerDescription
};