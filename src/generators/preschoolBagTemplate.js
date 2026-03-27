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

  const BEL = "Belirtilmemiş";

  const materyal = facts.materyal || BEL;
  const kumasOzelligi = facts.kumasOzelligi || BEL;
  const boyut = facts.boyut || facts.bagSize || BEL;
  const agirlik = facts.agirlik || BEL;
  const bolmeSayisi = facts.bolmeSayisi || BEL;
  const yanBolme = facts.yanBolme || BEL;
  const askiOzelligi = facts.askiOzelligi || BEL;
  const renk = facts.renk || facts.bagColor || BEL;
  const yasGrubu = facts.yasGrubu || BEL;
  const karakter = facts.karakter || facts.character || BEL;
  const yikanabilirlik = facts.yikanabilirlik || BEL;
  const uyumluUrunler = facts.uyumluUrunler || BEL;

  const specRows = [
    { label: "Marka", value: facts.brand },
    { label: "Ürün Tipi", value: "Anaokul Çantası" },
    { label: "Materyal", value: materyal },
    { label: "Kumaş Özelliği", value: kumasOzelligi },
    { label: "Boyut", value: boyut },
    { label: "Ağırlık", value: agirlik },
    { label: "Bölme Sayısı", value: bolmeSayisi },
    { label: "Yan Bölme", value: yanBolme },
    { label: "Askı Özelliği", value: askiOzelligi },
    { label: "Renk", value: renk },
    { label: "Hedef Yaş Grubu", value: yasGrubu },
    { label: "Karakter/Tema", value: karakter },
    { label: "Temizlik", value: yikanabilirlik },
    { label: "Uyumlu Ürünler", value: uyumluUrunler },
    { label: "Stok Kodu", value: facts.stockCode },
    { label: "Ürün Adı", value: t }
  ];

  const listItems = specRows
    .map((row) => `<li><strong>${row.label}:</strong> ${row.value}</li>`)
    .join("");

  const faqYas = yasGrubu
    ? `<p><strong>${t} kaç yaş için uygundur?</strong> ${yasGrubu} aralığındaki anaokulu öğrencileri için uygundur.</p>`
    : `<p><strong>${t} kaç yaş için uygundur?</strong> Anaokulu çağındaki çocuklar için uygundur.</p>`;

  const faqTemizlik = yikanabilirlik
    ? `<p><strong>Çanta yıkanabilir mi?</strong> ${yikanabilirlik}</p>`
    : "";

  return [
    `<h2>${t}</h2>`,
    `<p>${pickVariant(intro, `${seed}-intro`)}</p>`,
    `<p>${pickVariant(mid, `${seed}-mid`)}</p>`,
    `<ul>${listItems}</ul>`,
    "<h3>Sıkça Sorulan Sorular</h3>",
    faqYas,
    faqTemizlik,
    "<p><strong>Neden tercih edilmeli?</strong> Ergonomi, hafiflik ve düzenli iç hacim avantajı sunar.</p>",
    `<p>Siz de çocuğunuz için <strong>${t}</strong> tercih ederek okula gidişi konforlu hale getirebilirsiniz.</p>`
  ].filter(Boolean).join("");
}

module.exports = {
  buildPreschoolBagDescription
};
