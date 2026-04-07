/**
 * KPSS / ALES / DGS Kitapları — Sınav Alt Kategorisi
 * Memur adayları ve lisansüstü geçiş sınavlarına hazırlık
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

function detectExamLabel(title) {
  const upper = String(title).toUpperCase();
  if (upper.includes("KPSS") && upper.includes("ALES")) return "KPSS & ALES";
  if (upper.includes("KPSS") && upper.includes("DGS")) return "KPSS & DGS";
  if (upper.includes("ALES") && upper.includes("DGS")) return "ALES & DGS";
  if (upper.includes("KPSS")) return "KPSS";
  if (upper.includes("ALES")) return "ALES";
  if (upper.includes("DGS")) return "DGS";
  return "KPSS / ALES / DGS";
}

const INTRO_POOL = [
  (t) => `<p><strong>${t.title}</strong>, ${t.examLabel} sınavında yüksek puan hedefleyen adaylar için ${t.publisher} tarafından özel olarak hazırlanmıştır. ÖSYM'nin yeni nesil soru tarzına ve güncel müfredata tam uyumlu içeriğiyle sınav sürecinizdeki en güçlü rehberinizdir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.examLabel} sınavına hazırlanan adayların bilgi düzeyini artırması ve sınav pratiği kazanması için ${t.publisher} güvencesiyle tasarlanmış kapsamlı bir kaynaktır. Güncel sınav formatına tam uyumlu yapısıyla sistematik bir hazırlık sunar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.examLabel} sınavında başarılı olmak isteyen adaylara sistematik bir çalışma planı sunan, ${t.publisher} kalitesinde üretilmiş stratejik bir hazırlık kitabıdır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, memur adaylarının ve lisansüstü eğitim hedefleyenlerin ${t.examLabel} sınavında yüksek netlere ulaşması için ${t.publisher} tarafından titizlikle hazırlanmış etkili bir kaynaktır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.examLabel} müfredatının tüm konularını kapsayan ve adayların sınav performansını en üst düzeye çıkarmayı hedefleyen, ${t.publisher} etiketiyle yayımlanmış nitelikli bir çalışma materyalidir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.examLabel} sınavına odaklanmış, konuları güncel soru trendleriyle uyumlu bir şekilde ele alan ve ${t.publisher} güvencesiyle sunulan kapsamlı bir kaynak kitaptır.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>${t.author ? t.author + "'ın stratejik ipuçlarıyla desteklenen tamamı çözümlü bu kitap; " : "Tamamı çözümlü bu kitap; "}${t.lessonLabel} konularını eksiksiz taramaktadır. Üstelik internet bağlantısına ihtiyaç duymadan, şemalı ve tüm şıkları irdeleyen analizli yazılı çözümler sayesinde nerede olursanız olun eksiklerinizi anında giderebilirsiniz.</p>`,
  (t) => `<p>Konuları sınav ağırlıklarına göre dengeli bir şekilde dağıtan bu kaynak, ${t.publisher} standartlarıyla üretilmiştir. ${t.examLabel} formatına uygun ${t.lessonLabel} soruları ve kapsamlı çözümler ile adayların özgüvenini artırmayı hedefler.</p>`,
  (t) => `<p>Genel yetenek, genel kültür ve alan bilgisi konularını bütünsel olarak ele alan bu kitap, ${t.author ? t.author + " tarafından " : ""}pratik ve etkin bir çalışma deneyimi sunmak üzere hazırlanmıştır. ${t.lessonLabel} alanındaki her bölüm sonunda konu pekiştirme testleri yer almaktadır.</p>`,
  (t) => `<p>Sınav stratejileri ve zaman yönetimi ipuçlarıyla zenginleştirilen bu kaynak, ${t.examLabel} adaylarının en sık sorduğu soruları karşılayan detaylı bir içerik sunar. ${t.publisher} güvencesiyle yayımlanan bu kitap, ${t.lessonLabel} çalışmanızı destekleyen bir yapıya sahiptir.</p>`,
  (t) => `<p>Her konunun sonunda yer alan çözümlü sorular ve detaylı açıklamalar, adayların ${t.lessonLabel} dersindeki güçlü ve zayıf alanlarını belirleyerek verimli bir hazırlık yapmasına olanak tanır. ${t.publisher} kalitesiyle sunulan bu kaynak, ${t.examLabel} sürecinde güvenilir bir yol arkadaşıdır.</p>`
];

const FAQ_POOL = [
  { question: "Kitaptaki sorular güncel sınav formatına uygun mu?", answer: "Evet, kitap tamamen güncel müfredata ve ÖSYM'nin yeni nesil sınav formatına uygun olarak hazırlanmıştır." },
  { question: "Çözümlere internet olmadan ulaşabilir miyim?", answer: "Evet, kitap içerisinde yer alan şemalı ve detaylı yazılı çözümler sayesinde internete ihtiyaç duymadan çalışabilirsiniz." },
  { question: "Genel yetenek ve genel kültür konularını kapsıyor mu?", answer: "Kitap, ürün kapsamına uygun olarak ilgili konuları müfredat doğrultusunda eksiksiz işlemektedir." },
  { question: "Bireysel çalışma için uygun mu?", answer: "Evet, tamamı çözümlü yapısı sayesinde bireysel çalışma için son derece uygundur." },
  { question: "Hangi adaylar için uygundur?", answer: "Memur adayları, lisansüstü eğitim hedefleyen veya kariyer geçişi planlayan tüm adaylar için uygundur." },
  { question: "Deneme sınavı içeriyor mu?", answer: "Ürünün türüne göre konu testleri veya deneme sınavları barındırabilir; detaylar ürün açıklamasında belirtilmiştir." },
  { question: "Kaç soru içermektedir?", answer: "Soru sayısı ürünün kapsamına göre değişmekle birlikte, müfredattaki tüm konular yeterli soru çeşitliliğiyle kapsanmaktadır." }
];

function buildSinavKpssAlesDgsDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const author = getAuthor(facts);
  const publisher = getPublisher(facts);
  const examLabel = detectExamLabel(facts.title);
  const lessonLabel = facts.lesson ? `${examLabel} ${facts.lesson} dersinin tüm` : `${examLabel} Genel Yetenek ve Genel Kültür`;

  const templateData = { title: facts.title, author, publisher, examLabel, lessonLabel };

  const introFn = pickVariation(INTRO_POOL, seed);
  const detailFn = pickVariationOffset(DETAIL_POOL, seed, 1);

  const intro = introFn(templateData);
  const detail = detailFn(templateData);

  const tableRows = [
    { key: "Marka / Yayınevi", value: publisher },
    { key: "Yazar", value: author },
    { key: "Ders / Alan", value: facts.lesson ? `${facts.lesson} (${examLabel})` : `${examLabel} Genel` },
    { key: "Sınav", value: examLabel },
    { key: "Ürün Tipi", value: facts.publicationType || "Soru Bankası" },
    { key: "Sayfa Sayısı", value: facts.sayfaSayisi || "" },
    { key: "Ebat", value: facts.ebat || "" },
    { key: "Çözüm Tipi", value: "Tamamı Çözümlü" },
    { key: "Müfredat Uyumu", value: "Güncel Müfredat" },
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

module.exports = { buildSinavKpssAlesDgsDescription };
