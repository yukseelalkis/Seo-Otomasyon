/**
 * Lise Yardımcı Kitapları — 9-12. Sınıf
 */
const {
  pickVariation,
  pickVariationOffset,
  buildStyledTable,
  buildFaqBlock,
  buildClosingParagraph,
  getAuthor,
  getPublisher
} = require("../../helpers/books_helper");

const INTRO_POOL = [
  (t) => `<p><strong>${t.title}</strong>, ${t.classInfo}öğrencilerinin ders konularını derinlemesine kavraması ve akademik başarısını artırması için ${t.publisher} tarafından hazırlanmış kapsamlı bir yardımcı kaynaktır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, lise düzeyinde eğitim gören ${t.classInfo}öğrencilerine müfredat konularında güçlü bir destek sunmak amacıyla ${t.publisher} güvencesiyle tasarlanmış nitelikli bir eğitim materyalidir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.classInfo}öğrencilerinin hem okul sınavlarına hem de üniversite sınavlarına sağlam bir temel oluşturması için ${t.publisher} kalitesiyle üretilmiş stratejik bir yardımcı kitaptır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, güncel MEB müfredatı doğrultusunda hazırlanmış, ${t.classInfo}düzeyindeki öğrencilerin konu hakimiyetini pekiştirmesini sağlayan ve ${t.publisher} etiketiyle sunulan başarılı bir kaynaktır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.classInfo}öğrencilerinin akademik gelişimini desteklemek ve üniversite sınavına güçlü bir altyapı oluşturmak için ${t.publisher} tarafından titizlikle oluşturulmuş kapsamlı bir eğitim kaynağıdır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.publisher} güvencesiyle yayımlanan, ${t.classInfo}müfredatına tam uyumlu içeriğiyle öğrencilerin hem okul hem de sınav başarısını artırmayı hedefleyen etkili bir yardımcı kitaptır.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>${t.author ? t.author + " tarafından hazırlanan tamamı çözümlü bu kitap, " : "Tamamı çözümlü bu kitap, "}lise müfredatının konularını detaylı bir şekilde ele alarak öğrencilerin konuyu derinlemesine kavramasını sağlar. Çözümlü örnekler ve pekiştirme testleriyle öğrenmenin kalıcılığını artırır.</p>`,
  (t) => `<p>Üniversite sınavına temel oluşturacak şekilde tasarlanan bu kaynak, ${t.publisher} standartlarında üretilmiştir. Konu anlatımı, test soruları ve pratik bölümleriyle bütünsel bir çalışma deneyimi sunar.</p>`,
  (t) => `<p>Konuları müfredat sırasına uygun olarak işleyen bu kitap, öğrencilerin okul derslerine paralel ilerleyebilmesini sağlar. ${t.author ? t.author + "'ın " : ""}eğitim odaklı yaklaşımıyla hazırlanan içerik, hem yazılı sınavlara hem de YKS altyapısına güçlü bir hazırlık sunar.</p>`,
  (t) => `<p>Anlaşılır dili ve sistematik yapısıyla dikkat çeken bu kaynak, ${t.publisher} kalitesiyle sunulmaktadır. Öğrencilerin konuları adım adım öğrenmesine olanak tanıyan yapısıyla akademik gelişimi destekler.</p>`,
  (t) => `<p>Her bölüm sonundaki değerlendirme soruları ve konu özetleri, öğrencilerin öğrenme düzeyini ölçmesine ve eksiklerini hızla gidermesine yardımcı olur. ${t.publisher} güvencesiyle yayımlanan bu kitap, lise eğitiminde güçlü bir yardımcıdır.</p>`
];

const FAQ_POOL = [
  { question: "Bu kitap MEB müfredatına uygun mu?", answer: "Evet, kitap tamamen güncel MEB lise müfredatına uygun olarak hazırlanmıştır." },
  { question: "Üniversite sınavına hazırlık için de kullanılabilir mi?", answer: "Evet, müfredat konularını derinlemesine işlediğinden YKS altyapısı oluşturmak için güçlü bir temel sağlar." },
  { question: "Hangi sınıf seviyesi için uygundur?", answer: "Kitap, ürün adında ve açıklamasında belirtilen lise sınıf seviyesindeki öğrenciler için tasarlanmıştır." },
  { question: "Çözümler kitapta mevcut mu?", answer: "Evet, soruların detaylı çözümleri kitap içerisinde veya ayrı çözüm ekinde sunulmaktadır." },
  { question: "Bireysel çalışma için yeterli mi?", answer: "Evet, anlaşılır anlatımı ve çözümlü yapısı sayesinde bireysel çalışma için son derece uygundur." },
  { question: "Okul yazılılarına hazırlık sağlar mı?", answer: "Evet, müfredata uygun konu anlatımı ve test soruları ile okul yazılı sınavlarına etkili bir hazırlık sunar." },
  { question: "Hangi dersleri kapsıyor?", answer: "Kitap, ürün kapsamına uygun ders veya konuları müfredat doğrultusunda ele almaktadır." }
];

function buildOkulLiseDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const author = getAuthor(facts);
  const publisher = getPublisher(facts);
  const classInfo = facts.classLevel ? `${facts.classLevel} ` : "";

  const templateData = { title: facts.title, author, publisher, classInfo };

  const introFn = pickVariation(INTRO_POOL, seed);
  const detailFn = pickVariationOffset(DETAIL_POOL, seed, 1);

  const intro = introFn(templateData);
  const detail = detailFn(templateData);

  const tableRows = [
    { key: "Marka / Yayınevi", value: publisher },
    { key: "Yazar", value: author },
    { key: "Sınıf Seviyesi", value: facts.classLevel || "" },
    { key: "Ders / Alan", value: facts.lesson || "" },
    { key: "Ürün Tipi", value: facts.publicationType || "Yardımcı Kitap" },
    { key: "Sayfa Sayısı", value: facts.sayfaSayisi || "" },
    { key: "Ebat", value: facts.ebat || "" },
    { key: "Çözüm Tipi", value: "Tamamı Çözümlü" },
    { key: "Müfredat Uyumu", value: "Güncel MEB Müfredatı" },
    { key: "Stok Kodu", value: facts.stockCode || "" }
  ];

  const faq1 = pickVariationOffset(FAQ_POOL, seed, 0);
  const faq2 = pickVariationOffset(FAQ_POOL, seed, 1);
  const faq3 = pickVariationOffset(FAQ_POOL, seed, 2);

  const table = buildStyledTable(tableRows);
  const faqBlock = buildFaqBlock([faq1, faq2, faq3]);
  const closing = buildClosingParagraph(facts.title, seed);

  return [
    `<h2>${facts.title}</h2>`,
    intro,
    detail,
    table,
    faqBlock,
    closing
  ].filter(Boolean).join("");
}

module.exports = { buildOkulLiseDescription };
