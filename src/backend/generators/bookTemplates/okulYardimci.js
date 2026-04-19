/**
 * Okula Yardımcı Kitapları — İlkokul ve Ortaokul (1-8. Sınıf)
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
  (t) => `<p><strong>${t.title}</strong>, ${t.classInfo}öğrencilerinin müfredat konularını pekiştirmesi ve ders başarısını artırması için ${t.publisher} tarafından hazırlanmış kapsamlı bir yardımcı kaynaktır. Güncel MEB müfredatına tam uyumlu içeriğiyle öne çıkar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.classInfo}düzeyindeki öğrencilere okul derslerinde destek olmak amacıyla ${t.publisher} güvencesiyle tasarlanmış etkili bir çalışma materyalidir. MEB müfredatına tam uyumlu içeriğiyle öne çıkar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.classInfo}öğrencilerinin konuları daha iyi kavraması ve sınav performansını yükseltmesi için ${t.publisher} kalitesiyle üretilmiş başarılı bir yardımcı kitaptır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, güncel MEB müfredatına uygun olarak hazırlanmış, ${t.classInfo}öğrencilerinin akademik gelişimini destekleyen ve ${t.publisher} etiketiyle sunulan nitelikli bir eğitim kaynağıdır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.classInfo}düzeyindeki öğrencilerin dönem içi konu takibi ve sınav hazırlığı için ${t.publisher} tarafından özenle oluşturulmuş pratik bir yardımcı kitaptır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.publisher} güvencesiyle yayımlanan, ${t.classInfo}öğrencilerinin derslerine paralel olarak ilerleyebileceği kapsamlı bir eğitim kaynağıdır.</p>`,
  (t) => `<p>Eğitim hayatının ilk yıllarında öğrencilerin derslere olan ilgisini artıran <strong>${t.title}</strong>, ${t.publisher} kalitesiyle hazırlanan içeriği sayesinde ${t.classInfo}seviyesindeki konuları eğlenceli ve öğretici bir dille sunar.</p>`,
  (t) => `<p>Öğrenmeyi kalıcı hale getiren <strong>${t.title}</strong>, ${t.classInfo}öğrencileri için hem okul sınavlarında yüksek puan almalarına yardımcı olur hem de ${t.publisher} güvencesiyle sağlam bir akademik temel oluşturur.</p>`,
  (t) => `<p>Müfredatı adım adım takip eden yapısıyla <strong>${t.title}</strong>, ${t.classInfo}öğrencilerinin evdeki en büyük destekçisidir ve ${t.publisher} uzmanlığıyla konuları pekiştirmelerine olanak tanır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.classInfo}düzeyindeki öğrencilerin derslerdeki özgüvenini artıran, görsel ve teorik anlatımları birleştiren ${t.publisher} imzalı nitelikli bir yardımcı materyaldir.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>${t.author ? t.author + " tarafından hazırlanan tamamı çözümlü bu kitap, " : "Tamamı çözümlü bu kitap, "}konuları küçük adımlarla ele alarak öğrencilerin kendi hızında ilerlemesine olanak tanır. Her ünitenin sonundaki değerlendirme testleri, öğrenmenin ne kadar kalıcı olduğunu ölçmeye yardımcı olur.</p>`,
  (t) => `<p>Müfredat kazanımlarına uygun olarak düzenlenen bu kaynak, ${t.publisher} kalitesiyle sunulmaktadır. Konu anlatımı, çözümlü örnekler ve pekiştirme etkinlikleri bir arada sunularak verimli bir öğrenme deneyimi sağlanır.</p>`,
  (t) => `<p>Renkli ve görsel destekli anlatım yapısıyla dikkat çeken bu kitap, öğrencilerin motivasyonunu yüksek tutarak öğrenme sürecini keyifli hale getirir. ${t.publisher} standartlarında üretilen bu kaynak, hem evde hem de sınıf içi çalışmalarda kolaylıkla kullanılabilir.</p>`,
  (t) => `<p>Konuları günlük yaşamla ilişkilendiren anlaşılır bir dil kullanan bu kaynak, öğrencilerin soyut kavramları somutlaştırmasına yardımcı olur. ${t.author ? t.author + "'ın " : ""}eğitim odaklı yaklaşımıyla hazırlanan içerik, kalıcı öğrenmeyi destekler.</p>`,
  (t) => `<p>Düzenli çalışma alışkanlığı kazandırmayı hedefleyen yapısıyla bu kitap, hem bireysel hem de ebeveyn destekli çalışmalar için uygundur. ${t.publisher} güvencesiyle sunulan bu kaynak, öğrencilerin akademik başarısını artırmaya odaklanır.</p>`
];

const FAQ_POOL = [
  { question: "Bu kitap MEB müfredatına uygun mu?", answer: "Evet, kitap tamamen güncel MEB müfredatına uygun olarak hazırlanmıştır." },
  { question: "Hangi sınıf seviyesi için uygundur?", answer: "Kitap, ürün adı ve içeriğinde belirtilen sınıf seviyesindeki öğrenciler için tasarlanmıştır." },
  { question: "Çözümleri var mı?", answer: "Evet, soruların çözümleri kitap içerisinde veya ayrı çözüm ekinde sunulmaktadır." },
  { question: "Evde bireysel çalışma için kullanılabilir mi?", answer: "Evet, anlaşılır anlatımı ve çözümlü yapısı sayesinde evde bireysel çalışma için uygundur." },
  { question: "Okul sınavlarına hazırlık için yeterli mi?", answer: "Evet, müfredata uygun içeriği ve konu testleri sayesinde okul sınavlarına etkili bir hazırlık sunar." },
  { question: "Konu anlatımı detaylı mı?", answer: "Konu anlatımları, öğrenci seviyesine uygun, görsel destekli ve anlaşılır bir dille hazırlanmıştır." },
  { question: "Tüm dersleri kapsıyor mu?", answer: "Kitap, ürün kapsamına uygun ders veya dersleri müfredat doğrultusunda ele almaktadır." }
];

function buildOkulYardimciDescription(facts) {
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

module.exports = { buildOkulYardimciDescription };
