/**
 * YDS Kitapları — Sınav Alt Kategorisi
 * YDS/YÖKDİL yabancı dil sınavı hazırlık kitapları
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
  (t) => `<p><strong>${t.title}</strong>, YDS sınavında yüksek puan hedefleyen adaylar için ${t.publisher} tarafından hazırlanmış kapsamlı bir yabancı dil kaynağıdır. Güncel sınav formatına tam uyumlu içeriğiyle akademik kariyer hedeflerinize ulaşmanızda güçlü bir destek sunar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, YDS ve YÖKDİL sınavlarına hazırlanan akademisyen, öğretmen ve yüksek lisans adayları için ${t.publisher} güvencesiyle üretilmiş stratejik bir kaynak kitaptır. Dilbilgisi, kelime bilgisi ve okuma becerilerini sistematik olarak geliştirmeyi hedefler.</p>`,
  (t) => `<p><strong>${t.title}</strong>, YDS sınavının tüm bölümlerini kapsayan ve adayların İngilizce yeterlilik seviyesini artırmaya yönelik tasarlanmış, ${t.publisher} kalitesinde bir hazırlık kaynağıdır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, yabancı dil sınavlarında başarıyı garantilemek isteyen adaylara, ${t.publisher} etiketiyle sunulan kapsamlı ve stratejik bir çalışma rehberidir. Akademik İngilizce'nin tüm yönlerini ele almaktadır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, YDS sınavına sistematik bir yaklaşımla hazırlanmak isteyen adaylar için ${t.publisher} tarafından titizlikle oluşturulmuş nitelikli bir kaynaktır. Sınavın gerektirdiği dil yetkinliğini kazandırmaya odaklanır.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>${t.author ? t.author + " tarafından hazırlanan tamamı çözümlü bu kaynak, " : "Tamamı çözümlü bu kaynak, "}YDS sınavının çeviri, dilbilgisi, kelime bilgisi ve paragraf yorumlama bölümlerini detaylı bir şekilde ele alır. Stratejik çözüm teknikleri ve pratik ipuçları ile sınav süresini verimli kullanmanıza yardımcı olur.</p>`,
  (t) => `<p>Akademik düzeyde İngilizce metin okuma ve yorumlama becerisini geliştiren bu kitap, ${t.publisher} standartlarında üretilmiştir. YDS'de sıklıkla karşılaşılan soru tiplerini kapsayan yapısıyla hedef puanınıza ulaşmanızı destekler.</p>`,
  (t) => `<p>Her bölümde yer alan tamamı çözümlü sorular ve detaylı dilbilgisi açıklamaları, adayların zayıf alanlarını hızla tespit etmesine olanak tanır. ${t.author ? t.author + "'ın " : ""}deneyimiyle şekillenen içerik, sonuç odaklı bir hazırlık sunar.</p>`,
  (t) => `<p>Kelime havuzu çalışmaları, cloze test pratikleri ve paragraf tamamlama bölümleri ile donatılmış bu kaynak, YDS sınavının tüm boyutlarını kapsayan bütünsel bir çalışma deneyimi sunar. ${t.publisher} güvencesiyle yayımlanmıştır.</p>`
];

const FAQ_POOL = [
  { question: "YDS sınavının tüm bölümlerini kapsıyor mu?", answer: "Evet, kitap dilbilgisi, kelime bilgisi, çeviri ve paragraf yorumlama gibi YDS'nin tüm bölümlerini kapsamaktadır." },
  { question: "YÖKDİL sınavı için de kullanılabilir mi?", answer: "Evet, YDS ve YÖKDİL sınavları benzer formatta olduğundan bu kaynak her iki sınav için de etkili bir hazırlık sunar." },
  { question: "Hangi dil seviyesine hitap eder?", answer: "Orta ve üzeri İngilizce seviyesindeki adayların sınav performansını artırmaya yönelik tasarlanmıştır." },
  { question: "Çözümler detaylı mı?", answer: "Evet, soruların tamamı detaylı açıklamalarla çözümlenmiştir, böylece hatalarınızı analiz edebilirsiniz." },
  { question: "Akademik kariyer için yeterli mi?", answer: "YDS puanı gerektiren akademik atama ve yüksek lisans başvurularına yönelik kapsamlı bir hazırlık sunar." },
  { question: "Kelime çalışması bölümü var mı?", answer: "Evet, YDS'de sıklıkla çıkan akademik kelime ve deyimleri kapsayan özel bölümler içermektedir." }
];

function buildSinavYdsDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const author = getAuthor(facts);
  const publisher = getPublisher(facts);

  const templateData = { title: facts.title, author, publisher };

  const introFn = pickVariation(INTRO_POOL, seed);
  const detailFn = pickVariationOffset(DETAIL_POOL, seed, 1);

  const intro = introFn(templateData);
  const detail = detailFn(templateData);

  const tableRows = [
    { key: "Marka / Yayınevi", value: publisher },
    { key: "Yazar", value: author },
    { key: "Sınav", value: "YDS / YÖKDİL" },
    { key: "Ders / Alan", value: facts.lesson || "İngilizce" },
    { key: "Ürün Tipi", value: facts.publicationType || "Soru Bankası" },
    { key: "Sayfa Sayısı", value: facts.sayfaSayisi || "" },
    { key: "Ebat", value: facts.ebat || "" },
    { key: "Çözüm Tipi", value: "Tamamı Çözümlü" },
    { key: "Dil", value: "Türkçe / İngilizce" },
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

module.exports = { buildSinavYdsDescription };
