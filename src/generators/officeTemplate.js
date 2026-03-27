const { pickVariant } = require("../lib/textUtils");

function buildOfficeDescription(facts) {
  const seed = facts.variationSeed || `${facts.stockCode}-${facts.title}`;
  const categoryLabel = facts.subCategory || facts.category;

  const intro = [
    `${facts.title}, ofis ve arşiv düzenini destekleyen pratik bir ${categoryLabel.toLocaleLowerCase("tr-TR")} çözümüdür.`,
    `${facts.title}, masa başı iş akışını daha düzenli hale getirmek isteyen kullanıcılar için işlevsel kullanım sunan bir ofis ürünüdür.`,
    `${facts.title}, günlük evrak ve düzen ihtiyaçlarında erişilebilir kullanım kolaylığı sağlayan kullanışlı bir modeldir.`
  ];

  return [
    `<h2>${facts.title}</h2>`,
    `<p>${pickVariant(intro, `${seed}-intro`)}</p>`,
    `<p>${facts.brand} markasının ofis ihtiyaçlarına uygun yaklaşımı ile sunulan bu ürün, iş akışında düzen ve pratiklik arayan kullanıcılar için dengeli bir kullanım deneyimi sağlar.</p>`,
    "<ul>",
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Kategori:</strong> ${categoryLabel}</li>`,
    `<li><strong>Ürün Adı:</strong> ${facts.title}</li>`,
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`,
    `<li><strong>Model No:</strong> ${facts.modelNo}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    `<p><strong>${facts.title} hangi kullanım alanları için uygundur?</strong> Ofis, okul ve evrak düzeni gerektiren günlük kullanım senaryoları için uygundur.</p>`,
    "<p><strong>Pratik kullanım sunar mı?</strong> Evet, günlük düzen ihtiyacını destekleyen erişilebilir ve işlevsel bir yapı sağlar.</p>",
    `<p><strong>Neden ${facts.title} tercih edilmeli?</strong> Çünkü ofis düzeni, kullanım kolaylığı ve marka güvenini bir arada sunar.</p>`
  ].join("");
}

module.exports = {
  buildOfficeDescription
};
