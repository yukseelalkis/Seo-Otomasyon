/**
 * Atatürk Kitapları — Edebiyat Alt Kategorisi
 * Atatürk, Cumhuriyet, aydınlanma, ulusal bağımsızlık temalı eserler
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
  (t) => `<p><strong>${t.title}</strong>, Atatürk'ün akılcılık, aydınlanmacılık ve bilimcilik ilkelerini derinlemesine inceleyen vizyoner bir eserdir. Kitap, okuyucuya Cumhuriyet'in kuruluş felsefesini ve Atatürk'ün manevi mirasını etkili bir üslupla aktarmaktadır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, Türk milletinin bağımsızlık mücadelesini ve Mustafa Kemal Atatürk'ün liderlik vizyonunu anlatan kapsamlı bir eserdir. Cumhuriyet tarihinin dönüm noktalarını aydınlatarak okurlara eşsiz bir perspektif sunar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, Atatürk'ün devrimcilik ve cumhuriyetçilik ilkelerini günümüz perspektifinden değerlendiren özgün bir çalışmadır. Milliyetçilik, halkçılık ve devletçilik gibi temel kavramları anlaşılır bir dille ele alır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, Atatürk düşünce sistemini ve Cumhuriyet'in kuruluş sürecini tarihsel belgeler ışığında inceleyen değerli bir kaynaktır. Modern Türkiye'nin fikri temellerini anlamak isteyen okurlar için bir başucu eseridir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, Mustafa Kemal Atatürk'ün çağdaşlaşma vizyonunu, reformlarını ve toplumsal dönüşüm hedeflerini kapsamlı şekilde ele alan bir eserdir. Aydınlanmacı düşüncenin izleri bu eserde derinlemesine incelenmektedir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, Atatürk'ün bilim, akıl ve çağdaşlık üzerine kurduğu düşünce sistemini okuyuculara aktaran, araştırma ve inceleme niteliğinde bir yapıttır. Cumhuriyet değerlerini anlamak isteyenler için önemli bir kaynaktır.</p>`,
  (t) => `<p>Tarih sahnesinde modern Türkiye'nin temellerini atan vizyonu anlamak için <strong>${t.title}</strong>, okuyucuya zengin bir içerik ve derin tahliller sunuyor. Cumhuriyet'in kazanımlarını ve Atatürkçü düşünceyi merkeze alan bu çalışma, geçmişten geleceğe ışık tutuyor.</p>`,
  (t) => `<p><strong>${t.title}</strong>, Atatürk ilke ve inkılaplarının toplumsal ve siyasal izdüşümlerini tarafsız bir perspektifle ele alan nitelikli bir eserdir. Eserdeki tarihsel veriler, Cumhuriyet aydınlanmasını daha iyi kavramanıza yardımcı olur.</p>`,
  (t) => `<p>Atatürk'ün "en büyük eserim" dediği Cumhuriyet'in fikri altyapısını ve gelişimini konu alan <strong>${t.title}</strong>, her kütüphanede bulunması gereken bir temel yapıttır. Yazarın akıcı anlatımı, karmaşık tarihsel süreçleri anlaşılır kılıyor.</p>`,
  (t) => `<p><strong>${t.title}</strong>, Mustafa Kemal Atatürk'ün çağdaşlık ve bağımsızlık ideallerini savunan, bu ideallerin güncel değerini vurgulayan ilham verici bir kitaptır. Türk toplumunun modernleşme serüvenini etkileyici bir dille özetler.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>Eserde yer alan tarihsel süreçler, belgesel niteliğindeki alıntılar ve kronolojik akış sayesinde okuyucu, Atatürk'ün düşünce dünyasını bütünsel olarak kavrama fırsatı bulur. ${t.publisher} tarafından yayımlanan bu eser, akademik titizlikle hazırlanmış içeriğiyle öne çıkar.</p>`,
  (t) => `<p>Toplumsal gelişimin ve değişimin temel taşı olan bu vizyon, eserin ana hatlarını oluşturur. ${t.publisher} etiketiyle okuyuculara sunulan bu kitap, Atatürk'ün ilkelerini güncel bir bakış açısıyla yorumlayarak kalıcı bir referans kaynağı niteliği taşır.</p>`,
  (t) => `<p>Kitap, çetin zorluklar karşısında aklın ve bilimin nasıl rehber edinilmesi gerektiğini somut örneklerle anlatmaktadır. ${t.publisher} güvencesiyle sunulan bu eser, Atatürkçü düşünce yapısını anlamak isteyen herkes için titizlikle kaleme alınmıştır.</p>`,
  (t) => `<p>Atatürk'ün bıraktığı eşsiz manevi miras, bu eserde akademik bir disiplin ve akıcı bir anlatımla harmanlanmıştır. ${t.publisher} tarafından basılan kitap, tarih meraklıları ve araştırmacılar için vazgeçilmez bir kaynak olmayı hedefler.</p>`,
  (t) => `<p>Eser boyunca Cumhuriyet tarihinin kritik dönemeçleri, liderlik anlayışı ve toplumsal dönüşüm süreci detaylı bir şekilde irdelenmektedir. ${t.publisher} kalitesiyle okuyuculara ulaşan bu kitap, kapsamlı içeriğiyle dikkat çeker.</p>`
];

const FAQ_POOL = [
  { question: "Bu kitabın ana konusu nedir?", answer: "Kitap, Atatürk'ün akıl ve bilimcilik başta olmak üzere temel ilkelerini ve Türk halkına bıraktığı manevi vasiyeti incelemektedir." },
  { question: "Kitap kimlere hitap etmektedir?", answer: "Atatürkçü düşünce sistemini, Cumhuriyet tarihini ve aydınlanma sürecini anlamak isteyen tüm okurlara hitap eder." },
  { question: "Eserde hangi tarihi dönemler ele alınmaktadır?", answer: "Kurtuluş Savaşı'ndan Cumhuriyet'in ilanına ve sonrasındaki reform sürecine kadar geniş bir tarihsel yelpaze incelenmektedir." },
  { question: "Akademik bir çalışma mıdır?", answer: "Evet, belgesel niteliğinde kaynaklara ve tarihsel verilere dayanan araştırma-inceleme türünde bir eserdir." },
  { question: "Atatürk'ün hangi ilkeleri özellikle vurgulanmaktadır?", answer: "Akılcılık, bilimcilik, devrimcilik, cumhuriyetçilik, milliyetçilik ve halkçılık ilkeleri eser boyunca derinlemesine işlenmektedir." },
  { question: "Öğrenciler için uygun mudur?", answer: "Evet, lise ve üniversite öğrencileri başta olmak üzere Cumhuriyet tarihi ve Atatürkçü düşünce konularında bilgi edinmek isteyen herkes için uygundur." },
  { question: "Kitap günümüz sorunlarına da değiniyor mu?", answer: "Atatürk'ün ilkeleri güncel bir perspektifle ele alınarak, çağdaş toplumsal meselelere ışık tutulmaktadır." }
];

function buildEdebiyatAtaturkDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const author = getAuthor(facts);
  const publisher = getPublisher(facts);

  const templateData = { title: facts.title, author, publisher };

  const introFn = pickVariation(INTRO_POOL, seed);
  const detailFn = pickVariationOffset(DETAIL_POOL, seed, 1);

  const intro = introFn(templateData);
  const detail = detailFn(templateData);

  const tableRows = [
    { key: "Yazar", value: author },
    { key: "Yayınevi", value: publisher },
    { key: "Ürün Tipi", value: facts.publicationType || "Kitap (Araştırma - İnceleme)" },
    { key: "Konu", value: "Atatürk / Cumhuriyet Tarihi" },
    { key: "Dil", value: "Türkçe" },
    { key: "Sayfa Sayısı", value: facts.sayfaSayisi || "" },
    { key: "ISBN", value: facts.isbn || "" },
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

module.exports = { buildEdebiyatAtaturkDescription };
