/**
 * Ofis & Kırtasiye — Şablon Jeneratörü
 * Alt kategorilere göre: Hesap Makinesi, Ajanda/Bloknot, Telli Dosya/Arşiv,
 *                        Post-it/Yapışkan Not, Prestij/Dolma Kalem
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
function detectOfficeSubType(facts) {
  const t = (facts.title || "").toLocaleLowerCase("tr-TR");
  const c = (facts.subCategory || facts.category || "").toLocaleLowerCase("tr-TR");
  const all = `${t} ${c}`;

  // Prestij/dolma kalem kontrolü diğer kalem tiplerinden ÖNCE
  if (/dolma kalem|prestij kalem|fountain|mürekkepli kalem|konvertör/i.test(all)) return "prestijKalem";
  if (/hesap makinesi|hesap makines|calculator/i.test(all)) return "hesapMakinesi";
  if (/ajanda|bloknot|planlayıcı|planlama defteri|organizer/i.test(all)) return "ajanda";
  if (/post.?it|yapışkan not|yapiskan not|sticky note|küp blok|kup blok/i.test(all)) return "postit";
  if (/telli dosya|klasör|klasor|dosya|arşiv|arsiv|sunum dosyası|poşet dosya|poset dosya/i.test(all)) return "dosya";
  if (/bant|seloteyp|koli bandı|koli bandi|maskeleme/i.test(all)) return "bant";
  if (/zımba|zimba|delgeç|delgec|stapler/i.test(all)) return "zimba";
  return "genel";
}

// ============================================================
// GİRİŞ HAVUZLARI
// ============================================================
const INTRO_POOLS = {
  hesapMakinesi: [
    (t) => `<p>Günlük hesaplama işlemlerini hızlı ve hatasız gerçekleştirmek isteyenler için tasarlanan <strong>${t.title}</strong>, geniş ekranı ve ergonomik tuş yapısıyla ofis, muhasebe ve ticaret kullanımları için ideal bir çözümdür.</p>`,
    (t) => `<p><strong>${t.title}</strong>, büyük sayılarla çalışan profesyoneller için geliştirilmiş güvenilir bir hesaplama aracıdır. Net görüntü sunan ekranı ve hızlı tepki veren tuşlarıyla verimli bir çalışma deneyimi sağlar.</p>`
  ],
  ajanda: [
    (t) => `<p>Toplantı notlarınızı, günlük planlarınızı ve proje takvimlerinizi düzenli tutmanız için tasarlanan <strong>${t.title}</strong>, profesyonel yaşamınızda zaman yönetiminin vazgeçilmez yardımcısıdır.</p>`,
    (t) => `<p><strong>${t.title}</strong>, iş ve kişisel planlamalarınızı tek bir noktada toparlayan, dayanıklı kapağı ve kaliteli sayfa yapısıyla uzun süreli kullanıma uygun bir not defteri / ajandadır.</p>`
  ],
  postit: [
    (t) => `<p>Hızlı hatırlatmalar, görev listeleri ve anlık notlar için tasarlanan <strong>${t.title}</strong>, iz bırakmayan yapışkan teknolojisi ile her yüzeye güvenle yapıştırılabilir.</p>`,
    (t) => `<p>Ofis masanızdan bilgisayar ekranınıza, buzdolabından ajandanıza kadar her yere pratikçe tutturabileceğiniz <strong>${t.title}</strong>, günlük organizasyonunuzun en pratik yardımcısıdır.</p>`
  ],
  dosya: [
    (t) => `<p>Evraklarınızı düzenli, korunaklı ve kolay erişilebilir şekilde arşivlemek için tasarlanan <strong>${t.title}</strong>, A4 boyutundaki tüm belgelerinize mükemmel uyum sağlar.</p>`,
    (t) => `<p><strong>${t.title}</strong>, ofis ve kişisel evrak yönetiminde profesyonel düzen arayanlar için dayanıklı yapısı ve pratik mekanizmasıyla öne çıkan bir dosyalama çözümüdür.</p>`
  ],
  prestijKalem: [
    (t) => `<p>İmza süreçlerine zarafet katan ve yazım deneyimini bir sanata dönüştüren <strong>${t.title}</strong>, profesyonel yaşamın en prestijli yazım aracıdır.</p>`,
    (t) => `<p><strong>${t.title}</strong>, ergonomik tutuşu, akıcı mürekkep beslemesi ve zarif tasarımıyla hem kişisel kullanım hem de hediye amacıyla ideal bir prestij kalemidir.</p>`
  ],
  bant: [
    (t) => `<p>Paketleme, onarım ve etiketleme işlemlerinde güvenilir yapışma gücü sunan <strong>${t.title}</strong>, ofis ve ev kullanımı için vazgeçilmez bir yardımcıdır.</p>`
  ],
  zimba: [
    (t) => `<p>Evrak birleştirme ve arşivleme süreçlerini hızlandıran <strong>${t.title}</strong>, sağlam mekanizması ve ergonomik tasarımıyla günlük ofis kullanımının olmazsa olmazıdır.</p>`
  ],
  genel: [
    (t) => `<p><strong>${t.title}</strong>, ofis ve kişisel kullanım için ${t.brand} kalitesiyle üretilmiş pratik ve dayanıklı bir üründür.</p>`
  ]
};

// ============================================================
// DETAY HAVUZLARI
// ============================================================
const DETAIL_POOLS = {
  hesapMakinesi: [
    (t) => `<p>12 haneli geniş ekranı sayesinde büyük sayıları net bir şekilde görüntüler. Hem güneş enerjisi hem de pil ile çalışan dual enerji sistemi sayesinde, pil bitse dahi aydınlık ortamlarda kesintisiz kullanım sunar. Hafif yapısı ve kaymaz tabanı ile masaüstü kullanımda tam stabilite sağlar.</p>`
  ],
  ajanda: [
    (t) => `<p>PP veya suni deri kaplı dayanıklı kapağı dış etkenlere karşı sayfalarınızı korurken, 70-80 gr kaliteli kağıt yapısı mürekkep geçirmez özelliğiyle tükenmez ve dolma kalem kullanıcılarına sorunsuz bir yazım deneyimi sunar. Tarihli veya tarihsiz sayfa seçenekleri ile kişisel planlama tarzınıza uyum sağlar.</p>`
  ],
  postit: [
    (t) => `<p>Özel yapışkan formülü sayesinde yüzeylere güçlü tutunur ancak söküldüğünde kesinlikle iz bırakmaz. Birden fazla kez yapıştırılıp çıkarılabilir yapısıyla aynı notu farklı yerlere taşıyabilirsiniz. Kompakt boyutu ile çanta ve cep dostu bir taşınabilirlik sunar.</p>`
  ],
  dosya: [
    (t) => `<p>Dayanıklı tel mekanizması ve güçlendirilmiş sırt yapısı ile yüzlerce sayfa kapasitesinde güvenli arşivleme sağlar. İç ve dış kapaklardaki etiket alanları, dosyalarınızı kategorize ederek aradığınız belgeye anında ulaşmanıza yardımcı olur.</p>`
  ],
  prestijKalem: [
    (t) => `<p>Hassas M (medium) ucu, kağıt üzerinde akıcı ve dengeli bir mürekkep akışı sunarak her yazım anını özel kılar. Konvertör ve kartuş uyumlu mürekkep sistemi, hem şişe mürekkep hem de pratik kartuş kullanımına olanak tanır. Metal veya reçine gövdesi ile elde sağlam ve dengeli bir kavrama sunar.</p>`
  ],
  bant: [
    (t) => `<p>Güçlü yapışma performansı ve kontrollü açılma mekanizması sayesinde düzgün ve temiz bir uygulama sunar. Farklı yüzeylerde etkili yapışma sağlarken, kolayca kesilebilen yapısıyla pratik kullanım imkanı tanır.</p>`
  ],
  zimba: [
    (t) => `<p>Güçlendirilmiş mekanizması tek seferde birden fazla sayfayı zahmetsizce zımbalayabilir. Ergonomik tasarımı el yorgunluğunu azaltırken, geniş zımba teli kapasitesi sık dolum ihtiyacını ortadan kaldırır.</p>`
  ],
  genel: [
    (t) => `<p>${t.brand} kalite standartlarıyla üretilen bu ürün, ofis ortamında verimliliğinizi artırmak ve günlük iş akışınızı kolaylaştırmak için tasarlanmıştır.</p>`
  ]
};

// ============================================================
// KİMLER KULLANIR BLOĞU
// ============================================================
function buildWhoUsesBlock(subType) {
  const BLOCKS = {
    hesapMakinesi: `<h3>Kimler Kullanır?</h3><ul><li><strong>Muhasebeciler ve Mali Müşavirler:</strong> Büyük sayılarla hızlı ve hatasız işlem yapması gereken profesyoneller için vazgeçilmezdir.</li><li><strong>Ofis Çalışanları:</strong> Günlük bütçe hesaplama, fatura kontrolü ve veri giriş işlemlerinde pratik bir yardımcıdır.</li><li><strong>Esnaf ve Tüccarlar:</strong> Satış noktalarında anlık fiyat hesaplama ve kâr-zarar analizi için idealdir.</li></ul>`,
    ajanda: `<h3>Kimler Kullanır?</h3><ul><li><strong>Yöneticiler:</strong> Toplantı takvimlerini, proje aşamalarını ve stratejik planlarını düzenleyen profesyoneller tarafından tercih edilir.</li><li><strong>Öğrenciler:</strong> Ders programı, sınav tarihleri ve ödev planlaması için pratik bir rehberdir.</li><li><strong>Serbest Çalışanlar:</strong> Müşteri randevuları, proje süreleri ve gelir takibi için düzenli bir planlama aracı olarak kullanılır.</li></ul>`,
    postit: `<h3>Kimler Kullanır?</h3><ul><li><strong>Ofis Çalışanları:</strong> Toplantı hatırlatmaları, kısa görev listeleri ve masaüstü organizasyonu için kullanılır.</li><li><strong>Öğrenciler:</strong> Ders notlarını işaretleme, kitap ayracı ve hızlı özet çıkarma amacıyla tercih edilir.</li><li><strong>Ev Kullanıcıları:</strong> Alışveriş listeleri ve buzdolabı hatırlatmaları için pratik bir çözüm sunar.</li></ul>`,
    dosya: `<h3>Kimler Kullanır?</h3><ul><li><strong>Ofis Çalışanları:</strong> Sözleşme, fatura ve yazışmaları kategorize ederek düzenli bir arşiv oluşturmak isteyenler için idealdir.</li><li><strong>Muhasebeciler:</strong> Aylık ve yıllık mali belgelerin güvenli saklanması için tercih edilir.</li><li><strong>Öğrenciler:</strong> Ders notlarını ve proje çıktılarını düzenli tutmak isteyen öğrenciler tarafından kullanılır.</li></ul>`,
    prestijKalem: `<h3>Kimler Kullanır?</h3><ul><li><strong>Yöneticiler ve İş İnsanları:</strong> İmza süreçlerinde, toplantı notlarında ve kişisel yazışmalarında prestijli bir görünüm arayanlar için idealdir.</li><li><strong>Koleksiyoncular:</strong> Özel seri ve sınırlı üretim kalemleri koleksiyonlarına eklemek isteyenler tarafından tercih edilir.</li><li><strong>Hediye Arayanlar:</strong> Doğum günü, terfi ve mezuniyet gibi özel günlerde anlamlı ve kalıcı bir hediye seçeneğidir.</li></ul>`,
    bant: `<h3>Kimler Kullanır?</h3><ul><li><strong>Ofis Çalışanları:</strong> Evrak birleştirme ve paketleme işlemlerinde pratik bir çözüm sunar.</li><li><strong>Depo ve Lojistik Ekipleri:</strong> Koli kapatma ve etiketleme süreçlerinde güvenilir yapışma gücü sağlar.</li></ul>`,
    zimba: `<h3>Kimler Kullanır?</h3><ul><li><strong>Ofis Çalışanları:</strong> Raporları ve çok sayfalı belgeleri birleştirmek için günlük olarak kullanılır.</li><li><strong>Öğrenciler:</strong> Ödevlerini, ders notlarını ve araştırma kağıtlarını düzenlemek için tercih ederler.</li></ul>`,
    genel: `<h3>Kimler Kullanır?</h3><ul><li><strong>Ofis Profesyonelleri:</strong> Günlük iş akışlarında verimlilik arayan herkes için uygundur.</li><li><strong>Öğrenciler:</strong> Okul ve üniversite ortamında düzenli çalışma alışkanlığını destekler.</li></ul>`
  };
  return BLOCKS[subType] || BLOCKS.genel;
}

// ============================================================
// SSS HAVUZLARI
// ============================================================
const FAQ_POOLS = {
  hesapMakinesi: [
    { question: "Güneş enerjisi ile çalışır mı?", answer: "Evet, hem güneş enerjisi hem de pil ile çalışan dual enerji sistemine sahiptir; aydınlık ortamlarda pil tüketmeden kullanabilirsiniz." },
    { question: "Kaç haneli ekranı var?", answer: "12 haneli geniş ekranı sayesinde büyük sayıları net ve okunabilir şekilde görüntüler." },
    { question: "Masa üzerinde kayar mı?", answer: "Kaymaz taban yapısı sayesinde masaüstünde sabit durur ve hızlı tuşlama sırasında hareket etmez." }
  ],
  ajanda: [
    { question: "Tükenmez ve dolma kalem mürekkebi geçirir mi?", answer: "Kaliteli kağıt yapısı sayesinde mürekkep geçirmez özelliğe sahiptir; tükenmez, jel ve dolma kalem ile sorunsuz kullanılabilir." },
    { question: "Tarihli mi tarihsiz mi?", answer: "Ürün özelliklerine göre değişmekle birlikte, hem tarihli hem tarihsiz modeller mevcuttur." },
    { question: "Kaç sayfa?", answer: "Model ve ebada göre değişen sayfa sayıları sunar; detaylı bilgi ürün özelliklerinde belirtilmektedir." }
  ],
  postit: [
    { question: "Söküldüğünde iz bırakır mı?", answer: "Hayır, özel yapışkan formülü sayesinde söküldüğünde yüzeyde kesinlikle iz veya kalıntı bırakmaz." },
    { question: "Yapışma gücü azalır mı?", answer: "Birkaç kez yapıştırılıp sökülse bile yapışma gücünü büyük ölçüde korur." },
    { question: "Üzerine kalemle yazılabilir mi?", answer: "Evet, tükenmez, kurşun ve keçeli kalem dahil tüm kalem türleri ile üzerine rahatlıkla yazılabilir." }
  ],
  dosya: [
    { question: "A4 kağıtlara uygun mu?", answer: "Evet, standart A4 boyutundaki tüm kağıtlar ve belgelerle tam uyumludur." },
    { question: "Tel mekanizması dayanıklı mı?", answer: "Güçlendirilmiş metal tel mekanizması, yoğun kullanımda bile uzun süreli dayanıklılık sunar." },
    { question: "Kaç sayfa kapasitesi var?", answer: "Model yapısına göre değişmekle birlikte genellikle 200-500 sayfa arasında belge barındırabilir." }
  ],
  prestijKalem: [
    { question: "Hangi mürekkep sistemini kullanıyor?", answer: "Konvertör ve kartuş uyumlu mürekkep sistemi sayesinde hem şişe mürekkep hem de pratik kartuş ile kullanılabilir." },
    { question: "Uç kalınlığı nedir?", answer: "Standart M (medium) uç genişliğine sahiptir; akıcı ve dengeli bir yazım deneyimi sunar." },
    { question: "Hediye kutusu ile mi geliyor?", answer: "Çoğu model özel hediye kutusu ile sunulmaktadır; detaylı bilgi ürün özelliklerinde belirtilmektedir." }
  ],
  bant: [
    { question: "Hangi yüzeylerde kullanılabilir?", answer: "Kağıt, karton, plastik ve cam gibi pek çok farklı yüzeyde etkili yapışma sağlar." },
    { question: "Kolay kopabiliyor mu?", answer: "Elle kolayca kesilebilir yapısı sayesinde makas gerektirmeden pratik kullanım sunar." }
  ],
  zimba: [
    { question: "Kaç sayfayı aynı anda zımbalayabilir?", answer: "Model kapasitesine göre 15-30 sayfa arasında tek seferde zımbalama yapabilir." },
    { question: "Hangi zımba tel numarasını kullanıyor?", answer: "Standart No:10 veya 24/6 zımba telleri ile uyumludur." }
  ],
  genel: [
    { question: "Ürün orijinal mi?", answer: "Evet, sitemizdeki tüm ürünler %100 orijinaldir ve MaviKalem güvencesiyle satılmaktadır." },
    { question: "Kargo süresi ne kadardır?", answer: "Siparişiniz aynı gün kargoya verilir ve 1-3 iş günü içinde teslim edilir." }
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
    hesapMakinesi: [
      { key: "Ürün Tipi", value: "Hesap Makinesi" },
      { key: "Ekran", value: "12 Haneli Geniş LCD Ekran" },
      { key: "Enerji Kaynağı", value: "Güneş Enerjisi + Pil (Dual)" },
      { key: "Kullanım Alanı", value: "Ofis, Muhasebe, Ticaret" }
    ],
    ajanda: [
      { key: "Ürün Tipi", value: "Ajanda / Planlama Defteri" },
      { key: "Kapak Yapısı", value: "PP / Suni Deri Kapak" },
      { key: "Kağıt Özelliği", value: "70-80 gr, Mürekkep Geçirmez" },
      { key: "Kullanım Alanı", value: "Toplantı Notları, Günlük Planlama" }
    ],
    postit: [
      { key: "Ürün Tipi", value: "Yapışkan Not Kağıdı (Post-it)" },
      { key: "Yapışkan Özelliği", value: "İz Bırakmayan, Tekrar Yapıştırılabilir" },
      { key: "Kullanım Alanı", value: "Ofis, Okul, Ev" }
    ],
    dosya: [
      { key: "Ürün Tipi", value: "Telli Dosya / Arşiv Dosyası" },
      { key: "Boyut Uyumu", value: "A4 (21x29,7 cm)" },
      { key: "Mekanizma", value: "Metal Tel Mekanizması" },
      { key: "Kullanım Alanı", value: "Ofis, Muhasebe, Arşivleme" }
    ],
    prestijKalem: [
      { key: "Ürün Tipi", value: "Prestij / Dolma Kalem" },
      { key: "Uç Tipi", value: "M (Medium) Uç" },
      { key: "Mürekkep Sistemi", value: "Konvertör + Kartuş Uyumlu" },
      { key: "Gövde Malzemesi", value: "Metal / Reçine" }
    ],
    bant: [
      { key: "Ürün Tipi", value: "Bant / Yapıştırıcı Bant" },
      { key: "Kullanım Alanı", value: "Paketleme, Onarım, Ofis" }
    ],
    zimba: [
      { key: "Ürün Tipi", value: "Zımba Makinesi" },
      { key: "Kapasite", value: "15-30 Sayfa" },
      { key: "Kullanım Alanı", value: "Ofis, Okul" }
    ]
  };

  const typeRows = TYPE_ROWS[subType] || [{ key: "Ürün Tipi", value: "Ofis Malzemesi" }, { key: "Kullanım Alanı", value: "Ofis, Okul" }];
  return [...base, ...typeRows];
}

// ============================================================
// KAPANIŞ CTA
// ============================================================
function buildOfficeClosing(title, seed) {
  const pool = [
    `<p>Ofis verimliliğinizi artırmak için <strong>${title}</strong> ürününe %100 orijinal ürün garantisi ve MaviKalem güvencesiyle hemen sahip olabilirsiniz.</p>`,
    `<p><strong>${title}</strong> ürününü MaviKalem güvencesi, orijinal ürün garantisi ve hızlı kargo avantajıyla hemen sipariş edebilirsiniz.</p>`,
    `<p>Profesyonel çalışma düzeninizi bir üst seviyeye taşımak için <strong>${title}</strong>, MaviKalem güvencesiyle sizleri bekliyor.</p>`
  ];
  return pickVariation(pool, seed);
}

// ============================================================
// ANA FONKSİYON
// ============================================================
function buildOfficeDescription(facts) {
  const seed = facts.variationSeed || facts.stockCode || facts.title;
  const subType = detectOfficeSubType(facts);
  const templateData = { title: facts.title, brand: facts.brand || "" };

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
  const closing = buildOfficeClosing(facts.title, seed);

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

module.exports = { buildOfficeDescription };
