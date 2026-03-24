function buildBookDescription(facts) {
  return [
    `<h2>${facts.title}</h2>`,
    `<p>${facts.title}, ${facts.category.toLocaleLowerCase("tr-TR")} kategorisinde öğrencilerin öğrenme sürecini desteklemek amacıyla hazırlanmış kapsamlı bir kaynak olarak öne çıkar. Konu tekrarlarını düzenli hale getirmek ve sınav odaklı çalışma alışkanlığı oluşturmak isteyen kullanıcılar için pratik bir içerik sunar.</p>`,
    `<p>${facts.brand} güvencesiyle sunulan ${facts.title}, düzenli çalışma planına uyum sağlayan yapısı sayesinde hem bireysel hem de sınıf içi çalışmalarda verim odaklı kullanım sağlar.</p>`,
    "<ul>",
    `<li><strong>Yayınevi:</strong> ${facts.brand}</li>`,
    `<li><strong>Kategori:</strong> ${facts.category}</li>`,
    `<li><strong>Ürün Adı:</strong> ${facts.title}</li>`,
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`,
    `<li><strong>Model No:</strong> ${facts.modelNo}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    `<p><strong>${facts.title} hangi seviyeye uygundur?</strong> Ürün adı ve kategori bilgisine uygun seviyedeki öğrenci profilleri için düzenli kullanım hedeflenmiştir.</p>`,
    "<p><strong>İçerik nasıl kullanılmalı?</strong> Konu tekrarı, soru çözümü ve dönem içi takibi birlikte yürütecek şekilde kullanılması önerilir.</p>",
    `<p><strong>Neden bu ürünü tercih etmeliyim?</strong> Çünkü ${facts.title}, planlı çalışmayı destekleyen ve düzenli ilerleme sağlayan içerik yapısıyla öne çıkar.</p>`
  ].join("");
}

module.exports = {
  buildBookDescription
};
