/**
 * Sanat Ürünleri — Şablon Jeneratörü
 * Alt kategorilere göre: Boyalar, Fırçalar, Defterler, Killer, Sanatsal Kalemler
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
function detectArtSubType(facts) {
  const t = (facts.title || "").toLocaleLowerCase("tr-TR");
  const c = (facts.subCategory || facts.category || "").toLocaleLowerCase("tr-TR");
  const all = `${t} ${c}`;

  if (/fırça uçlu kalem|firca uclu kalem|brush pen|brush marker/i.test(all)) return "fircaKalem";
  if (/kalem|marker|pigma|micron|charcoal|füzen/i.test(all)) return "kalem";
  if (/fırça|firca|brush/i.test(all)) return "firca";
  if (/kil|seramik|modelaj|şekillendirme|clay/i.test(all)) return "kil";
  if (/defter|kağıt|kagit|blok|sketch|eskiz|tuval/i.test(all)) return "kagit";
  if (/boya|akrilik|yağlı|yağli|suluboya|guaj|pigment|renk/i.test(all)) return "boya";
  return "genel";
}

// ============================================================
// GİRİŞ HAVUZLARI
// ============================================================
const INTRO_POOLS = {
  boya: [
    (t) => `<p>Sanat eserlerinizde profesyonel bir derinlik ve canlılık arıyorsanız, <strong>${t.title}</strong> tam size göre. Yüksek pigment yoğunluğu ve mükemmel ışık haslığı ile eserlerinizin yıllar boyu ilk günkü parlaklığını korumasını sağlar.</p>`,
    (t) => `<p>Yaratıcılığınızı sınır tanımadan tuvale yansıtmanıza olanak tanıyan <strong>${t.title}</strong>, zengin renk skalası ve akışkan yapısıyla sanatçıların favorisidir. Karıştırılabilir yapısı sayesinde hayalinizdeki ara tonları kolayca elde edebilirsiniz.</p>`,
    (t) => `<p>Dokusu ve örtücülüğü ile sanat çalışmalarınıza yeni bir boyut kazandıran <strong>${t.title}</strong>, profesyonel standartlardaki pigment yapısıyla her fırça darbesinde fark yaratır.</p>`,
    (t) => `<p>Geleneksel ve modern teknikleri bir araya getiren <strong>${t.title}</strong>, üstün renk geçişleri sağlayan formülüyle hem tuval üzerinde hem de farklı yüzeylerde kusursuz sonuçlar vadediyor.</p>`
  ],
  fircaKalem: [
    (t) => `<p>Kağıt ve karton üzerinde çizim yapmayı bir sanata dönüştüren <strong>${t.title}</strong>, esnek fırça ucu sayesinde hem ince detayları hem de geniş alanları tek kalemle boyamanıza olanak tanır.</p>`,
    (t) => `<p>Modern kaligrafi, lettering ve illüstrasyon projelerinde profesyonel bir kontrol sunan <strong>${t.title}</strong>, basınca duyarlı esnek ucu ile değişken çizgi kalınlığı elde etmenizi sağlar.</p>`,
    (t) => `<p>Sanatsal dışavurumun en pratik araçlarından biri olan <strong>${t.title}</strong>, akışkan mürekkebi ve formunu koruyan fırça ucuyla yaratıcı süreçlerinizi daha akıcı hale getirir.</p>`,
    (t) => `<p>Hem hobi çalışmalarında hem de profesyonel illüstrasyonlarda fark yaratan <strong>${t.title}</strong>, lebaleb renk yoğunluğu ve ergonomik tasarımıyla elinizin doğal bir uzantısı haline gelecek.</p>`
  ],
  firca: [
    (t) => `<p>Hassas vuruşlar ve kontrollü bir boyama deneyimi için tasarlanan <strong>${t.title}</strong>, yüksek boya tutma kapasitesi ile sanatsal süreçlerinizi daha akıcı hale getirir. Ergonomik sap tasarımı uzun süreli çalışmalarda el konforunuzu korur.</p>`,
    (t) => `<p><strong>${t.title}</strong>, kaliteli kıl yapısı sayesinde yüzeyde fırça izi bırakmadan pürüzsüz geçişler yapmanızı sağlar. Hem detay çalışmalarında hem de geniş yüzeylerde profesyonel sonuçlar sunar.</p>`,
    (t) => `<p>Farklı tekniklere kolayca uyum sağlayan <strong>${t.title}</strong>, esnek kıl yapısı ve dayanıklı gövdesiyle her sanatsal aşamada yanınızda olan güvenilir bir yardımcıdır.</p>`,
    (t) => `<p>Boyanın yüzeye homojen yayılmasını sağlayan <strong>${t.title}</strong>, profesyonel sanatçıların hassas detay ve geniş alan boyama ihtiyaçları için özel olarak geliştirilmiştir.</p>`
  ],
  kagit: [
    (t) => `<p>Sanatınızın temeli olan kağıt kalitesi, eserin kaderini belirler. <strong>${t.title}</strong>, yüksek gramajı ve emici dokusuyla ıslak tekniklerin deformasyon yapmadan uygulanmasına imkan tanır.</p>`,
    (t) => `<p>Dokulu yüzey yapısıyla pigmentlerin kağıda tutunmasını maksimize eden <strong>${t.title}</strong>, özellikle eskiz ve suluboya çalışmaları için sanatçı standartlarında üretilmiştir.</p>`,
    (t) => `<p>Asitsiz yapısıyla eserlerinizin yıllar boyu sararmasını önleyen <strong>${t.title}</strong>, profesyonel sunumlar ve kalıcı sanat projeleri için ideal bir zemine sahiptir.</p>`,
    (t) => `<p>Yaratıcılığınızın en saf haliyle buluştuğu <strong>${t.title}</strong>, dayanıklı yüzeyi ve estetik dokusuyla her türlü sanatsal disipline ev sahipliği yapar.</p>`
  ],
  kil: [
    (t) => `<p>Üç boyutlu tasarımlarınıza can veren <strong>${t.title}</strong>, pürüzsüz dokusu ve kolay şekil alan yapısıyla hem profesyonel heykeltıraşlar hem de hobi tutkunları için idealdir.</p>`,
    (t) => `<p><strong>${t.title}</strong>, hava ile kuruyan özel formülü sayesinde fırınlama gerektirmeden kalıcı objeler üretmenizi sağlar. Kuruduktan sonra boyanabilir yüzeyi ile sanatsal dokunuşlarınıza açıktır.</p>`,
    (t) => `<p>Modelaj ve heykel çalışmalarında sınırsız özgürlük tanıyan <strong>${t.title}</strong>, elden ve çalışma yüzeyinden kolayca temizlenebilen yapısıyla keyifli bir üretim süreci sunar.</p>`,
    (t) => `<p>İnce detayları işlemenize olanak tanıyan esnek yapısıyla <strong>${t.title}</strong>, hem çocukların motor becerilerini geliştiren hem de yetişkinlerin sanatsal vizyonunu yansıtan nitelikli bir materyaldir.</p>`
  ],
  kalem: [
    (t) => `<p>İnce çizgiler, teknik detaylar ve güçlü karakterler için <strong>${t.title}</strong> sanatçıların en büyük yardımcısıdır. Akmayan mürekkep yapısı ve dayanıklı ucuyla illüstratörlerin ve tasarımcıların vazgeçilmezidir.</p>`,
    (t) => `<p>Kaligrafi, eskiz veya detay çizimlerinde profesyonel bir kontrol sunan <strong>${t.title}</strong>, ergonomik gövdesiyle yaratıcı süreçlerinizi keyfe dönüştürür.</p>`,
    (t) => `<p>Hassas teknik çizimlerden serbest eskizlere kadar geniş bir yelpazede performans sunan <strong>${t.title}</strong>, mürekkep kalitesi ve uç dayanıklılığı ile standartları belirliyor.</p>`,
    (t) => `<p>Fikirlerinizi kağıda en saf haliyle yansıtan <strong>${t.title}</strong>, dağılmayan yapısı ve akıcı yazım hissiyle tasarım süreçlerinizin en verimli parçası olacak.</p>`
  ],
  genel: [
    (t) => `<p>Sanatsal projelerinize değer katan <strong>${t.title}</strong>, yüksek kalite standartları ve sanatçı odaklı tasarımıyla MaviKalem güvencesiyle sunulmaktadır.</p>`,
    (t) => `<p><strong>${t.title}</strong>, yaratıcılığınızı besleyen fonksiyonel özellikleri ve dayanıklı yapısıyla sanatsal çalışmalarınızda fark yaratacak nitelikli bir üründür.</p>`
  ]
};

// ============================================================
// DETAY HAVUZLARI
// ============================================================
const DETAIL_POOLS = {
  boya: [
    (t) => `<p>Tek kat vuruşta bile yüksek örtücülük sunan bu seri, özellikle ışığa karşı dayanıklılığı ile öne çıkar. Profesyonel dereceli pigmentler kullanılarak üretilen formülü, renklerin birbirine karışmasını kolaylaştırarak sınırsız bir palet oluşturmanıza yardımcı olur.</p>`
  ],
  fircaKalem: [
    (t) => `<p>Su bazlı ve kokusuz mürekkebi sayesinde kağıttan arka yüze sızma yapmaz. Basınca duyarlı esnek ucu ile aşağı vuruşlarda kalın, yukarı vuruşlarda ince çizgiler elde edebilirsiniz. Davetiye tasarımından peçete süslemesine kadar geniş bir kullanım alanı sunar.</p>`
  ],
  firca: [
    (t) => `<p>Sert ucu ve esnek kıl yapısı ile boyayı yüzeye hapsederken vuruş sonunda formunu hızla geri kazanır. Sentetik ve doğal kıl kombinasyonları, farklı tekniklerde (flat, round, filbert) sanatçıya maksimum kontrol imkanı tanır.</p>`
  ],
  kagit: [
    (t) => `<p>Asitsiz yapısı sayesinde zamanla sararma yapmaz ve eserlerinizin arşiv kalitesinde saklanmasını sağlar. ${t.gramaj || 'Yüksek'} gramajlı kağıt dokusu, suya ve kazımaya karşı dirençli olup, katmanlı çalışmalarda bozulmaz.</p>`
  ],
  kil: [
    (t) => `<p>Doğal kil içeriği, işleme sırasında çatlama riskini minimize eder. Nemli bir bez yardımıyla çalışma süresini uzatabilir, kuruma sonrası zımparalama veya boyama gibi yüzey bitiş işlemleriyle eserinizi tamamlayabilirsiniz.</p>`
  ],
  kalem: [
    (t) => `<p>Hızlı kuruyan pigmentli mürekkebi, su ve ışığa karşı dayanıklıdır. Farklı uç kalınlıkları ile en ince detaydan en güçlü gölgelemeye kadar geniş bir teknik yelpazede kusursuz performans sunar.</p>`
  ],
  genel: [
    (t) => `<p>${t.brand} marka kalitesiyle üretilen bu ürün, uzun ömürlü kullanım ve profesyonel performans hedeflenerek tasarlanmıştır.</p>`
  ]
};

// ============================================================
// KİMLER KULLANIR BLOĞU (Dinamik)
// ============================================================
function buildWhoUsesBlock(subType) {
  const BLOCKS = {
    boya: `<h3>Kimler Kullanır?</h3><ul><li><strong>Profesyonel Sanatçılar:</strong> Pigment kalitesi ve renk doygunluğu arayan ustalara hitap eder.</li><li><strong>Güzel Sanatlar Öğrencileri:</strong> Akrilik ve yağlı boya eğitimlerinde standartları belirleyen bir seçimdir.</li><li><strong>Hobi Severler:</strong> Kaliteli bir hobi deneyimi arayan amatörler için kullanımı kolay ve doyurucudur.</li></ul>`,
    fircaKalem: `<h3>Kimler Kullanır?</h3><ul><li><strong>Modern Kaligrafi ve Lettering Sanatçıları:</strong> Esnek ucu sayesinde aşağı yönlü vuruşlarda kalın, yukarı yönlü vuruşlarda ince çizgiler elde etmek isteyenler için idealdir.</li><li><strong>Kart ve Davetiye Tasarımcıları:</strong> Kişiye özel tebrik kartları, peçete motifleri ve çiçek desenleri oluşturmak isteyen hobi tutkunları tarafından tercih edilir.</li><li><strong>İllüstratörler:</strong> Kokusuz mürekkebi ve canlı renk pigmentleri sayesinde güvenli ve keyifli bir çizim deneyimi arayan her yaştan kullanıcıya hitap eder.</li></ul>`,
    firca: `<h3>Kimler Kullanır?</h3><ul><li><strong>Ressamlar:</strong> Fırça izi bırakmayan ve boya tutuşu yüksek araçlar arayan sanatçılar için idealdir.</li><li><strong>Restoratörler:</strong> İnce detaylarda hassas çalışma yapmak isteyen uzmanlar tarafından tercih edilir.</li></ul>`,
    kagit: `<h3>Kimler Kullanır?</h3><ul><li><strong>Suluboya Ressamları:</strong> 300gr ve üzeri kağıtlarda dalgalanma yaşamadan çalışmak isteyenler için mükemmeldir.</li><li><strong>İllüstratörler ve Mimarlar:</strong> Teknik eskiz ve çizim blokları olarak profesyonel portfolyo çalışmalarında kullanılır.</li></ul>`,
    kil: `<h3>Kimler Kullanır?</h3><ul><li><strong>Seramik Sanatçıları:</strong> Taslak modellerini ve biblolarını fırın ihtiyacı olmadan oluşturmak isteyenlere yöneliktir.</li><li><strong>Sanat Eğitmenleri:</strong> Okul ve atölye çalışmalarında güvenli olduğu kadar yüksek performanslı modelaj malzemesi olarak tercih edilir.</li></ul>`,
    kalem: `<h3>Kimler Kullanır?</h3><ul><li><strong>Tasarımcılar:</strong> Keskin hatlar ve detaylı çizimler için vazgeçilmez bir ekipmandır.</li><li><strong>Kaligrafi Sanatçıları:</strong> Fırça uçlu kalemlerde esneklik ve mürekkep kalitesi arayan profesyonellere hitap eder.</li></ul>`,
    genel: `<h3>Kimler Kullanır?</h3><ul><li><strong>Sanat Tutkunları:</strong> Projelerinde kaliteye ve dayanıklılığa önem veren tüm yaratıcı zihinler için uygundur.</li><li><strong>Kurs ve Atölye Katılımcıları:</strong> Eğitimlerde önerilen profesyonel standartlarda bir üründür.</li></ul>`
  };
  return BLOCKS[subType] || BLOCKS.genel;
}

// ============================================================
// SSS HAVUZLARI
// ============================================================
const FAQ_POOLS = {
  boya: [
    { question: "Renkler birbirine karışır mı?", answer: "Evet, yüksek pigment uyumu sayesinde ara renkler elde etmek için kolayca karıştırılabilir." },
    { question: "Kuruma süresi ne kadardır?", answer: "Ortam sıcaklığına ve katman kalınlığına göre değişmekle birlikte genellikle 15-30 dakika içinde toz kurumasını tamamlar." },
    { question: "Işık haslığı nedir?", answer: "Eserlerinizin güneş ışığına maruz kaldığında solmaması için kullanılan bir derecelendirmedir. Bu ürün yüksek ışık haslığına sahiptir." }
  ],
  fircaKalem: [
    { question: "Mürekkebi kağıdın arkasına geçer mi?", answer: "Hayır, su bazlı özel mürekkebi kağıttan sızma yapmayacak şekilde formüle edilmiştir." },
    { question: "Ucu sert mi yoksa yumuşak mı?", answer: "Kalem esnek bir fırça uca sahiptir; baskı miktarınıza göre çizgi kalınlığını 1 mm ile 3 mm arasında kontrol edebilirsiniz." },
    { question: "Kaligrafi çalışmalarına uygun mudur?", answer: "Evet, basınca duyarlı esnek uç yapısı sayesinde modern kaligrafi ve lettering için en popüler tercihlerden biridir." }
  ],
  firca: [
    { question: "Fırça kılları dökülür mü?", answer: "Özel metal bileziği sayesinde kıllar gövdeye sıkıca sabitlenmiştir, dökülme yapmaz." },
    { question: "Hangi boyalar için uygundur?", answer: "Sentetik/doğal kıl yapısına göre akrilik, yağlı ve suluboya çalışmalarında güvenle kullanılabilir." },
    { question: "Temizliği nasıl yapılmalı?", answer: "Her kullanım sonrası uygun temizleyicilerle (su bazlıysa su, yağlıysa tiner) yıkanıp kıl formu korunarak kurutulmalıdır." }
  ],
  kagit: [
    { question: "Kağıt suda dalgalanma yapar mı?", answer: "300 gram ve üzeri yüksek gramajlı kağıtlar suya karşı yüksek tolerans gösterir, dalgalanmayı minimize eder." },
    { question: "Asitsiz olması neden önemli?", answer: "Asitsiz kağıtlar zamanla sararma ve ufalanma yapmaz, eserlerinizin ömrünü uzatır." }
  ],
  kil: [
    { question: "Fırınlama gerektirir mi?", answer: "Eğer hava ile kuruyan model ise fırınlama gerektirmez, 24 saat içinde kendiliğinden sertleşir." },
    { question: "Kuruduktan sonra boyanabilir mi?", answer: "Evet, tam kuruma sağlandıktan sonra üzerine her türlü sanatsal boya ile renklendirme yapılabilir." }
  ],
  kalem: [
    { question: "Kağıdın arkasına geçer mi?", answer: "Yüksek kaliteli mürekkep yapısı sayesinde, uygun gramajlı kağıtlarda arka yüze sızma yapmaz." },
    { question: "Suya dayanıklı mıdır?", answer: "Kuruduktan sonra çoğu modelimiz suya ve güneş ışığına karşı dirençlidir." }
  ],
  genel: [
    { question: "Ürün orijinal mi?", answer: "Evet, sitemizdeki tüm ürünler %100 orijinaldir ve MaviKalem güvencesiyle gönderilmektedir." },
    { question: "Kargo süreci nasıl işliyor?", answer: "Siparişleriniz genellikle aynı gün, en geç 24 saat içinde özenle paketlenerek kargoya verilir." }
  ]
};

// ============================================================
// TABLO SATIRLARI
// ============================================================
function buildTableRows(facts, subType) {
  const brand = facts.brand || "";
  const stockCode = facts.stockCode || "";
  const base = [{ key: "Marka", value: brand }];

  if (stockCode && stockCode !== "Belirtilmemiş") base.push({ key: "Ürün Kodu", value: stockCode });

  const TYPE_ROWS = {
    boya: [
      { key: "Ürün Tipi", value: "Sanatsal Boya" },
      { key: "Pigment Kalitesi", value: "Sanatçı Derecesi (Artist Grade)" },
      { key: "Işık Haslığı", value: "Yüksek (ASTM-D4236 Uyumlu)" },
      { key: "Hacim", value: facts.hacim || "Belirtilmemiş" }
    ],
    fircaKalem: [
      { key: "Ürün Tipi", value: "Fırça Uçlu Kalem (Brush Pen)" },
      { key: "Uç Yapısı", value: "Esnek Fırça Uç (Fiber/Keçe)" },
      { key: "Mürekkep Türü", value: "Su Bazlı, Kokusuz" },
      { key: "Kullanım Yüzeyi", value: "Kağıt ve Karton" }
    ],
    firca: [
      { key: "Ürün Tipi", value: "Sanatsal Boya Fırçası" },
      { key: "Kıl Yapısı", value: facts.kilYapisi || "Profesyonel Sentetik/Doğal" },
      { key: "Uç Tipi", value: facts.ucTipi || "Çok Amaçlı" },
      { key: "Uyumlu Boya Türleri", value: "Akrilik, Yağlı ve Suluboya" }
    ],
    kagit: [
      { key: "Ürün Tipi", value: "Resim Kağıdı / Blok" },
      { key: "Gramaj", value: facts.gramaj || "300 g/m²" },
      { key: "Yüzey Dokusu", value: facts.doku || "Cold Pressed / Grenli" },
      { key: "Özellik", value: "Asitsiz (Acid-Free)" }
    ],
    kil: [
      { key: "Ürün Tipi", value: "Modelaj Kili" },
      { key: "Kuruma Türü", value: "Hava İle Kuruyan (Air Dry)" },
      { key: "Yapı", value: "Pürüzsüz, Kolay Şekil Alan" }
    ],
    kalem: [
      { key: "Ürün Tipi", value: "Sanatsal Teknik Kalem" },
      { key: "Mürekkep", value: "Arşiv Kalitesinde Pigment Mürekkep" },
      { key: "Uç Kalınlığı", value: facts.ucKalinligi || "Değişken" }
    ]
  };

  const typeRows = TYPE_ROWS[subType] || [{ key: "Ürün Tipi", value: "Sanat Malzemesi" }];
  return [...base, ...typeRows];
}

// ============================================================
// KAPANIŞ CTA
// ============================================================
function buildArtClosing(title, seed) {
  const pool = [
    `<p>Sanat projelerinize profesyonel bir dokunuş katmak için <strong>${title}</strong> ürününe %100 orijinal ürün garantisi ve MaviKalem güvencesiyle hemen sahip olabilirsiniz.</p>`,
    `<p>Yaratıcılığınızı zirveye taşıyacak <strong>${title}</strong> ürününü MaviKalem güvencesi, orijinal ürün garantisi ve hızlı kargo avantajıyla hemen sipariş edebilirsiniz.</p>`,
    `<p>Kaliteli sanat malzemeleriyle eserlerinizi ölümsüzleştirin. <strong>${title}</strong>, MaviKalem güvencesiyle sizleri bekliyor.</p>`
  ];
  return pickVariation(pool, seed);
}

// ============================================================
// ANA FONKSİYON
// ============================================================
function buildArtDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const subType = detectArtSubType(facts);
  const templateData = {
    title: facts.title,
    brand: facts.brand || "",
    gramaj: facts.gramaj || ""
  };

  // Giriş paragrafı
  const introPool = INTRO_POOLS[subType] || INTRO_POOLS.genel;
  const introFn = pickVariation(introPool, seed);
  const intro = introFn(templateData);

  // Detay paragrafı
  const detailPool = DETAIL_POOLS[subType] || DETAIL_POOLS.genel;
  const detailFn = pickVariationOffset(detailPool, seed, 1);
  const detail = detailFn(templateData);

  // Tablo
  const tableRows = buildTableRows(facts, subType);
  const table = buildStyledTable(tableRows);

  // "Kimler Kullanır?" Bloğu
  const whoUses = buildWhoUsesBlock(subType);

  // SSS
  const faqPool = FAQ_POOLS[subType] || FAQ_POOLS.genel;
  const faq1 = pickVariationOffset(faqPool, seed, 0);
  const faq2 = pickVariationOffset(faqPool, seed, 1);
  const faq3 = faqPool.length > 2 ? pickVariationOffset(faqPool, seed, 2) : null;
  const faqBlock = buildFaqBlock([faq1, faq2, faq3].filter(Boolean));

  // Kapanış
  const closing = buildArtClosing(facts.title, seed);

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

module.exports = { buildArtDescription };
