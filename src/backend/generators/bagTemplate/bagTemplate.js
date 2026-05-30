/**
 * Çanta & Matara — Şablon Jeneratörü
 * Alt kategoriye göre: Sırt Çantası, Anaokulu, Proje Çantası, Matara/Suluk
 */
const {
  pickVariation,
  pickVariationOffset,
  buildStyledTable,
  buildFaqBlock
} = require("../../helpers/books_helper");

// ============================================================
// ALT KATEGORİ TESPİTİ
// ============================================================
function detectBagSubType(facts) {
  const t = (facts.title || "").toLocaleLowerCase("tr-TR");
  const c = (facts.subCategory || facts.category || "").toLocaleLowerCase("tr-TR");
  const all = `${t} ${c}`;
  if (/matara|suluk|termos|water bottle/i.test(all)) return "matara";
  if (/proje çantası|proje cantasi|resim çantası|resim cantasi/i.test(all)) return "proje";
  if (/anaokul|kreş|kres|okul öncesi|okul oncesi/i.test(all)) return "anaokulu";
  if (/beslenme/i.test(all)) return "beslenme";
  if (/kalem kutusu|kalemlik/i.test(all)) return "kalemKutusu";
  return "sirt";
}

// ============================================================
// GİRİŞ HAVUZLARI
// ============================================================
const INTRO_POOLS = {
  sirt: [
    (t) => `<p><strong>${t.title}</strong>, öğrencilerin okul eşyalarını düzenli ve ergonomik biçimde taşıyabilmesi için ${t.brand} tarafından özel olarak tasarlanmış dayanıklı bir sırt çantasıdır.</p>`,
    (t) => `<p>Günlük okul kullanımı için ideal olan <strong>${t.title}</strong>, geniş iç hacmi ve ergonomik sırt desteğiyle uzun süreli konforlu taşıma deneyimi sunar.</p>`,
    (t) => `<p>Şık tasarımı ve fonksiyonel bölmeleriyle dikkat çeken <strong>${t.title}</strong>, hem okulda hem dışarıda her türlü ihtiyacınızı karşılayacak modern bir sırt çantasıdır.</p>`,
    (t) => `<p><strong>${t.title}</strong>, kaliteli malzeme yapısı ve omuz yükünü hafifleten özel askı sistemiyle yoğun okul günlerinde en büyük destekçiniz olacak.</p>`
  ],
  anaokulu: [
    (t) => `<p><strong>${t.title}</strong>, 3-6 yaş grubundaki çocukların okul eşyalarını düzenli ve konforlu biçimde taşıyabilmesi için özel olarak üretilmiştir. Çocuk dostu tasarımı ile hem kullanışlı hem de sevimli bir görünüm sunar.</p>`,
    (t) => `<p>Küçük bedenlere uygun ergonomik yapısıyla <strong>${t.title}</strong>, anaokulu öğrencilerinin günlük eşyalarını güvenle taşımasını sağlar. Hafif ve dayanıklı tasarımı sayesinde çocuklar rahatlıkla kullanabilir.</p>`,
    (t) => `<p>Çocukların hayal dünyasını yansıtan canlı renkleri ve kolay açılıp kapanan fermuar yapısıyla <strong>${t.title}</strong>, anaokuluna ilk adımı atan minikler için ideal bir başlangıç çantasıdır.</p>`,
    (t) => `<p><strong>${t.title}</strong>, çocuklarınızın en sevdiği kahramanlarla süslenmiş, hem oyun hem de okul materyallerini bir arada tutan ergonomik ve eğlenceli bir tasarıma sahiptir.</p>`
  ],
  matara: [
    (t) => `<p>Dayanıklı ve yüksek kaliteli malzemeden üretilen <strong>${t.title}</strong>, BPA içermez, sağlığınız için tamamen güvenlidir ve kesinlikle koku veya tat yapmaz.</p>`,
    (t) => `<p><strong>${t.title}</strong>, gün boyunca sağlıklı su tüketimini kolaylaştıran, sızdırmaz kapağı ve ergonomik tasarımıyla okul, ofis ve spor için ideal bir mataradır.</p>`,
    (t) => `<p>MaviKalem güvencesiyle sunulan <strong>${t.title}</strong>, darbelere karşı dayanıklı gövdesi ve pratik içim sağlayan ağızlık yapısıyla her an yanınızda bulundurmanız gereken şık bir aksesuardır.</p>`,
    (t) => `<p>Ilık veya soğuk içeceklerinizi güvenle taşımanıza olanak tanıyan <strong>${t.title}</strong>, sızdırmazlık garantisi ve modern estetiğiyle aktif yaşam tarzınıza mükemmel uyum sağlar.</p>`
  ],
  proje: [
    (t) => `<p>Özel tasarımlarınızı, resimlerinizi ve çalışmalarınızı güvenle taşımanız için üretilen <strong>${t.title}</strong>, fonksiyonelliği ve dayanıklılığı bir araya getiriyor.</p>`,
    (t) => `<p><strong>${t.title}</strong>, resim ve proje çalışmalarınızı darbelere karşı koruyarak güvenle taşımanızı sağlayan, özel dolgulu ve geniş hacimli bir çantadır.</p>`,
    (t) => `<p>Geniş iç kapasitesi ve formunu koruyan sert dış yüzeyi sayesinde <strong>${t.title}</strong>, teknik çizimlerin ve büyük boyutlu kağıtların kırışmadan muhafaza edilmesi için tasarlanmıştır.</p>`
  ],
  beslenme: [
    (t) => `<p><strong>${t.title}</strong>, çocuğunuzun yiyeceklerini taze ve hijyenik bir şekilde taşımasını sağlayan, yalıtımlı ve kolay temizlenebilir yapıya sahip pratik bir beslenme çantasıdır.</p>`,
    (t) => `<p>Hem şık hem de fonksiyonel olan <strong>${t.title}</strong>, içindeki termal katman sayesinde ev yapımı öğünlerin ısısını koruyarak gün boyu tazelik sunar.</p>`
  ],
  kalemKutusu: [
    (t) => `<p><strong>${t.title}</strong>, kalem ve kırtasiye malzemelerini düzenli bir şekilde muhafaza etmenizi sağlayan, dayanıklı ve şık tasarımlı bir kalem kutusudur.</p>`,
    (t) => `<p>Geniş iç hacmi ve kaliteli fermuar sistemiyle öne çıkan <strong>${t.title}</strong>, okul masalarının en renkli ve düzenli parçası olmaya adaydır.</p>`
  ]
};

// ============================================================
// DETAY HAVUZLARI
// ============================================================
const DETAIL_POOLS = {
  sirt: [
    (t) => `<p>Ortopedik sırt desteği ve ayarlanabilir yastıklı askıları sayesinde omurga sağlığını korur. Su geçirmez kumaş yapısı ve güçlendirilmiş dikişleri ile yıllarca dayanıklı kullanım sunar. Yansıtıcı detayları sayesinde karanlık ortamlarda da güvenli bir görünürlük sağlar.</p>`
  ],
  anaokulu: [
    (t) => `<p>Yumuşak sırt desteği ve ayarlanabilir askılar sayesinde çocuklar için konforlu bir taşıma sağlar. Geniş fermuar yapısı kolay erişim imkanı tanırken, hafif yapısı çocuğun sırtına yük binmesini önler.</p>`
  ],
  matara: [
    (t) => `<p>Sızdırmaz kapağı sayesinde çantanızda güvenle taşıyabilirsiniz. Ayarlanabilir taşıma askısı ile spor yaparken, yürüyüşte, okulda veya ofiste elinizde taşımadan pratik bir şekilde yanınızda bulundurabilirsiniz. Hem çocuklar hem de yetişkinler için ergonomik ve hafif bir kullanım sunar.</p>`
  ],
  proje: [
    (t) => `<p>Kumaş ve astar arasında bulunan darbe emici sünger dolgu, projelerinizi maksimum seviyede korur. Entegre tutma sapı ve ekstra omuz askısı sayesinde ergonomik taşıma deneyimi sunar. Dayanıklı kumaş yapısı yıllarca kullanıma uygundur.</p>`
  ],
  beslenme: [
    (t) => `<p>Termal yalıtımlı iç astarı sayesinde yiyeceklerin sıcaklığını uzun süre korur. Su geçirmez yapısı ve kolay temizlenebilir iç yüzeyi ile hijyenik bir kullanım sağlar.</p>`
  ],
  kalemKutusu: [
    (t) => `<p>Çoklu bölme tasarımı sayesinde kalemler, silgiler ve diğer kırtasiye malzemeleri düzenli şekilde yerleştirilebilir. Sağlam fermuar sistemi ve dayanıklı dış yüzeyi uzun ömürlü kullanım sunar.</p>`
  ]
};

// ============================================================
// SSS HAVUZLARI
// ============================================================
const FAQ_POOLS = {
  sirt: [
    { question: "Çanta sırt sağlığına uygun mu?", answer: "Evet, ortopedik sırt desteği ve yastıklı ayarlanabilir askıları sayesinde omurga sağlığını koruyacak şekilde tasarlanmıştır." },
    { question: "Çanta su geçirir mi?", answer: "Su geçirmez kumaş yapısı sayesinde hafif yağmurda eşyalarınız korunur." },
    { question: "Kaç bölmesi vardır?", answer: "Ana bölme, ön cep ve yan cepler ile eşyalarınızı düzenli şekilde taşıyabilirsiniz." }
  ],
  anaokulu: [
    { question: "Bu çanta kaç yaş için uygundur?", answer: "3-6 yaş aralığındaki anaokulu öğrencileri için ergonomik olarak tasarlanmıştır." },
    { question: "Çanta yıkanabilir mi?", answer: "Nemli bir bezle silinerek temizlenebilir. Kumaş yapısına göre elde yıkama da uygundur." },
    { question: "Çocuğumun sırtını yorar mı?", answer: "Hafif yapısı ve ergonomik askıları sayesinde çocukların sırtına minimum yük biner." }
  ],
  matara: [
    { question: "Matara koku veya tat yapar mı?", answer: "Hayır, kullanılan yüksek kaliteli malzeme sayesinde içeceklerinizde kesinlikle koku veya tat değişimi yapmaz." },
    { question: "BPA içeriyor mu?", answer: "Hayır, ürün tamamen BPA içermez ve sağlık standartlarına uygundur." },
    { question: "Çantada akıtma yapar mı?", answer: "Özel tasarımlı sızdırmaz kapağı sayesinde çantanızda güvenle taşıyabilirsiniz." }
  ],
  proje: [
    { question: "İçindeki projelerim darbelere karşı güvende mi?", answer: "Evet, kumaş arasına yerleştirilmiş darbe emici sünger sayesinde içerik korunur." },
    { question: "Çantayı nasıl yıkayabilirim?", answer: "Kaliteli kumaş yapısı sayesinde elde veya makinede yıkanabilir." },
    { question: "Sadece elde mi taşınır?", answer: "Hayır, tutma sapının yanı sıra omuzda taşıma için askısı da mevcuttur." }
  ],
  beslenme: [
    { question: "Yemekleri ne kadar süre sıcak tutar?", answer: "Termal yalıtımlı yapısı sayesinde yiyeceklerin sıcaklığını uzun süre korur." },
    { question: "İç kısmı nasıl temizlenir?", answer: "Su geçirmez iç astarı nemli bezle kolayca silinebilir." }
  ],
  kalemKutusu: [
    { question: "Kaç kalem sığar?", answer: "Geniş iç hacmi sayesinde çok sayıda kalem ve kırtasiye malzemesi rahatlıkla sığar." },
    { question: "Fermuarı dayanıklı mı?", answer: "Güçlendirilmiş fermuar sistemi uzun süreli kullanıma uygundur." }
  ]
};

// ============================================================
// LİSANSLI ÜRÜN KATMANI
// ============================================================
const LICENSE_MAP = [
  { keys: ["spiderman", "spider man", "örümcek adam"], label: "Spiderman", owner: "Marvel" },
  { keys: ["frozen", "karlar ülkesi", "elsa", "anna"], label: "Frozen", owner: "Disney" },
  { keys: ["peppa", "peppa pig"], label: "Peppa Pig", owner: "Hasbro" },
  { keys: ["paw patrol", "paw"], label: "Paw Patrol", owner: "Nickelodeon" },
  { keys: ["unicorn"], label: "Unicorn", owner: "" },
  { keys: ["kuromi", "hello kitty", "sanrio"], label: "Kuromi / Sanrio", owner: "Sanrio" },
  { keys: ["minnie", "mickey", "disney"], label: "Disney", owner: "Disney" },
  { keys: ["stitch", "lilo"], label: "Stitch", owner: "Disney" },
  { keys: ["batman"], label: "Batman", owner: "DC Comics" },
  { keys: ["superman", "süpermen"], label: "Superman", owner: "DC Comics" },
  { keys: ["barbie"], label: "Barbie", owner: "Mattel" },
  { keys: ["hot wheels", "hotwheels"], label: "Hot Wheels", owner: "Mattel" },
  { keys: ["cars", "mcqueen", "arabalar"], label: "Cars", owner: "Disney/Pixar" },
  { keys: ["minions", "minion"], label: "Minions", owner: "Universal" },
  { keys: ["bluey"], label: "Bluey", owner: "BBC" },
  { keys: ["fenerbahçe", "fenerbahce", "fb"], label: "Fenerbahçe", owner: "Lisanslı" },
  { keys: ["galatasaray", "gs"], label: "Galatasaray", owner: "Lisanslı" },
  { keys: ["beşiktaş", "besiktas", "bjk"], label: "Beşiktaş", owner: "Lisanslı" },
  { keys: ["trabzonspor", "ts"], label: "Trabzonspor", owner: "Lisanslı" }
];

/**
 * Lisans tespiti:
 * 1) Ana kategori "lisanslı ürünler" ise → lisans katmanı AKTİF
 *    - Ürün adından karakter tespit edilirse spesifik lisans bilgisi
 *    - Karakter bulunamazsa genel "Lisanslı Ürün" etiketi
 * 2) Ana kategori "çanta ve matara" / "kırtasiye" vb. ise → lisans katmanı KAPALI
 *    (Normal çanta/kırtasiye şablonu çalışır, lisans paragrafı eklenmez)
 */
function detectLicense(facts) {
  const mainCat = (facts.mainCategory || "").toLocaleLowerCase("tr-TR");
  const cat = (facts.category || "").toLocaleLowerCase("tr-TR");
  const isLicensedCategory = mainCat.includes("lisanslı") || mainCat.includes("lisansli")
    || cat.includes("lisanslı") || cat.includes("lisansli");

  // Kategori lisanslı değilse → lisans katmanı kapalı
  if (!isLicensedCategory) return null;

  // Kategori lisanslı → ürün adından karakter ara
  const lower = (facts.title || "").toLocaleLowerCase("tr-TR");
  for (const entry of LICENSE_MAP) {
    if (entry.keys.some((k) => lower.includes(k))) {
      return entry;
    }
  }

  // Karakter bulunamadı ama kategori lisanslı → genel lisans etiketi
  return { keys: [], label: "Lisanslı Ürün", owner: "Lisanslı" };
}

function buildLicenseParagraph(title, license) {
  if (!license) return "";
  if (license.label === "Lisanslı Ürün") {
    return `<p>Orijinal lisanslı tasarımıyla öne çıkan <strong>${title}</strong>, çocuklarınızın favori kahramanlarıyla buluşmasını sağlar. Özgün baskı ve tasarımıyla koleksiyona değer bir görünüm sunar.</p>`;
  }
  const ownerText = license.owner ? ` ${license.owner} lisansıyla üretilen` : " Lisanslı";
  return `<p>Sevilen <strong>${license.label}</strong> karakteriyle tasarlanan${ownerText} bu ürün, çocuklarınızın favori kahramanlarıyla buluşmasını sağlar. <strong>${title}</strong>, özgün baskı ve tasarımıyla koleksiyona değer bir görünüm sunar.</p>`;
}

// ============================================================
// TABLO SATIRLARI
// ============================================================
function safeVal(val) {
  return (val && String(val).trim()) ? String(val).trim() : "Belirtilmemiş";
}

function buildBagTableRows(facts, subType, license) {
  const brand = safeVal(facts.brand);
  const base = [{ key: "Marka", value: brand }];

  const TYPE_ROWS = {
    sirt: [
      { key: "Ürün Tipi", value: "Sırt Çantası" },
      { key: "Materyal", value: safeVal(facts.materyal) },
      { key: "Kumaş Özelliği", value: safeVal(facts.kumasOzelligi) },
      { key: "Boyut", value: safeVal(facts.boyut) },
      { key: "Ağırlık", value: safeVal(facts.agirlik) },
      { key: "Bölme Sayısı", value: safeVal(facts.bolmeSayisi) },
      { key: "Yan Bölme", value: safeVal(facts.yanBolme) },
      { key: "Askı Özelliği", value: safeVal(facts.askiOzelligi) || "Ergonomik, dengeli taşıma" },
      { key: "Renk", value: safeVal(facts.renk || facts.color) },
      { key: "Hedef Yaş Grubu", value: safeVal(facts.yasGrubu) },
      { key: "Temizlik", value: safeVal(facts.yikanabilirlik) },
      { key: "Uyumlu Ürünler", value: safeVal(facts.uyumluUrunler) },
      { key: "Stok Kodu", value: safeVal(facts.stockCode) }
    ],
    anaokulu: [
      { key: "Ürün Tipi", value: "Anaokul Çantası" },
      { key: "Materyal", value: safeVal(facts.materyal) },
      { key: "Kumaş Özelliği", value: safeVal(facts.kumasOzelligi) },
      { key: "Boyut", value: safeVal(facts.boyut) },
      { key: "Ağırlık", value: safeVal(facts.agirlik) },
      { key: "Bölme Sayısı", value: safeVal(facts.bolmeSayisi) },
      { key: "Yan Bölme", value: safeVal(facts.yanBolme) },
      { key: "Askı Özelliği", value: safeVal(facts.askiOzelligi) || "Ergonomik, dengeli taşıma" },
      { key: "Renk", value: safeVal(facts.renk || facts.color) },
      { key: "Hedef Yaş Grubu", value: safeVal(facts.yasGrubu) || "Anaokulu" },
      { key: "Karakter/Tema", value: safeVal(facts.karakter) },
      { key: "Temizlik", value: safeVal(facts.yikanabilirlik) },
      { key: "Uyumlu Ürünler", value: safeVal(facts.uyumluUrunler) },
      { key: "Stok Kodu", value: safeVal(facts.stockCode) }
    ],
    matara: [
      { key: "Ürün Tipi", value: "Su Matarası / Suluk" },
      { key: "Malzeme", value: safeVal(facts.materyal) || "Tritan / BPA İçermez" },
      { key: "Boyut", value: safeVal(facts.boyut) },
      { key: "Renk", value: safeVal(facts.renk || facts.color) },
      { key: "Kapak Tipi", value: "Sızdırmaz, Kolay Açılır" },
      { key: "Güvenlik", value: "BPA İçermez, Toksik Madde İçermez" },
      { key: "Stok Kodu", value: safeVal(facts.stockCode) }
    ],
    proje: [
      { key: "Ürün Tipi", value: "Proje / Resim Çantası" },
      { key: "Materyal", value: safeVal(facts.materyal) },
      { key: "Boyut", value: safeVal(facts.boyut) },
      { key: "Renk", value: safeVal(facts.renk || facts.color) },
      { key: "Koruma", value: "Darbe Emici Sünger Dolgu" },
      { key: "Taşıma Özelliği", value: "Tutma Sapı ve Omuz Askısı" },
      { key: "Stok Kodu", value: safeVal(facts.stockCode) }
    ],
    beslenme: [
      { key: "Ürün Tipi", value: "Beslenme Çantası" },
      { key: "Materyal", value: safeVal(facts.materyal) },
      { key: "Boyut", value: safeVal(facts.boyut) },
      { key: "Renk", value: safeVal(facts.renk || facts.color) },
      { key: "Yalıtım", value: "Termal Yalıtımlı İç Astar" },
      { key: "Stok Kodu", value: safeVal(facts.stockCode) }
    ],
    kalemKutusu: [
      { key: "Ürün Tipi", value: "Kalem Kutusu" },
      { key: "Materyal", value: safeVal(facts.materyal) },
      { key: "Boyut", value: safeVal(facts.boyut) },
      { key: "Renk", value: safeVal(facts.renk || facts.color) },
      { key: "Stok Kodu", value: safeVal(facts.stockCode) }
    ]
  };

  // Lisans satırı
  if (license) {
    const licenseValue = license.owner ? `${license.label} (${license.owner})` : license.label;
    base.push({ key: "Lisans / Karakter", value: licenseValue });
  }

  const typeRows = TYPE_ROWS[subType] || TYPE_ROWS.sirt;
  return [...base, ...typeRows];
}

// ============================================================
// KAPANIŞ CTA
// ============================================================
function buildBagClosing(title, seed) {
  const pool = [
    `<p>Siz de çocuğunuz için <strong>${title}</strong> tercih ederek okula gidişi konforlu hale getirebilirsiniz. MaviKalem güvencesi ve hızlı kargo avantajıyla hemen sipariş verin.</p>`,
    `<p><strong>${title}</strong> ürününe %100 orijinal ürün garantisi ve MaviKalem güvencesiyle hemen sahip olabilirsiniz.</p>`,
    `<p>Sağlıklı, güvenli ve pratik kullanım için <strong>${title}</strong> modeline MaviKalem güvencesi ve hızlı kargo avantajıyla hemen sahip olabilirsiniz.</p>`
  ];
  return pickVariation(pool, seed);
}

// ============================================================
// ANA FONKSİYON
// ============================================================
function buildBagDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const subType = detectBagSubType(facts);
  const license = detectLicense(facts);
  const templateData = { title: facts.title, brand: facts.brand || "" };

  const introPool = INTRO_POOLS[subType] || INTRO_POOLS.sirt;
  const introFn = pickVariation(introPool, seed);
  const intro = introFn(templateData);

  // Lisanslı ürün paragrafı (intro'dan sonra eklenir)
  const licenseParagraph = buildLicenseParagraph(facts.title, license);

  const detailPool = DETAIL_POOLS[subType] || DETAIL_POOLS.sirt;
  const detailFn = pickVariationOffset(detailPool, seed, 1);
  const detail = detailFn(templateData);

  const tableRows = buildBagTableRows(facts, subType, license);
  const table = buildStyledTable(tableRows);

  const faqPool = FAQ_POOLS[subType] || FAQ_POOLS.sirt;
  const faq1 = pickVariationOffset(faqPool, seed, 0);
  const faq2 = pickVariationOffset(faqPool, seed, 1);
  const faq3 = faqPool.length > 2 ? pickVariationOffset(faqPool, seed, 2) : null;
  const faqBlock = buildFaqBlock([faq1, faq2, faq3].filter(Boolean));

  const closing = buildBagClosing(facts.title, seed);

  return [
    `<h2>${facts.title}</h2>`,
    intro,
    licenseParagraph,
    detail,
    table,
    faqBlock,
    closing
  ].filter(Boolean).join("");
}

// preschool-bag stratejisi de aynı fonksiyonu kullanacak
function buildPreschoolBagDescription(facts) {
  return buildBagDescription(facts);
}

module.exports = { buildBagDescription, buildPreschoolBagDescription };

