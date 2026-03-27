const { pickVariant } = require("../lib/textUtils");

function buildBagDescription(facts) {
  const seed = facts.variationSeed || `${facts.stockCode}-${facts.title}`;
  const categoryLabel = facts.subCategory || facts.category;

  const intro = [
    `${facts.title}, günlük okul ve dış kullanım temposuna uyum sağlayacak şekilde tasarlanmış kullanışlı bir ${categoryLabel.toLocaleLowerCase("tr-TR")} modelidir.`,
    `${facts.title}, pratik taşıma ihtiyacını karşılamak isteyen kullanıcılar için düzenli kullanım kolaylığı sunan bir ${categoryLabel.toLocaleLowerCase("tr-TR")} seçeneğidir.`,
    `${facts.title}, günlük eşyaları daha düzenli taşımaya yardımcı olan ve konfor odaklı kullanım sunan işlevsel bir model olarak öne çıkar.`
  ];

  const usage = [
    `${facts.usageType || categoryLabel} yapısı, okul ve günlük kullanım senaryolarında düzenli taşıma alışkanlığı oluşturmak isteyen kullanıcılar için uygundur.`,
    `${facts.pattern ? `${facts.pattern} teması` : "Ürün tasarımı"}, görsel uyum ile kullanım pratikliğini bir araya getirerek özellikle öğrenciler için dikkat çekici bir alternatif oluşturur.`,
    `Günlük kullanım yoğunluğunda erişilebilirlik, pratiklik ve temel taşıma ihtiyacını dengeleyen bir yapı sunar.`
  ];

  return [
    `<h2>${facts.title}</h2>`,
    `<p>${pickVariant(intro, `${seed}-intro`)}</p>`,
    `<p>${pickVariant(usage, `${seed}-usage`)}</p>`,
    "<ul>",
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Kategori:</strong> ${categoryLabel}</li>`,
    facts.usageType ? `<li><strong>Kullanım Tipi:</strong> ${facts.usageType}</li>` : "",
    facts.pattern ? `<li><strong>Tasarım:</strong> ${facts.pattern}</li>` : "",
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`,
    `<li><strong>Model No:</strong> ${facts.modelNo}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    `<p><strong>${facts.title} kimler için uygundur?</strong> Okul çağındaki öğrenciler ve günlük taşıma kolaylığı arayan kullanıcılar için uygundur.</p>`,
    "<p><strong>Günlük kullanım için uygun mu?</strong> Evet, temel taşıma ihtiyacını düzenli ve pratik biçimde karşılamaya yardımcı olacak bir yapı sunar.</p>",
    `<p><strong>Neden ${facts.title} tercih edilmeli?</strong> Çünkü kullanım kolaylığı, düzenli taşıma deneyimi ve kategoriye uygun tasarım avantajlarını bir arada sunar.</p>`
  ].filter(Boolean).join("");
}

module.exports = {
  buildBagDescription
};
