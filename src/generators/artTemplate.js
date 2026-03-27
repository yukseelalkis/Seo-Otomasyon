const { pickVariant } = require("../lib/textUtils");

function buildArtDescription(facts) {
  const seed = facts.variationSeed || `${facts.stockCode}-${facts.title}`;
  const categoryLabel = facts.subCategory || facts.category;

  const intro = [
    `${facts.title}, ${categoryLabel.toLocaleLowerCase("tr-TR")} grubunda kontrollü uygulama yapmak isteyen kullanıcılar için hazırlanmış işlevsel bir sanat malzemesidir.`,
    `${facts.title}, hobi ve sanatsal üretim süreçlerinde daha kontrollü sonuç almak isteyen kullanıcılar için dengeli kullanım sunan bir üründür.`,
    `${facts.title}, okul, atölye ve kişisel hobi çalışmalarında düzenli performans sağlamaya odaklanan kullanışlı bir sanat ürünü olarak öne çıkar.`
  ];

  const usage = [
    `${facts.medium || "Farklı boya teknikleri"} ile uyumlu kullanım senaryolarında pratiklik sağlayan bu model, detay çalışmaları ve kontrollü uygulamalar için uygun bir yapı sunar.`,
    `${facts.brushType || categoryLabel} yapısı sayesinde yüzey üzerinde daha dengeli kontrol sağlamaya yardımcı olur ve çalışma sürecini daha verimli hale getirir.`,
    `${facts.material || "Üretim yapısı"} ve kategoriye uygun tasarımı ile hem başlangıç seviyesinde hem de düzenli kullanımda istikrarlı sonuçlar hedefler.`
  ];

  const features = [
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Kategori:</strong> ${categoryLabel}</li>`,
    facts.medium ? `<li><strong>Kullanım Alanı:</strong> ${facts.medium}</li>` : "",
    facts.brushType ? `<li><strong>Uç Tipi:</strong> ${facts.brushType}</li>` : "",
    facts.material ? `<li><strong>Kıl Yapısı:</strong> ${facts.material}</li>` : "",
    facts.series ? `<li><strong>Seri:</strong> ${facts.series}</li>` : "",
    facts.sizeNo ? `<li><strong>Numara:</strong> ${facts.sizeNo}</li>` : "",
    facts.countInfo ? `<li><strong>İçerik Bilgisi:</strong> ${facts.countInfo}</li>` : "",
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`
  ].filter(Boolean);

  return [
    `<h2>${facts.title}</h2>`,
    `<p>${pickVariant(intro, `${seed}-intro`)}</p>`,
    `<p>${pickVariant(usage, `${seed}-usage`)}</p>`,
    "<ul>",
    ...features,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    `<p><strong>${facts.title} hangi kullanıcılar için uygundur?</strong> Hobi, okul ve atölye çalışmalarında kontrollü sonuç almak isteyen kullanıcılar için uygundur.</p>`,
    `<p><strong>Bu ürün hangi çalışmalarda öne çıkar?</strong> ${facts.medium || categoryLabel} odaklı uygulamalarda düzenli kullanım ve dengeli kontrol avantajı sunar.</p>`,
    `<p><strong>Neden ${facts.title} tercih edilmeli?</strong> Çünkü kategoriye uygun yapısı, marka güvencesi ve kontrollü kullanım hissi ile verimli bir çalışma deneyimi sağlar.</p>`
  ].join("");
}

module.exports = {
  buildArtDescription
};
