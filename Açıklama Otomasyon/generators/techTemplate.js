function buildTechDescription(facts) {
  return [
    `<h2>${facts.title}</h2>`,
    `<p>${facts.title}, günlük kullanımda hız, pratiklik ve güvenilir performans bekleyen kullanıcılar için tasarlanmış bir ${facts.category.toLocaleLowerCase("tr-TR")} ürünüdür. İş, okul ve mobil yaşam senaryolarında kullanım kolaylığı sağlayacak şekilde konumlandırılır.</p>`,
    `<p>${facts.brand} güvencesiyle sunulan bu model, temel teknik ihtiyaçları karşılayan dengeli yapısı sayesinde farklı kullanım alışkanlıklarına uyum sağlar.</p>`,
    "<ul>",
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Kategori:</strong> ${facts.category}</li>`,
    `<li><strong>Model:</strong> ${facts.modelNo}</li>`,
    `<li><strong>Renk:</strong> ${facts.color}</li>`,
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    "<p><strong>Ürün hangi kullanım senaryoları için uygundur?</strong> Günlük kişisel kullanım, ofis ve eğitim odaklı ihtiyaçlar için uygundur.</p>",
    "<p><strong>Uzun süreli kullanımda performansı nasıldır?</strong> Düzenli kullanımda dengeli ve istikrarlı bir deneyim hedeflenmiştir.</p>",
    `<p><strong>Neden ${facts.title} tercih edilmeli?</strong> Çünkü marka güveni, kullanım kolaylığı ve erişilebilir teknik yapı bir arada sunulur.</p>`
  ].join("");
}

module.exports = {
  buildTechDescription
};
