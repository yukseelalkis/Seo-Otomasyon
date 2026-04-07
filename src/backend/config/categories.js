const STATIONERY_CATEGORIES = new Set([
  "versatil kalem",
  "versatil kalemler",
  "versatil",
  "versati",
  "kurşun kalem",
  "kursun kalem",
  "kalem ucu",
  "versatil kalem uçları",
  "versatil kalem uclari",
  "silgi",
  "kalemtıraş",
  "kalemtras",
  "fosforlu kalem",
  "tahta kalemleri",
  "tükenmez kalem",
  "tukenmez kalem",
  "roller kalem",
  "prestij kalem",
  "keçeli kalem",
  "keceli kalem",
  "okul gereçleri",
  "okul gerecleri",
  "defter & kağıt",
  "defter ve kitap kapları",
  "resim defteri",
  "fırça uçlu kalem",
  "firca uclu kalem",
  "sticker - etiket",
  "etiket",
  "makas"
]);

const WHITEBOARD_MARKER_CATEGORIES = new Set([
  "tahta kalemi",
  "tahta kalemleri",
  "beyaz tahta kalemi",
  "beyaz tahta kalemleri",
  "yazı tahtası kalemi",
  "yazi tahtasi kalemi",
  "whiteboard marker",
  "board marker",
  "flipchart kalemi"
]);

const BOOK_CATEGORIES = new Set([
  "eğitim kitapları",
  "egitim kitaplari",
  "soru bankası",
  "soru bankasi",
  "deneme",
  "tyt ayt hazırlık",
  "tyt ayt hazirlik",
  "5. sınıf",
  "6. sınıf",
  "7. sınıf",
  "8. sınıf",
  "9. sınıf",
  "10. sınıf",
  "11. sınıf",
  "12. sınıf",
  "edebiyat",
  "roman",
  "hikaye",
  "şiir",
  "atatürk",
  "ataturk",
  "cumhuriyet",
  "tyt",
  "ayt",
  "lgs",
  "yks",
  "kpss",
  "ales",
  "dgs",
  "yds",
  "yökdil",
  "yokdil",
  "konu anlatım",
  "konu anlatim",
  "yaprak test",
  "fasikül",
  "fasikul",
  "okula yardımcı",
  "okula yardimci",
  "yardımcı kitap",
  "yardimci kitap",
  "lise yardımcı",
  "lise yardimci",
  "ders kitabı",
  "ders kitabi",
  "müfredat",
  "mufredat",
  "kitap",
  "1. sınıf",
  "2. sınıf",
  "3. sınıf",
  "4. sınıf"
]);

const SET_CATEGORIES = new Set([
  "okul setleri",
  "okul öğrenci setleri",
  "okul ogrenci setleri",
  "boya setleri",
  "kırtasiye seti",
  "kirtasiye seti"
]);

const TECH_CATEGORIES = new Set([
  "elektronik",
  "aksesuar",
  "kulaklık",
  "kulaklik",
  "şarj",
  "sarj",
  "powerbank"
]);

const ART_CATEGORIES = new Set([
  "sanatsal",
  "akrilik boya",
  "akrilik boya fırçaları",
  "akrilik boya fircalari",
  "fırça",
  "firca",
  "boya fırçası",
  "boya fircasi",
  "parmak boya",
  "sulu boya",
  "suluboya",
  "guaj boya",
  "resim malzemeleri",
  "pastel boya",
  "kuruboya",
  "cam boyası",
  "cam boyasi",
  "yağlı boya",
  "yagli boya",
  "modelaj kili",
  "şekillendirme kili",
  "seramik",
  "modelaj",
  "şekillendirme",
  "eskiz",
  "eskiz defteri",
  "suluboya defteri",
  "resim kağıdı",
  "resim kagidi",
  "kanvas",
  "tuval",
  "şövale",
  "sovale"
]);

const PRESCHOOL_BAG_CATEGORIES = new Set([
  "anaokul çantası",
  "anaokul cantasi",
  "anaokulu çantası",
  "anaokulu cantasi",
  "anaokul sırt çantası",
  "anaokul sirt cantasi",
  "okul öncesi çanta",
  "okul oncesi canta",
  "okul öncesi sırt çantası",
  "kreş çantası",
  "kres cantasi",
  "okul öncesi"
]);

const BAG_CATEGORIES = new Set([
  "çanta ve matara",
  "canta ve matara",
  "sırt çantası",
  "sirt cantasi",
  "beslenme çantası",
  "beslenme cantasi",
  "matara",
  "kalem kutusu"
]);

const OFFICE_CATEGORIES = new Set([
  "ofis",
  "masa üstü",
  "masa ustu",
  "telli dosya",
  "dosya",
  "klasör",
  "klasor",
  "yapıştırıcı",
  "yapistirici",
  "bant",
  "hesap makinesi",
  "hesap makines",
  "calculator",
  "ajanda",
  "bloknot",
  "planlama defteri",
  "post-it",
  "post it",
  "yapışkan not",
  "yapiskan not",
  "küp blok",
  "kup blok",
  "prestij kalem",
  "dolma kalem",
  "zımba",
  "zimba",
  "delgeç",
  "delgec",
  "sunum dosyası",
  "sunum dosyasi",
  "poşet dosya",
  "poset dosya",
  "arşiv",
  "arsiv",
  "not defteri"
]);

const KIDS_CATEGORIES = new Set([
  "lisanslı ürünler",
  "lisansli urunler",
  "çocuk kitapları",
  "cocuk kitaplari",
  "çocuk - okul öncesi",
  "cocuk - okul oncesi",
  "çocuk - okul çağı",
  "cocuk - okul cagi",
  "oyun hamuru"
]);

function normalizeCategory(value) {
  return String(value || "").toLocaleLowerCase("tr-TR").trim();
}

function matchSet(category, setValues) {
  if (setValues.has(category)) return true;
  for (const item of setValues) {
    if (category.includes(item)) return true;
  }
  return false;
}

function getCategorySearchText(rawProduct) {
  if (typeof rawProduct === "string") {
    return normalizeCategory(rawProduct);
  }

  const category = rawProduct?.Kategori || rawProduct?.kategori || rawProduct?.category || "";
  const mainCategory = rawProduct?.mainCategory || "";
  const subCategory = rawProduct?.subCategory || "";
  const label = rawProduct?.UrunAdi || rawProduct?.urunAdi || rawProduct?.label || rawProduct?.name || "";

  return normalizeCategory([mainCategory, category, subCategory, label].filter(Boolean).join(" | "));
}

function getCategoryStrategy(rawProduct) {
  const category = getCategorySearchText(rawProduct);

  if (matchSet(category, BOOK_CATEGORIES)) {
    return { key: "book", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, ART_CATEGORIES)) {
    return { key: "art", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, SET_CATEGORIES)) {
    return { key: "set", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, TECH_CATEGORIES)) {
    return { key: "tech", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, PRESCHOOL_BAG_CATEGORIES)) {
    return { key: "preschool-bag", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, BAG_CATEGORIES)) {
    return { key: "bag", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, WHITEBOARD_MARKER_CATEGORIES)) {
    return { key: "whiteboard-marker", mode: "template-first", aiRecommended: false };
  }

  if (matchSet(category, OFFICE_CATEGORIES)) {
    return { key: "office", mode: "template-first", aiRecommended: false };
  }

  if (matchSet(category, KIDS_CATEGORIES)) {
    return { key: "kids", mode: "hybrid", aiRecommended: false };
  }

  if (matchSet(category, STATIONERY_CATEGORIES)) {
    return { key: "stationery", mode: "hybrid", aiRecommended: true };
  }

  return { key: "generic", mode: "template-first", aiRecommended: false };
}

module.exports = {
  getCategoryStrategy,
  normalizeCategory,
  getCategorySearchText
};