/**
 * Kırtasiye & Okul Gereçleri — Şablon Jeneratörü
 * Alt kategoriye göre dinamik içerik (kalem, boya, yapıştırıcı, makas, hamur, vb.)
 */
const {
  pickVariation,
  pickVariationOffset,
  buildStyledTable,
  buildFaqBlock,
  buildClosingParagraph
} = require("../../../helpers/books_helper");

// ============================================================
// ALT KATEGORİ TESPİTİ
// ============================================================
function detectSubType(facts) {
  const t = (facts.title || "").toLocaleLowerCase("tr-TR");
  const c = (facts.subCategory || facts.category || "").toLocaleLowerCase("tr-TR");
  const all = `${t} ${c}`;

  if (/oyun hamuru|play dough|hamur seti/i.test(all)) return "hamur";
  if (/yapıştırıcı|yapistirici|uhu|pritt/i.test(all)) return "yapistirici";
  if (/pastel boya/i.test(all)) return "pastel";
  if (/kuru ?boya|colour pencil/i.test(all)) return "kuruboya";
  if (/sulu ?boya|water col/i.test(all)) return "suluboya";
  if (/parmak boya/i.test(all)) return "parmakboya";
  if (/keçeli kalem|keceli|felt/i.test(all)) return "keceli";
  if (/fırça uçlu|firca uclu|brush/i.test(all)) return "firca";
  if (/fosforlu|highlight/i.test(all)) return "fosforlu";
  if (/tükenmez|tukenmez|ball ?pen/i.test(all)) return "tukenmez";
  if (/roller/i.test(all)) return "roller";
  if (/versatil|mekanik kalem|mechanical/i.test(all)) return "versatil";
  if (/kurşun kalem|kursun kalem|pencil/i.test(all)) return "kursunkalem";
  if (/kalem ucu|uç 0\./i.test(all)) return "kalemUcu";
  if (/silgi|eraser/i.test(all)) return "silgi";
  if (/kalemtıraş|kalemtras|sharpener/i.test(all)) return "kalemtiras";
  if (/makas|scissor/i.test(all)) return "makas";
  if (/cetvel|pergel|çizim seti|olcu|ölçü/i.test(all)) return "cizimSeti";
  if (/eva|simli|keçe|kece|foam/i.test(all)) return "eva";
  if (/defter|notebook/i.test(all)) return "defter";
  if (/sticker|etiket/i.test(all)) return "sticker";
  if (/boya/i.test(all)) return "genelBoya";
  return "genel";
}

// ============================================================
// GİRİŞ HAVUZLARI (Alt kategoriye göre)
// ============================================================
const INTRO_POOLS = {
  kursunkalem: [
    (t) => `<p><strong>${t.title}</strong>, okul ve ofis kullanımı için ideal, pürüzsüz yazım deneyimi sunan yüksek kaliteli bir kurşun kalemdir. Ergonomik gövde tasarımı sayesinde uzun süreli yazımlarda eli yormaz.</p>`,
    (t) => `<p><strong>${t.title}</strong>, hem not alırken hem de çizim yaparken dengeli performans sunan, ${t.brand} güvencesiyle üretilmiş dayanıklı bir yazım gerecidir.</p>`,
    (t) => `<p>Sıradan kalemlerden sıkılanlar için tasarlanan <strong>${t.title}</strong>, estetik tasarımı ve yumuşak yazım hissiyle masanıza enerji katar. Okul, ofis ve kişisel kullanım için idealdir.</p>`
  ],
  hamur: [
    (t) => `<p>Çocukların motor becerilerini geliştirmek ve yaratıcılıklarını serbest bırakmak için tasarlanan <strong>${t.title}</strong>, yumuşak ve kolay şekil alan yapısıyla öne çıkar. Canlı renk seçenekleri sayesinde hayal gücünü harekete geçirir.</p>`,
    (t) => `<p><strong>${t.title}</strong>, küçük ellerin güvenle oynayabileceği, toksik madde içermeyen ve sağlığa zararsız özel formülüyle üretilmiş bir oyun hamurudur. Kreş ve anaokulu etkinliklerinin vazgeçilmez materyalidir.</p>`
  ],
  yapistirici: [
    (t) => `<p><strong>${t.title}</strong>, okul, ev ve ofis projelerinde kağıt, karton ve keçe gibi materyalleri güvenle birleştirmek için geliştirilmiş çok amaçlı bir yapıştırıcıdır. Solventsiz ve kokusuz formülü sayesinde çocukların kullanımına tamamen uygundur.</p>`,
    (t) => `<p>El işi projelerinden ofis kullanımına kadar geniş bir yelpazede güçlü yapışma sağlayan <strong>${t.title}</strong>, şeffaf kuruma teknolojisi sayesinde yüzeylerde iz bırakmaz.</p>`
  ],
  pastel: [
    (t) => `<p><strong>${t.title}</strong>, canlı renkleri ve yumuşak sürümüyle özellikle okul öncesi ve ilkokul çağındaki çocukların resim yapma becerilerini geliştirmek için özenle tasarlanmış bir settir.</p>`,
    (t) => `<p>Kağıt, karton, tahta ve taş gibi farklı yüzeylerde mükemmel sonuçlar sunan <strong>${t.title}</strong>, yüksek örtücülük özelliği sayesinde yaratıcı projelerde kesintisiz bir deneyim sağlar.</p>`
  ],
  makas: [
    (t) => `<p><strong>${t.title}</strong>, güvenli tasarımı ve ergonomik tutuşuyla çocukların ince motor becerilerini geliştirmesi için özel olarak tasarlanmış bir okul gerecidir.</p>`,
    (t) => `<p>Hafif gövdesi ve güvenli uçlarıyla küçük eller için en uygun kesim deneyimini sunan <strong>${t.title}</strong>, kreş ve anaokulu etkinliklerinin yardımcısıdır.</p>`
  ],
  silgi: [
    (t) => `<p><strong>${t.title}</strong>, kağıt yüzeyine zarar vermeden temiz ve kalıntısız silme performansı sunan, okul ve ofis kullanımı için tasarlanmış kaliteli bir silgidir.</p>`,
    (t) => `<p>Yumuşak dokusu sayesinde kağıdı yıpratmadan mükemmel silme deneyimi sunan <strong>${t.title}</strong>, her yaş grubu için idealdir.</p>`
  ],
  kalemtiras: [
    (t) => `<p><strong>${t.title}</strong>, dayanıklı çelik bıçak sistemi sayesinde kalemlerinizin ucunu kırmadan pürüzsüzce açar. Ergonomik tasarımı ile pratik kullanım sunar.</p>`,
    (t) => `<p>Hem standart hem de kalın boy kalemleri mükemmel bir açıyla sivrilten <strong>${t.title}</strong>, geniş atık haznesi ve sızdırmaz kapağıyla çanta dostu bir gerecidir.</p>`
  ],
  cizimSeti: [
    (t) => `<p><strong>${t.title}</strong>, okul ve teknik çizim projelerinizde ihtiyaç duyduğunuz tüm materyalleri bir araya getiren, dayanıklı ve esnek yapıda bir çizim setidir.</p>`,
    (t) => `<p>Geometri derslerinden teknik çizime kadar geniş bir kullanım alanı sunan <strong>${t.title}</strong>, kırılmaz esnek yapısıyla çanta içinde güvenle taşınabilir.</p>`
  ],
  _default: [
    (t) => `<p><strong>${t.title}</strong>, ${t.brand} markasının kaliteli üretim standartlarıyla hazırlanmış, okul ve ofis kullanımına uygun çok yönlü bir kırtasiye ürünüdür.</p>`,
    (t) => `<p>Günlük kullanımdan profesyonel projelere kadar geniş bir yelpazede çözüm sunan <strong>${t.title}</strong>, dayanıklı yapısı ve şık tasarımıyla öne çıkar.</p>`
  ]
};

// ============================================================
// DETAY HAVUZLARI
// ============================================================
const DETAIL_POOLS = {
  kursunkalem: [
    (t) => `<p>İdeal yazım sertliği sayesinde kağıt üzerinde takılmadan kayar, pürüzsüz bir yazım deneyimi sunar. ${t.brand} özel üretim teknolojisi sayesinde ucu kırılmaya karşı ekstra dayanıklıdır; böylece kalemi açarken veya yazarken kesintisiz çalışmaya odaklanabilirsiniz.</p>`
  ],
  hamur: [
    (t) => `<p>Özel dokusu sayesinde elleri yormayan ve yapışmayan <strong>${t.title}</strong>, yaratım sürecini hem kolaylaştırır hem keyifli hale getirir. Sağlığa zararsız içeriğiyle ebeveynlerin güvenle tercih edebileceği bu set, uzun süreli bir oyun deneyimi sunar.</p>`
  ],
  yapistirici: [
    (t) => `<p>Şeffaf kuruma teknolojisi sayesinde yapıştırılan yüzeylerde iz bırakmaz ve temiz bir bitiş sağlar. Ergonomik tüp tasarımı ile kontrollü uygulama yapabilir ve yanınızda kolayca taşıyabilirsiniz. Dermatolojik olarak test edilmiş yapısı, cilde temas durumunda sabunlu suyla kolayca temizlenebilme avantajı sunar.</p>`
  ],
  pastel: [
    (t) => `<p>Renk yoğunluğunu kaybetmeden kolayca yayılan yapısı ve yüksek örtücülük özelliği sayesinde yaratıcı projelerde kesintisiz bir deneyim sunar. Pratik kutusunda sunulan bu set, çocukların hayal dünyasını gerçeğe dönüştürürken motor becerilerinin gelişimini de destekler.</p>`
  ],
  _default: [
    (t) => `<p>${t.brand} kalite standartlarıyla üretilen bu ürün, uzun ömürlü kullanım ve yüksek performans sunarak günlük ihtiyaçlarınızı karşılar. Ergonomik ve kullanıcı dostu tasarımı sayesinde her yaş grubuna hitap eder.</p>`
  ]
};

// ============================================================
// SSS HAVUZLARI
// ============================================================
const FAQ_POOLS = {
  kursunkalem: [
    { question: "Uç sertlik derecesi nedir?", answer: "Genel yazım ve çizim için en ideal dengeyi sunan HB uç derecesine sahiptir." },
    { question: "Kalemtıraş ile açarken ucu kolay kırılır mı?", answer: "Hayır, özel üretim teknolojisi sayesinde ucu kırılmalara karşı son derece dayanıklıdır." },
    { question: "Yazım hissi nasıldır?", answer: "Kaliteli ucu sayesinde kağıt üzerinde takılmadan kayar, yumuşak ve pürüzsüz bir yazım deneyimi sunar." }
  ],
  hamur: [
    { question: "Hamur ellerde veya kıyafetlerde leke bırakır mı?", answer: "Hayır, özel formülü sayesinde ellere yapışmaz ve yüzeylerde leke bırakmaz." },
    { question: "Kurumasını nasıl önleyebilirim?", answer: "Her oyun bitiminde kapaklı kutularına koyup hava almayacak şekilde kapatmanız yeterlidir." },
    { question: "İçeriği çocuklar için güvenli mi?", answer: "Evet, toksik madde içermeyen malzemelerden üretilmiştir ve tüm güvenlik testlerinden geçmiştir." }
  ],
  yapistirici: [
    { question: "Solventsiz olmasının avantajı nedir?", answer: "Zararlı kimyasal çözücü içermez, kokusuzdur ve çocukların güvenle kullanması için idealdir." },
    { question: "Kuruduktan sonra iz bırakır mı?", answer: "Hayır, şeffaf kuruma özelliğine sahiptir. Yüzeyde sararma veya iz oluşmaz." },
    { question: "Kıyafetime bulaşırsa nasıl temizlerim?", answer: "Su bazlı formülü sayesinde sabunlu ılık su ile kolayca temizlenebilir." }
  ],
  pastel: [
    { question: "Hangi yüzeylerde kullanılabilir?", answer: "Kağıt, karton, tahta ve taş gibi çeşitli yüzeylerde etkili şekilde kullanılabilir." },
    { question: "Sıcak havalarda bozulur mu?", answer: "47 °C'ye kadar ısıya dayanıklıdır. Bu sıcaklığın üzerinde deformasyon gözlenebilir." },
    { question: "Örtücülük seviyesi nasıldır?", answer: "Yüksek örtücülüğe sahiptir ve kağıt üzerinde renk yoğunluğunu kaybetmeden homojen yayılır." }
  ],
  makas: [
    { question: "Çocukların kullanımı için güvenli mi?", answer: "Evet, keskin olmayan uçları ve plastik bıçak tasarımı ile yaralanma riskini en aza indirir." },
    { question: "Kumaş veya saç keser mi?", answer: "Hayır, güvenlik amacıyla sadece kağıt ve ince karton kesebilir." }
  ],
  _default: [
    { question: "Ürün orijinal mi?", answer: "Evet, ürün %100 orijinaldir ve MaviKalem güvencesiyle satılmaktadır." },
    { question: "Okul kullanımına uygun mu?", answer: "Evet, hem okul hem de ofis ortamında rahatlıkla kullanılabilir." },
    { question: "Kargo süresi ne kadardır?", answer: "Siparişiniz aynı gün içinde kargoya verilir ve 1-3 iş günü içinde teslim edilir." }
  ]
};

// ============================================================
// KİMLER KULLANIR BLOĞU (Çocuk ürünleri için ekstra)
// ============================================================
function buildWhoUsesBlock(subType) {
  const BLOCKS = {
    hamur: `<h3>Kimler Kullanır?</h3><ul><li><strong>Okul Öncesi Çocuklar:</strong> Yumuşak dokusu sayesinde küçük kas gruplarını geliştirirken eğlenceli vakit geçirmek isteyen minikler için idealdir.</li><li><strong>Ebeveynler:</strong> Çocuklarının ekran başında vakit geçirmek yerine fiziksel bir materyalle yaratıcılıklarını konuşturmasını isteyen aileler tarafından tercih edilir.</li><li><strong>Anaokulu ve Kreş Öğretmenleri:</strong> Sınıf içi etkinliklerde, renk öğretimi ve şekil oluşturma çalışmalarında güvenli bir materyal olarak kullanılır.</li></ul>`,
    makas: `<h3>Kimler Kullanır?</h3><ul><li><strong>Anaokulu Öğrencileri:</strong> 3 yaş ve üzeri çocukların ince motor becerilerini güvenle geliştirebilmeleri için tasarlanmıştır.</li><li><strong>Kreş Öğretmenleri:</strong> Sınıf içi kesme etkinliklerinde güvenli bir materyal olarak tercih edilir.</li></ul>`
  };
  return BLOCKS[subType] || "";
}

// ============================================================
// TABLO SATIRLARI
// ============================================================
function buildTableRows(facts, subType) {
  const brand = facts.brand || "";
  const stockCode = facts.stockCode || "";
  const base = [{ key: "Marka", value: brand }];

  if (stockCode && stockCode !== "Belirtilmemiş") base.push({ key: "Ürün Kodu", value: stockCode });

  const TYPE_ROWS = {
    kursunkalem: [
      { key: "Ürün Tipi", value: "Kurşun Kalem" },
      { key: "Uç Derecesi", value: "HB" },
      { key: "Dayanıklılık", value: "Kırılmaya Karşı Ekstra Dirençli Uç" },
      { key: "Kullanım Alanı", value: "Okul, Ofis, Genel Yazım ve Çizim" }
    ],
    hamur: [
      { key: "Ürün Tipi", value: "Yumuşak Oyun Hamuru Seti" },
      { key: "Doku Özelliği", value: "Yumuşak, Kolay Şekil Alan, Yapışmayan" },
      { key: "Güvenlik", value: "Sağlığa Zararsız, Toksik Madde İçermez" },
      { key: "Gelişim Alanı", value: "İnce Motor Becerileri, Hayal Gücü, El-Göz Koordinasyonu" }
    ],
    yapistirici: [
      { key: "Ürün Tipi", value: "Çok Amaçlı Sıvı Yapıştırıcı" },
      { key: "İçerik Özelliği", value: "Su Bazlı, Solventsiz, Kokusuz" },
      { key: "Kullanım Alanları", value: "Kağıt, Karton, Ahşap, Keçe" },
      { key: "Kuruma Türü", value: "Şeffaf (İz bırakmaz)" },
      { key: "Güvenlik", value: "Dermatolojik olarak test edilmiştir" }
    ],
    pastel: [
      { key: "Ürün Tipi", value: "Pastel Boya" },
      { key: "Uygulama Yüzeyleri", value: "Kağıt, Karton, Tahta, Taş" },
      { key: "Performans", value: "Yüksek Örtücülük, Yoğun Yayılma" },
      { key: "Kullanım Alanı", value: "Okul Öncesi ve İlkokul" }
    ],
    makas: [
      { key: "Ürün Tipi", value: "Güvenli Makas" },
      { key: "Uç Yapısı", value: "Yuvarlatılmış (Güvenli Uç)" },
      { key: "Kullanım Alanı", value: "Kağıt ve İnce Karton Kesimi" }
    ],
    silgi: [
      { key: "Ürün Tipi", value: "Silgi" },
      { key: "Silme Performansı", value: "Kalıntısız, Temiz Silme" },
      { key: "Kullanım Alanı", value: "Okul, Ofis, Genel Kullanım" }
    ],
    kalemtiras: [
      { key: "Ürün Tipi", value: "Kalemtıraş" },
      { key: "Bıçak Yapısı", value: "Dayanıklı ve Uzun Ömürlü Çelik Bıçak" },
      { key: "Kullanım Alanı", value: "Okul, Ofis" }
    ],
    cizimSeti: [
      { key: "Ürün Tipi", value: "Çizim Seti" },
      { key: "Malzeme Yapısı", value: "Esnek (Flexi) ve Kırılmaz" },
      { key: "Güvenlik", value: "Sağlığa Zararlı Madde İçermez" },
      { key: "Kullanım Alanı", value: "Okul, Teknik Çizim, Geometri" }
    ],
    eva: [
      { key: "Ürün Tipi", value: "EVA Levha" },
      { key: "Güvenlik", value: "Bakteri Üretmeyen, Geri Dönüştürülebilir" }
    ]
  };

  const typeRows = TYPE_ROWS[subType] || [{ key: "Ürün Tipi", value: "Kırtasiye" }, { key: "Kullanım Alanı", value: "Okul, Ofis, Hobi" }];
  return [...base, ...typeRows];
}

// ============================================================
// KAPANIŞ CTA (Kırtasiyeye özel)
// ============================================================
function buildStationeryClosing(title, seed) {
  const pool = [
    `<p>Yazılarınıza ve projelerinize kalite katmak için <strong>${title}</strong> ürününe %100 orijinal ürün garantisi ve MaviKalem güvencesiyle hemen sahip olabilirsiniz.</p>`,
    `<p><strong>${title}</strong> ürününü MaviKalem güvencesi, orijinal ürün garantisi ve aynı gün kargo avantajıyla hemen sipariş edebilirsiniz.</p>`,
    `<p>Okul ve ofis ihtiyaçlarınız için <strong>${title}</strong> ürününe MaviKalem güvencesi ve hızlı kargo avantajıyla hemen sahip olabilirsiniz.</p>`
  ];
  return pickVariation(pool, seed);
}

// ============================================================
// ANA FONKSİYON
// ============================================================
function buildStationeryDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const subType = detectSubType(facts);
  const templateData = { title: facts.title, brand: facts.brand || "" };

  // Giriş paragrafı
  const introPool = INTRO_POOLS[subType] || INTRO_POOLS._default;
  const introFn = pickVariation(introPool, seed);
  const intro = introFn(templateData);

  // Detay paragrafı
  const detailPool = DETAIL_POOLS[subType] || DETAIL_POOLS._default;
  const detailFn = pickVariationOffset(detailPool, seed, 1);
  const detail = detailFn(templateData);

  // Tablo
  const tableRows = buildTableRows(facts, subType);
  const table = buildStyledTable(tableRows);

  // Kimler Kullanır bloğu (sadece çocuk ürünlerinde)
  const whoUses = buildWhoUsesBlock(subType);

  // SSS
  const faqPool = FAQ_POOLS[subType] || FAQ_POOLS._default;
  const faq1 = pickVariationOffset(faqPool, seed, 0);
  const faq2 = pickVariationOffset(faqPool, seed, 1);
  const faq3 = faqPool.length > 2 ? pickVariationOffset(faqPool, seed, 2) : null;
  const faqBlock = buildFaqBlock([faq1, faq2, faq3].filter(Boolean));

  // Kapanış
  const closing = buildStationeryClosing(facts.title, seed);

  return [
    `<h2>${facts.title}</h2>`,
    intro,
    detail,
    table,
    whoUses,
    faqBlock,
    closing
  ].filter(Boolean).join("");
}

module.exports = { buildStationeryDescription };
