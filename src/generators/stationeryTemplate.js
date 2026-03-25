const { pickVariant } = require("../lib/textUtils");

function buildStationeryDescription(facts) {
  const seed = facts.variationSeed || `${facts.stockCode}-${facts.title}`;

  const intro = [
    `${facts.title}, günlük not alma temposunda akıcı yazım arayan kullanıcılar için hazırlanmış dengeli bir ${facts.category.toLocaleLowerCase("tr-TR")} modelidir.`,
    `Yazım konforunu ön planda tutan ${facts.title}, okul ve ofis kullanımında düzenli performans sunan pratik bir ${facts.category.toLocaleLowerCase("tr-TR")} seçeneği olarak öne çıkar.`,
    `${facts.title}, kontrollü çizgi kalitesi ve rahat kullanım hissiyle ders, toplantı ve planlama süreçlerinde tercih edilebilecek işlevsel bir ${facts.category.toLocaleLowerCase("tr-TR")} modelidir.`
  ];

  const support = [
    "Ergonomik tutuş sağlayan gövde yapısı sayesinde uzun süreli kullanımda el yorgunluğunu azaltmaya yardımcı olur.",
    "Rahat kavrama sunan tasarımı, yoğun yazım yapılan günlerde kullanım kolaylığı sağlayarak daha istikrarlı bir deneyim oluşturur.",
    "Dengeli gövde hissi ve kontrollü tutuş yapısı sayesinde hem kısa notlarda hem de uzun yazım oturumlarında konforlu kullanım sağlar."
  ];

  const usage = [
    `${facts.color} renk detayı ve ${facts.leadSize} uç kalınlığıyla dikkat çeken ${facts.title}, ders notlarından günlük ajanda kullanımına kadar farklı senaryolarda istikrarlı sonuç verir.`,
    `${facts.leadSize} uç kalınlığı ve ${facts.color.toLocaleLowerCase("tr-TR")} renk seçeneği ile öne çıkan ${facts.title}, yazım düzenini korumak isteyen kullanıcılar için işlevsel bir çözümdür.`,
    `${facts.title}, ${facts.leadSize} uç yapısı ve ${facts.color.toLocaleLowerCase("tr-TR")} görünümü sayesinde hem kişisel kullanımda hem de eğitim odaklı çalışmalarda düzenli performans sağlar.`
  ];

  const description = [
    `<h2>${facts.title}</h2>`,
    `<p>${pickVariant(intro, `${seed}-intro`)} ${pickVariant(support, `${seed}-support`)}</p>`,
    `<p>${pickVariant(usage, `${seed}-usage`)}</p>`,
    "<ul>",
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Ürün Tipi:</strong> ${facts.category}</li>`,
    `<li><strong>Uç Kalınlığı:</strong> ${facts.leadSize}</li>`,
    `<li><strong>Renk:</strong> ${facts.color}</li>`,
    "<li><strong>Kullanım Alanı:</strong> Okul, ofis ve günlük yazım işleri</li>",
    `<li><strong>Model No:</strong> ${facts.modelNo}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    `<p><strong>${facts.title} hangi kullanıcılar için uygundur?</strong> Öğrenciler, öğretmenler, ofis çalışanları ve günlük yazımda konfor arayan herkes için uygundur.</p>`,
    "<p><strong>Uzun süreli kullanımda rahat mı?</strong> Evet, ergonomik gövde yapısı sayesinde uzun kullanımda da dengeli tutuş sağlar.</p>",
    `<p><strong>${facts.title} neden tercih edilmeli?</strong> Çünkü yazım kontrolü, rahat kavrama ve marka kalite standardını bir arada sunar.</p>`,
    `<p>Yazım kalitesini artırmak ve düzenli not alışkanlığı kazanmak için ${facts.title} modelini tercih edebilirsiniz.</p>`
  ].join("");

  return description;
}

module.exports = {
  buildStationeryDescription
};
