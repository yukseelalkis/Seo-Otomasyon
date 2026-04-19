/**
 * TYT Kitapları — Sınav Alt Kategorisi
 * TYT hazırlık, soru bankası, deneme, konu anlatım
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
  (t) => `<p><strong>${t.title}</strong>, TYT sınavında yüksek netlere ulaşmak isteyen adaylar için ${t.publisher} tarafından özenle hazırlanmış kapsamlı bir kaynaktır. ÖSYM'nin güncel soru tarzlarına ve yeni nesil soru formatına tam uyumlu içeriğiyle sınav sürecinizin en güçlü yardımcısıdır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, YKS-TYT oturumuna hazırlanan öğrencilerin temel yetenek ve temel matematik becerilerini güçlendirmesi için ${t.publisher} güvencesiyle tasarlanmış stratejik bir kaynaktır. Güncel müfredata tam uyumlu yapısıyla sistematik bir hazırlık sunar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, TYT'de fark yaratmak isteyen adaylar için ${t.publisher} kalitesiyle hazırlanmış, konuları sistematik bir yaklaşımla ele alan ve sınav pratiği kazandıran etkili bir çalışma materyalidir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, üniversite sınavına hazırlanan tüm adayların TYT oturumundaki başarısını artırmak amacıyla ${t.publisher} tarafından titizlikle oluşturulmuş bir kaynak kitaptır. Konu kavrama ve soru çözme pratiğini bir arada sunar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, TYT sınavında hedeflediğiniz netlere ulaşmanız için gereken tüm bilgi ve pratiği tek bir kaynakta sunan, ${t.publisher} etiketiyle yayımlanmış kapsamlı bir hazırlık kitabıdır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, TYT müfredatının tüm kazanımlarını kapsayan ve öğrencilere sistematik bir çalışma düzeni sunan nitelikli bir kaynaktır. ${t.publisher} güvencesiyle hazırlanmıştır.</p>`,
  (t) => `<p>Üniversite hazırlık maratonunun ilk ve en kritik aşaması olan TYT'de <strong>${t.title}</strong>, ${t.publisher} uzmanlığıyla geliştirilen soru kalitesi ve müfredat uyumuyla adaylara zaman kazandıran bir rehberdir.</p>`,
  (t) => `<p>${t.publisher} güvencesiyle sunulan <strong>${t.title}</strong>, adayların TYT oturumunda hem hız hem de doğruluk oranlarını artırmayı hedefleyen, yeni nesil kurgusal sorularla desteklenmiş nitelikli bir hazırlık materyalidir.</p>`,
  (t) => `<p>Adayların temel yeterliliklerini pekiştiren <strong>${t.title}</strong>, TYT sınav formasına uygun pratik yapmanızı sağlayan yapısı ve ${t.publisher} kalitesiyle eğitim hayatınızdaki önemli bir boşluğu doldurur.</p>`,
  (t) => `<p><strong>${t.title}</strong>, sınav hazırlık sürecini daha verimli ve düzenli hale getirmek isteyenler için ${t.publisher} tarafından özel olarak kurgulanmış, konuları temelden alıp ileri seviyeye taşıyan bir eğitim kaynağıdır.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>${t.author ? t.author + "'ın stratejik ipuçlarıyla desteklenen tamamı çözümlü bu kitap; " : "Tamamı çözümlü bu kitap; "}${t.lessonLabel} konularını eksiksiz tarayarak öğrencilerin konu eksiklerini hızla kapatmasına olanak tanır. Üstelik internet bağlantısına ihtiyaç duymadan, şemalı ve tüm şıkları irdeleyen analizli yazılı çözümler sayesinde nerede olursanız olun eksiklerinizi anında giderebilirsiniz.</p>`,
  (t) => `<p>Konu anlatımı, çözümlü örnekler ve pekiştirme testlerinin bir arada sunulduğu bu kaynak, ${t.publisher} standartlarıyla üretilmiştir. ${t.lessonLabel} konularını sistematik bir sırayla işleyerek verimli bir hazırlık sağlar. ${t.author ? t.author + "'ın eğitim yaklaşımıyla " : ""}her soru detaylı çözüm analiziyle desteklenmektedir.</p>`,
  (t) => `<p>Her bölüm sonunda yer alan konu testleri ve genel tekrar denemeleriyle ${t.lessonLabel} müfredatının kalıcı olarak öğrenilmesi hedeflenir. ${t.author ? t.author + " tarafından " : ""}uygulamalı bir yaklaşımla hazırlanan bu kitap, sınav pratiği kazandırmaya ve analitik düşünme becerilerini geliştirmeye odaklanır.</p>`,
  (t) => `<p>ÖSYM formatında hazırlanmış ${t.lessonLabel} soruları ve detaylı analitik çözümler, öğrencilerin güçlü ve zayıf yönlerini belirlemesine yardımcı olur. ${t.publisher} kalitesi ve eğitim odaklı yapısıyla öne çıkan bu kaynak, düzenli çalışma planını destekler ve sınav stratejisi geliştirmenize katkı sağlar.</p>`,
  (t) => `<p>${t.lessonLabel} dersinde başarıyı belirleyen temel konulara odaklanan bu kitap, hem konu tekrarı hem de soru çözümü için dengeli bir yapı sunar. ${t.author ? t.author + " rehberliğinde " : ""}hazırlanan içerik, öğrencilerin özgüvenini artırmayı ve sınav kaygısını minimize etmeyi hedefler.</p>`
];

const FAQ_POOL = [
  { question: "Kitaptaki sorular güncel ÖSYM tarzında mı?", answer: "Evet, kitap tamamen güncel YKS-TYT müfredatına ve ÖSYM'nin yeni nesil soru tarzına uygun olarak hazırlanmıştır." },
  { question: "TYT'nin tüm derslerini kapsıyor mu?", answer: "Kitap, ürün adı ve kapsamına uygun dersleri TYT müfredatı doğrultusunda eksiksiz olarak işlemektedir." },
  { question: "Çözümlere internet olmadan ulaşabilir miyim?", answer: "Evet, kitap içerisinde yer alan şemalı ve detaylı yazılı çözümler sayesinde internete ihtiyaç duymadan çalışabilirsiniz." },
  { question: "Bireysel çalışma için uygun mu?", answer: "Evet, adım adım ilerleyen yapısı ve tamamı çözümlü soruları sayesinde öğretmen desteği olmadan da verimli bir şekilde çalışabilirsiniz." },
  { question: "Hangi sınıf seviyesi için uygundur?", answer: "TYT oturumuna hazırlanan tüm lise öğrencileri ve mezun adaylar için uygundur." },
  { question: "Konu anlatımı da içeriyor mu?", answer: "Ürünün türüne göre konu anlatımı, soru bankası veya deneme formatında içerik sunulmaktadır; detaylar ürün açıklamasında belirtilmiştir." },
  { question: "Kaç soru içermektedir?", answer: "Soru sayısı ürünün kapsamına göre değişmekle birlikte, tüm konuları yeterli soru çeşitliliğiyle kapsamaktadır." }
];

function buildSinavTytDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const author = getAuthor(facts);
  const publisher = getPublisher(facts);

  const lessonLabel = facts.lesson ? `TYT ${facts.lesson} dersinin tüm` : "TYT'nin tüm";
  const templateData = { title: facts.title, author, publisher, lessonLabel };

  const introFn = pickVariation(INTRO_POOL, seed);
  const detailFn = pickVariationOffset(DETAIL_POOL, seed, 1);

  const intro = introFn(templateData);
  const detail = detailFn(templateData);

  const tableRows = [
    { key: "Marka / Yayınevi", value: publisher },
    { key: "Yazar", value: author },
    { key: "Ders / Alan", value: facts.lesson ? `${facts.lesson} (TYT)` : "TYT Genel" },
    { key: "Sınav", value: "YKS - TYT (Temel Yeterlilik Testi)" },
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

module.exports = { buildSinavTytDescription };
