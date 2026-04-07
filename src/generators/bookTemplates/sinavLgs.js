/**
 * LGS Kitapları — Sınav Alt Kategorisi
 * 8. Sınıf LGS hazırlık, soru bankası, deneme, konu anlatım
 */
const {
  pickVariation,
  pickVariationOffset,
  buildStyledTable,
  buildFaqBlock,
  buildClosingParagraph,
  getAuthor,
  getPublisher
} = require("../../../helpers/books_helper");

const INTRO_POOL = [
  (t) => `<p><strong>${t.title}</strong>, 8. sınıf öğrencilerinin LGS sınavına en etkili şekilde hazırlanması için ${t.publisher} tarafından özenle hazırlanmıştır. Güncel MEB müfredatına ve yeni nesil soru formatına tam uyumlu içeriğiyle öğrencilerin sınav başarısını artırmayı hedefler.</p>`,
  (t) => `<p><strong>${t.title}</strong>, LGS'ye hazırlanan öğrencilere sistematik bir çalışma planı sunmak amacıyla tasarlanmış kapsamlı bir kaynaktır. ${t.publisher} güvencesiyle sunulan bu kitap, yeni nesil soru formatlarına tam uyumlu içeriğiyle öne çıkar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, LGS sınavında yüksek puan hedefleyen öğrenciler için stratejik bir hazırlık rehberidir. ${t.publisher} etiketiyle yayımlanan bu eser, MEB kazanımlarını eksiksiz kapsayan yapısıyla dikkat çekmektedir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, 8. sınıf müfredatını temel alarak LGS'ye yönelik kapsamlı bir içerik sunan, ${t.publisher} kalitesinde üretilmiş başarılı bir kaynak kitaptır. Öğrencilerin konuları pekiştirmesini ve sınav pratiği kazanmasını sağlar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, LGS sınavının yeni nesil soru mantığına uygun olarak hazırlanmış, öğrencilerin analitik düşünme becerilerini geliştiren kapsamlı bir çalışma kaynağıdır. ${t.publisher} tarafından titizlikle hazırlanmıştır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, LGS'ye adım adım hazırlık sürecinde öğrencilerin yanında olan, konu tekrarından deneme sınavlarına kadar geniş bir içerik sunan güçlü bir kaynaktır. ${t.publisher} güvencesiyle yayımlanmıştır.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>${t.author ? t.author + " tarafından hazırlanan tamamı çözümlü bu kitap, " : "Tamamı çözümlü bu kitap, "}her konunun sonunda yer alan yeni nesil sorular ve detaylı çözümler sayesinde öğrencilerin eksiklerini anında görmesine olanak tanır. ${t.lessonLabel} konularını soru bankası ve deneme yapısıyla bütünsel bir hazırlık deneyimi sağlar.</p>`,
  (t) => `<p>Konuları MEB kazanım sırasına uygun şekilde ele alan bu kaynak, ${t.author ? t.author + "'ın tecrübesiyle " : ""}${t.lessonLabel} alanında öğrencilere pratik çözüm teknikleri sunmaktadır. Şemalı ve tüm şıkları irdeleyen analizli yazılı çözümler sayesinde öğrenciler bireysel çalışma becerilerini geliştirir.</p>`,
  (t) => `<p>LGS'de karşılaşılabilecek tüm ${t.lessonLabel} soru tiplerini kapsayan bu kaynak, öğrencilerin zaman yönetimi ve sınav stratejisi geliştirmesine yardımcı olur. ${t.publisher} kalitesiyle sunulan içerik, düzenli çalışma planına uyum sağlayan yapısıyla verimli bir hazırlık sunar.</p>`,
  (t) => `<p>Konu bazlı testler ve genel tekrar denemeleriyle güçlendirilen bu kitap, ${t.lessonLabel} alanına hazırlanan her öğrencinin çalışma masasında olması gereken bir kaynaktır. ${t.author ? t.author + " tarafından " : ""}stratejik bir içerikle hazırlanmıştır.</p>`,
  (t) => `<p>Adım adım ilerleyen yapısıyla ${t.lessonLabel} konu kavrama ve soru çözüm becerilerini paralel olarak geliştiren bu kaynak, ${t.publisher} standartlarına uygun olarak üretilmiştir. Paragraf tabanlı, grafik ve tablo yorumlama gibi yeni nesil soru tiplerini de kapsamaktadır.</p>`
];

const FAQ_POOL = [
  { question: "Bu kitap güncel MEB müfredatına uygun mu?", answer: "Evet, kitap tamamen güncel MEB müfredatı ve LGS sınav formatına uygun olarak hazırlanmıştır." },
  { question: "Çözümler kitabın içinde mi yer alıyor?", answer: "Evet, tamamı çözümlü yapısıyla soruların detaylı açıklamaları kitap içerisinde sunulmaktadır." },
  { question: "LGS'ye ne kadar süre kala başlanmalı?", answer: "Sınav tarihinden en az 4-6 ay önce düzenli çalışmaya başlanması tavsiye edilir; ancak konu tekrarı için her dönem kullanılabilir." },
  { question: "Hangi dersleri kapsıyor?", answer: "Kitap, ürün adı ve kapsamına uygun dersleri MEB kazanımları doğrultusunda eksiksiz olarak işlemektedir." },
  { question: "Yeni nesil soru tarzlarını içeriyor mu?", answer: "Evet, LGS'de karşılaşılabilecek paragraf tabanlı, grafik ve tablo yorumlama gibi yeni nesil soru tiplerini kapsamaktadır." },
  { question: "Bireysel çalışma için uygun mu?", answer: "Evet, detaylı çözümleri sayesinde öğretmen veya ders desteği olmadan da bireysel çalışma için uygundur." },
  { question: "Deneme sınavı içeriyor mu?", answer: "Ürünün türüne göre konu testleri veya deneme sınavları barındırabilir; detaylar ürün açıklamasında belirtilmiştir." }
];

function buildSinavLgsDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const author = getAuthor(facts);
  const publisher = getPublisher(facts);

  const lessonLabel = facts.lesson ? `LGS ${facts.lesson} dersinin tüm` : "LGS'nin tüm";
  const templateData = { title: facts.title, author, publisher, lessonLabel };

  const introFn = pickVariation(INTRO_POOL, seed);
  const detailFn = pickVariationOffset(DETAIL_POOL, seed, 1);

  const intro = introFn(templateData);
  const detail = detailFn(templateData);

  const tableRows = [
    { key: "Marka / Yayınevi", value: publisher },
    { key: "Yazar", value: author },
    { key: "Ders / Alan", value: facts.lesson || "" },
    { key: "Sınav", value: "LGS (Liselere Geçiş Sınavı)" },
    { key: "Sınıf Seviyesi", value: facts.classLevel || "8. Sınıf" },
    { key: "Ürün Tipi", value: facts.publicationType || "Soru Bankası" },
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

module.exports = { buildSinavLgsDescription };
