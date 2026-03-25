const { pickVariant } = require("../lib/textUtils");

function buildKidsDescription(facts) {
  const seed = facts.variationSeed || `${facts.stockCode}-${facts.title}`;
  const categoryLabel = facts.subCategory || facts.category;

  const intro = [
    `${facts.title}, çocukların günlük kullanım alışkanlıklarına uyum sağlayan eğlenceli ve işlevsel bir ${categoryLabel.toLocaleLowerCase("tr-TR")} ürünüdür.`,
    `${facts.title}, görsel çekicilik ile günlük kullanım kolaylığını bir araya getirerek çocuk odaklı ürün gruplarında öne çıkar.`,
    `${facts.title}, çocuk kullanıcıların ilgisini çeken tasarım dili ile pratik kullanım ihtiyacını birlikte karşılamayı hedefler.`
  ];

  return [
    `<h2>${facts.title}</h2>`,
    `<p>${pickVariant(intro, `${seed}-intro`)}</p>`,
    `<p>${facts.pattern ? `${facts.pattern} teması` : "Tasarım dili"}, ürünün çocuk kullanıcılar tarafından daha keyifli algılanmasına yardımcı olurken günlük kullanımda düzenli erişim kolaylığı sağlar.</p>`,
    "<ul>",
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Kategori:</strong> ${categoryLabel}</li>`,
    facts.pattern ? `<li><strong>Tema:</strong> ${facts.pattern}</li>` : "",
    `<li><strong>Ürün Adı:</strong> ${facts.title}</li>`,
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    `<p><strong>${facts.title} kimler için uygundur?</strong> Günlük kullanımda çocuklara hitap eden ürün arayan kullanıcılar için uygundur.</p>`,
    "<p><strong>Tasarımı neden öne çıkar?</strong> Kullanım kolaylığını çocukların ilgisini çeken görsel detaylarla birleştirir.</p>",
    `<p><strong>Neden ${facts.title} tercih edilmeli?</strong> Çünkü işlevsellik, eğlenceli görünüm ve günlük kullanım kolaylığını bir arada sunar.</p>`
  ].filter(Boolean).join("");
}

module.exports = {
  buildKidsDescription
};
