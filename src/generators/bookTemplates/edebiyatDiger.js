/**
 * Genel Edebiyat Kitapları — Roman, Hikaye, Şiir ve diğer edebi eserler
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
  (t) => `<p><strong>${t.title}</strong>, okurun düşünce dünyasını genişleten ve farklı perspektifler sunan etkileyici bir edebiyat eseridir. ${t.publisher} tarafından okuyucuyla buluşturulan bu kitap, türünde öne çıkan içeriğiyle dikkat çekmektedir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, edebi zenginliği ve akıcı anlatımıyla okurları sayfalar arasında sürükleyici bir yolculuğa çıkaran nitelikli bir eserdir. ${t.publisher} kalitesiyle sunulan bu kitap, geniş bir okuyucu kitlesine hitap etmektedir.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.author ? t.author + "'ın kaleminden çıkan, " : ""}edebiyat dünyasına değerli bir katkı sunan özgün bir yapıttır. Derin temaları ve güçlü karakter kurgusuyla okurun ilgisini ilk sayfadan itibaren yakalar.</p>`,
  (t) => `<p><strong>${t.title}</strong>, modern edebiyatın seçkin örneklerinden biri olarak kütüphanelerde yerini alan, içerik zenginliğiyle öne çıkan bir eserdir. ${t.publisher} güvencesiyle okuyucuya sunulmuştur.</p>`,
  (t) => `<p><strong>${t.title}</strong>, okuma alışkanlığını güçlendirmek ve entelektüel ufku genişletmek isteyen herkes için hazırlanmış etkili bir eserdir. Sade dili ve derin kurgusuyla okurun beğenisini kazanmaktadır.</p>`,
  (t) => `<p><strong>${t.title}</strong>, ${t.publisher} tarafından yayımlanan, edebiyatseverlerin kütüphanelerinde mutlaka bulunması gereken seçkin bir eserdir. Güçlü anlatım dili ve evrensel temaları ile okurlarına unutulmaz bir okuma deneyimi sunar.</p>`
];

const DETAIL_POOL = [
  (t) => `<p>${t.author ? t.author + "'ın titiz çalışmasıyla kaleme alınan bu eser, " : "Bu eser, "}günümüz edebiyat okuruna eşsiz bir bakış açısı sunmaktadır. Zengin karakter kurgusu ve sürükleyici olay örgüsü sayesinde okur, kitabı elinden bırakamaz.</p>`,
  (t) => `<p>Eser boyunca işlenen evrensel temalar, farklı kültürel arka planlardaki okurları da cezbeden bir derinlik sergiler. ${t.publisher} tarafından özenle basılan bu kitap, hem konu hem de biçim olarak edebiyat dünyasında iz bırakmayı hedefler.</p>`,
  (t) => `<p>Kitap, bireysel ve toplumsal meseleler üzerine düşündürücü bir perspektif sunarak okurun zihin dünyasını zenginleştirir. Edebiyat tarihine anlamlı bir katkıda bulunan bu eser, kaliteli baskısı ve şık tasarımıyla da öne çıkar.</p>`,
  (t) => `<p>Duygusal derinliği ve düşünsel zenginliğiyle okuru farklı boyutlara taşıyan bu eser, keyifli bir okuma deneyimi sunarken aynı zamanda kalıcı izlenimler bırakır. ${t.publisher} kalitesi ve güvenilirliğiyle okurların karşısına çıkmaktadır.</p>`,
  (t) => `<p>Sürükleyici kurgusu ve etkili dil kullanımıyla dikkat çeken bu kitap, ${t.author ? t.author + "'ın edebi ustalığını " : "yazarın edebi yetkinliğini "}yansıtan nitelikli bir çalışmadır. Okurun dünyasını genişleten zengin bir içerik barındırır.</p>`
];

const FAQ_POOL = [
  { question: "Bu kitabın konusu nedir?", answer: "Kitap, toplumsal ve bireysel temalar etrafında şekillenmiş, okurun düşünce dünyasını zenginleştiren bir içerik sunmaktadır." },
  { question: "Kitap hangi okurlara hitap eder?", answer: "Edebiyat meraklıları, genel kültür okurları ve farklı perspektifler arayan tüm kitapseverler için uygundur." },
  { question: "Yazar hakkında bilgi var mı?", answer: "Kitabın yazarı, edebi çalışmalarıyla tanınan ve okuyucu tarafından beğeniyle takip edilen bir isimdir." },
  { question: "Kitap hediye olarak uygun mudur?", answer: "Evet, edebiyat severler için anlamlı ve keyifli bir hediye alternatifidir." },
  { question: "Kitabın baskı kalitesi nasıldır?", answer: "Yayınevinin standartlarına uygun, kaliteli kağıt ve baskı ile üretilmiştir." },
  { question: "Okuma seviyesi nedir?", answer: "Yetişkin okurlar ve genç yetişkinler için uygun bir dil ve anlatım kullanılmıştır." },
  { question: "Kitapta ek içerik veya ön söz var mıdır?", answer: "Eserin yapısına bağlı olarak ön söz, sonsöz veya ek notlar içerebilir; bu detaylar yayınevinin düzenlemesine göre şekillenmektedir." }
];

function buildEdebiyatDigerDescription(facts) {
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
    { key: "Ürün Tipi", value: facts.publicationType || "Kitap" },
    { key: "Tür", value: "Edebiyat" },
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

module.exports = { buildEdebiyatDigerDescription };
