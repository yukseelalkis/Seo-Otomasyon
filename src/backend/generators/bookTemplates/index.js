/**
 * Kitap Şablonları — Ana Dispatcher
 *
 * facts objesindeki bilgilere bakarak doğru alt kategori template'ini seçer.
 * Alt kategoriler:
 *   EDEBİYAT: edebiyat-ataturk, edebiyat-diger
 *   SINAV: sinav-lgs, sinav-tyt, sinav-ayt, sinav-yds, sinav-kpss-ales-dgs
 *   OKULA YARDIMCI: okul-yardimci (1-8), okul-lise (9-12)
 */

const { buildEdebiyatAtaturkDescription } = require("./edebiyatAtaturk");
const { buildEdebiyatDigerDescription } = require("./edebiyatDiger");
const { buildSinavLgsDescription } = require("./sinavLgs");
const { buildSinavTytDescription } = require("./sinavTyt");
const { buildSinavAytDescription } = require("./sinavAyt");
const { buildSinavYdsDescription } = require("./sinavYds");
const { buildSinavKpssAlesDgsDescription } = require("./sinavKpssAlesDgs");
const { buildOkulYardimciDescription } = require("./okulYardimci");
const { buildOkulLiseDescription } = require("./okulLise");

/**
 * Ürün adı ve kategoriden hangi alt-şablonun kullanılacağını tespit eder.
 */
function detectBookSubCategory(facts) {
  const titleUpper = String(facts.title || "").toUpperCase();
  const categoryUpper = String(facts.category || "").toUpperCase();
  const mainCatUpper = String(facts.mainCategory || "").toUpperCase();
  const subCatUpper = String(facts.subCategory || "").toUpperCase();
  const combined = `${titleUpper} ${categoryUpper} ${mainCatUpper} ${subCatUpper}`;

  // --- SINAV KATEGORİLERİ (önce kontrol et, daha spesifik) ---

  // KPSS / ALES / DGS
  if (/\bKPSS\b/.test(combined) || /\bALES\b/.test(combined) || /\bDGS\b/.test(combined)) {
    return "sinav-kpss-ales-dgs";
  }

  // YDS / YÖKDİL
  if (/\bYDS\b/.test(combined) || /\bYÖKDİL\b/.test(combined) || /\bYOKDIL\b/.test(combined)) {
    return "sinav-yds";
  }

  // LGS
  if (/\bLGS\b/.test(combined)) {
    return "sinav-lgs";
  }

  // AYT (AYT spesifik kontrol, TYT'den önce)
  if (/\bAYT\b/.test(combined)) {
    return "sinav-ayt";
  }

  // TYT
  if (/\bTYT\b/.test(combined) || /\bYKS\b/.test(combined)) {
    return "sinav-tyt";
  }

  // --- SINIF SEVİYESİNE GÖRE AYRIM ---
  const classNum = extractClassNumber(facts);

  // 8. sınıf + soru bankası/deneme → LGS yardımcı
  if (classNum === 8 && hasExamIndicator(combined)) {
    return "sinav-lgs";
  }

  // 9-12. sınıf → Lise yardımcı
  if (classNum >= 9 && classNum <= 12) {
    return "okul-lise";
  }

  // 1-8. sınıf → İlkokul-ortaokul yardımcı
  if (classNum >= 1 && classNum <= 8) {
    return "okul-yardimci";
  }

  // --- OKULA YARDIMCI anahtar kelimeleri ---
  if (/YARDIMCI|MÜFREDAT|MFREDAT|DERS KİTABI|DERS KITABI/.test(combined)) {
    // Lise mi ilkokul/ortaokul mu?
    if (/LİSE|LISE/.test(combined)) {
      return "okul-lise";
    }
    return "okul-yardimci";
  }

  // --- EDEBİYAT KATEGORİLERİ ---

  // Atatürk kitapları
  if (/ATATÜRK|ATATURK|MUSTAFA KEMAL|CUMHURİYET|CUMHURIYET|KURTULUŞ SAVAŞI|KURTULUS SAVASI/.test(combined)) {
    return "edebiyat-ataturk";
  }

  // Genel soru bankası / deneme / sınav hazırlık (spesifik sınav belirtilmemiş)
  if (hasExamIndicator(combined)) {
    return "sinav-tyt"; // Varsayılan sınav template'i
  }

  // Varsayılan: Genel edebiyat
  return "edebiyat-diger";
}

/**
 * facts.classLevel'dan sınıf numarasını çıkarır.
 */
function extractClassNumber(facts) {
  const classLevel = facts.classLevel || "";
  const match = classLevel.match(/(\d{1,2})/);
  if (match) return parseInt(match[1], 10);

  // title'dan da dene
  const titleMatch = String(facts.title || "").match(/(\d{1,2})\.\s*[Ss]ınıf/);
  if (titleMatch) return parseInt(titleMatch[1], 10);

  return 0;
}

/**
 * Sınav/test göstergesi olup olmadığını kontrol eder.
 */
function hasExamIndicator(text) {
  return /SORU BANKASI|DENEME|KONU ANLATIM|FÖY|FOY|ÇÖZÜMLÜ|COZUMLU|HAZIRLIK|SORU KİTABI|TEST KİTABI/.test(text);
}

/**
 * Ana buildBookDescription fonksiyonu — mevcut sistemle aynı imza.
 */
function buildBookDescription(facts) {
  const subCategory = detectBookSubCategory(facts);

  switch (subCategory) {
    case "edebiyat-ataturk":
      return buildEdebiyatAtaturkDescription(facts);

    case "sinav-lgs":
      return buildSinavLgsDescription(facts);

    case "sinav-tyt":
      return buildSinavTytDescription(facts);

    case "sinav-ayt":
      return buildSinavAytDescription(facts);

    case "sinav-yds":
      return buildSinavYdsDescription(facts);

    case "sinav-kpss-ales-dgs":
      return buildSinavKpssAlesDgsDescription(facts);

    case "okul-yardimci":
      return buildOkulYardimciDescription(facts);

    case "okul-lise":
      return buildOkulLiseDescription(facts);

    case "edebiyat-diger":
    default:
      return buildEdebiyatDigerDescription(facts);
  }
}

module.exports = {
  buildBookDescription,
  detectBookSubCategory
};
