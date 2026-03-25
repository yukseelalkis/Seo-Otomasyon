const { pickVariant } = require("../lib/textUtils");

function buildPreschoolBagDescription(facts) {
  const seed = facts.variationSeed || `${facts.stockCode}-${facts.title}`;
  const t = facts.title;

  const intro = [
    `<strong>${t}</strong>, anaokulu çağındaki çocukların okul eşyalarını düzenli taşıyabilmesi için üretilmiş bir anaokul çantasıdır. Kullanışlı ve sevimli görünümüyle öne çıkar. Ergonomik yapısı sayesinde küçük omuzlara uyum sağlar ve günlük kullanımda konfor sunar.`,
    `<strong>${t}</strong>, 3-6 yaş grubundaki çocukların okul eşyalarını düzenli ve konforlu biçimde taşıyabilmesi için özel olarak üretilmiş bir anaokul çantasıdır. Çocuk dostu tasarımı ile hem kullanışlı hem de sevimli bir görünüm sunar.`,
    `<strong>${t}</strong>, küçük çocukların günlük taşıma ihtiyaçlarını karşılamak amacıyla hafif ve ergonomik olarak tasarlanmış bir anaokul çantasıdır. Dayanıklı yapısı ve şık görünümüyle dikkat çeker.`
  ];

  const mid = [
    `Günlük kullanımda <strong>${t}</strong>, hafif gövdesi ve dengeli taşıma yapısıyla konfor sunar. Çoklu bölme yapısı sayesinde okul eşyalarının düzenli taşınmasını destekler.`,
    `<strong>${t}</strong>, yumuşak sırt desteği ve ayarlanabilir askılar sayesinde çocuklar için rahat bir kullanım sağlar. Geniş fermuar yapısı kolay erişim imkanı tanır.`,
    `<strong>${t}</strong>, ergonomik yapısı sayesinde çocukların eşyalarını rahat ve düzenli taşımasına yardımcı olur. Dış yüzeyi dayanıklı ve pratik kullanıma uygundur.`
  ];

  const materyal = facts.materyal || "Polyester";
  const boyut = facts.boyut || facts.bagSize || "30x25x12 cm";
  const agirlik = facts.agirlik || "250 gr";
  const bolmeSayisi = facts.bolmeSayisi || "2 Ana + 1 Ön Cep";
  const renk = facts.renk || facts.bagColor || "Belirtilmemiş";
  const yasGrubu = facts.yasGrubu || "3-6 Yaş";
  const karakter = facts.karakter || facts.character || "Belirtilmemiş";
  const yikanabilirlik = facts.yikanabilirlik || "Dış yüzeyi nemli bez ile silinebilir.";

  return [
    `<h2>${t}</h2>`,
    `<p>${pickVariant(intro, `${seed}-intro`)}</p>`,
    `<p>${pickVariant(mid, `${seed}-mid`)}</p>`,
    "<ul>",
    `<li><strong>Marka:</strong> ${facts.brand}</li>`,
    `<li><strong>Ürün Tipi:</strong> Anaokul Çantası</li>`,
    `<li><strong>Materyal:</strong> ${materyal}</li>`,
    `<li><strong>Boyut:</strong> ${boyut}</li>`,
    `<li><strong>Ağırlık:</strong> ${agirlik}</li>`,
    `<li><strong>Bölme Sayısı:</strong> ${bolmeSayisi}</li>`,
    `<li><strong>Renk:</strong> ${renk}</li>`,
    `<li><strong>Hedef Yaş Grubu:</strong> ${yasGrubu}</li>`,
    `<li><strong>Karakter/Tema:</strong> ${karakter}</li>`,
    `<li><strong>Temizlik:</strong> ${yikanabilirlik}</li>`,
    `<li><strong>Stok Kodu:</strong> ${facts.stockCode}</li>`,
    `<li><strong>Ürün Adı:</strong> ${t}</li>`,
    "</ul>",
    "<h3>Sıkça Sorulan Sorular</h3>",
    `<p><strong>${t} kaç yaş için uygundur?</strong> ${yasGrubu} aralığındaki anaokulu öğrencileri için uygundur.</p>`,
    `<p><strong>Çanta yıkanabilir mi?</strong> ${yikanabilirlik}</p>`,
    "<p><strong>Neden tercih edilmeli?</strong> Ergonomi, hafiflik ve düzenli iç hacim avantajı sunar.</p>",
    `<p>Siz de çocuğunuz için <strong>${t}</strong> tercih ederek okula gidişi konforlu hale getirebilirsiniz.</p>`
  ].filter(Boolean).join("");
}

module.exports = {
  buildPreschoolBagDescription
};
