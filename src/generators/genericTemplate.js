function buildGenericDescription(facts) {
  return [
    `<h2>${facts.title}</h2>`,
    `<p>${facts.title}, ${facts.category.toLocaleLowerCase("tr-TR")} grubunda temel kullanım beklentilerine cevap vermek üzere sunulan bir üründür. Kategoriye uygun kullanım senaryolarında erişilebilir ve dengeli bir deneyim hedefler.</p>`,
    `<p>${facts.brand} markasının ürün yaklaşımı ile sunulan bu model, açıklaması daha sonra kategori bazlı zenginleştirilebilecek genel bir içerik çerçevesi sağlar.</p>`,
    "<ul>",
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Kategori:</strong> ${facts.category}</li>`,
    `<li><strong>Ürün Adı:</strong> ${facts.title}</li>`,
    `<li><strong>Model No:</strong> ${facts.modelNo}</li>`,
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    "<p><strong>Bu ürün kimler için uygundur?</strong> Günlük kullanımda pratik ve güvenilir ürün arayan kullanıcılar için uygundur.</p>",
    "<p><strong>Ürünün öne çıkan tarafı nedir?</strong> Dengeli yapı, erişilebilir kullanım ve kategoriye uygun temel ihtiyaçları karşılamasıdır.</p>",
    `<p><strong>Neden bu ürünü tercih etmeliyim?</strong> Çünkü ${facts.title}, marka güvencesiyle temel beklentileri karşılayan güvenilir bir çözüm sunar.</p>`
  ].join("");
}

module.exports = {
  buildGenericDescription
};
