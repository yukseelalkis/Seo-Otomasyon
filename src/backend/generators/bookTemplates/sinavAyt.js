/**
 * AYT Kitapları — Sınav Alt Kategorisi
 * AYT hazırlık, soru bankası, deneme, konu anlatım
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
  (t) => `<p><strong>${t.title}</strong>, AYT sınavında hedef bölümüne yerleşmek isteyen adaylar için ${t.publisher} tarafından hazırlanmış ileri düzey bir kaynaktır. ÖSYM'nin alan sınavı formatına ve yeni nesil soru tarzına tam uyumlu içeriğiyle adayların puan türüne özel hazırlanmasını destekler.</p>`,
  (t) => `<p><strong>${t.title}</strong>, YKS-AYT oturumuna odaklanan öğrencilerin alan bilgisini derinleştirmesi ve sınav pratiği kazanması için ${t.publisher} kalitesiyle üretilmiş kapsamlı bir kaynak kitaptır. Güncel müfredata tam uyumlu yapısıyla sistematik bir hazırlık sunar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, AYT'de yüksek puan hedefleyen adaylar için geliştirilmiş, konuları derinlemesine işleyen ve soru çözme becerilerini güçlendiren stratejik bir hazırlık materyalidir. ${t.publisher} güvencesiyle sunulmuştur.</p>`,
  (t) => `<p><strong>${t.title}</strong>, üniversite hayallerine ulaşmak isteyen öğrenciler için AYT oturumuna özel olarak tasarlanmış, ${t.publisher} etiketiyle yayımlanmış nitelikli bir kaynaktır. İleri düzey konuları anlaşılır bir dille ele alır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, AYT müfredatının tüm kazanımlarını kapsayan ve adayların alan sınavında fark yaratmasını sağlayan, ${t.publisher} tarafından titizlikle hazırlanmış bir çalışma rehberidir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, AYT sınavına hazırlanan adaylara ileri düzey konu kavrama ve soru çözme pratiği sunan, ${t.publisher} kalitesinde üretilmiş kapsamlı bir kaynaktır.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>${t.author ? t.author + " tarafından " : ""}AYT sınavının zorluk seviyesine uygun olarak hazırlanan tamamı çözümlü bu kitap, ${t.lessonLabel} konularını derinlemesine ele alarak öğrencilerin alan bilgisini pekiştirmesini sağlar. Şemalı ve tüm şıkları irdeleyen analizli yazılı çözümler sayesinde nerede olursanız olun eksiklerinizi anında giderebilirsiniz.</p>`,
  (t) => `<p>İleri düzey konuları adım adım işleyen bu kaynak, ${t.publisher} standartlarında üretilmiştir. ${t.lessonLabel} alanında sıklıkla karşılaşılan zorlayıcı soru tiplerini kapsayan yapısıyla adayların sınav performansını yükseltmeyi hedefler. Her soru detaylı çözüm analiziyle desteklenmektedir.</p>`,
  (t) => `<p>Alan sınavının gerektirdiği analitik düşünme ve problem çözme becerilerini geliştirmeye odaklanan bu kitap, ${t.lessonLabel} müfredatına özel kapsamlı konu anlatımı ve pratik test bölümleriyle donatılmıştır. ${t.author ? t.author + "'ın " : ""}uzmanlığıyla hazırlanan içerik, kalıcı öğrenme sağlar.</p>`,
  (t) => `<p>Her konunun sonunda yer alan çözümlü sorular ve analitik değerlendirme bölümleri, öğrencilerin ${t.lessonLabel} dersindeki güçlü ve zayıf alanlarını belirleyerek hedefli çalışma yapmasına yardımcı olur. ${t.publisher} kalitesiyle sunulan bu eser, AYT hazırlığında güvenilir bir yol arkadaşıdır.</p>`,
  (t) => `<p>Puan türüne özel ${t.lessonLabel} konu dağılımı ve zorluk derecesine göre sınıflandırılmış sorular, adayların stratejik bir hazırlık yapmasını mümkün kılar. ${t.publisher} etiketiyle yayımlanmış bu kaynak, bireysel çalışma düzeni için optimize edilmiştir.</p>`
];

const FAQ_POOL = [
  { question: "Bu kitap hangi puan türüne yöneliktir?", answer: "Kitap, AYT sınavındaki ilgili puan türüne yönelik konuları kapsamlı bir şekilde işlemektedir." },
  { question: "AYT'nin tüm konularını içeriyor mu?", answer: "Kitap, ürün adı ve kapsamına uygun AYT konularını müfredat doğrultusunda eksiksiz olarak sunmaktadır." },
  { question: "Çözümler detaylı mı?", answer: "Evet, her sorunun detaylı ve adım adım çözümü sunulmakta, böylece öğrenciler kendi eksiklerini kolayca tespit edebilmektedir." },
  { question: "Konu anlatımı da var mı?", answer: "Ürünün türüne göre konu anlatımı, özet bilgi kutuları veya soru bankası formatında içerik sunulmaktadır." },
  { question: "Zorluk seviyesi nedir?", answer: "AYT sınavının gerektirdiği ileri düzey sorular içermekte olup, temel bilgilere hakim öğrenciler için uygundur." },
  { question: "Deneme sınavı formatında mı?", answer: "Ürünün kapsamına göre konu testleri, bölüm denemeleri veya genel deneme sınavları barındırabilir." },
  { question: "Kimler için uygundur?", answer: "AYT oturumuna hazırlanan lise 11-12. sınıf öğrencileri ve mezun adaylar için idealdir." }
];

function buildSinavAytDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const author = getAuthor(facts);
  const publisher = getPublisher(facts);

  const lessonLabel = facts.lesson ? `AYT ${facts.lesson} dersinin tüm` : "AYT'nin tüm";
  const templateData = { title: facts.title, author, publisher, lessonLabel };

  const introFn = pickVariation(INTRO_POOL, seed);
  const detailFn = pickVariationOffset(DETAIL_POOL, seed, 1);

  const intro = introFn(templateData);
  const detail = detailFn(templateData);

  const tableRows = [
    { key: "Marka / Yayınevi", value: publisher },
    { key: "Yazar", value: author },
    { key: "Ders / Alan", value: facts.lesson ? `${facts.lesson} (AYT)` : "AYT Alan" },
    { key: "Sınav", value: "YKS - AYT (Alan Yeterlilik Testi)" },
    { key: "Sınıf Seviyesi", value: facts.classLevel || "Lise (11-12. Sınıf) ve Mezun" },
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

module.exports = { buildSinavAytDescription };
