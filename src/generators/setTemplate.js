function buildSetDescription(facts) {
  return [
    `<h2>${facts.title}</h2>`,
    `<p>${facts.title}, birden fazla temel ihtiyacı tek pakette sunan pratik bir ${facts.category.toLocaleLowerCase("tr-TR")} çözümüdür. Okul, ofis veya günlük kullanım için gerekli ürünleri bir arada bulundurmak isteyen kullanıcılar için zaman kazandıran bir alternatif oluşturur.</p>`,
    `<p>${facts.brand} kalite standardı ile hazırlanan ürün seti, düzenli kullanımda işlevsellik ve erişilebilirlik avantajı sağlar. Özellikle dönem başlangıcı ve hediye amaçlı alımlarda güçlü bir tercih sebebidir.</p>`,
    "<ul>",
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Kategori:</strong> ${facts.category}</li>`,
    `<li><strong>Ürün Adı:</strong> ${facts.title}</li>`,
    `<li><strong>Renk:</strong> ${facts.color}</li>`,
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    "<p><strong>Set hangi kullanıcılar için uygundur?</strong> Birden fazla ürünü tek seferde temin etmek isteyen öğrenciler, veliler ve ofis kullanıcıları için uygundur.</p>",
    "<p><strong>Setin avantajı nedir?</strong> Ürünleri tek tek toplamak yerine hazır bir kombinasyonla daha hızlı alışveriş imkanı sunar.</p>",
    `<p><strong>Neden ${facts.title} tercih edilmeli?</strong> Çünkü pratik kullanım, marka güvencesi ve zaman tasarrufu bir arada sunulur.</p>`
  ].join("");
}

module.exports = {
  buildSetDescription
};
