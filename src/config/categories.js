const STATIONERY_CATEGORIES = new Set([
  "versatil kalem",
  "versatil kalemler",
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
  "defter ve kitap kapları"
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
  "12. sınıf"
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

function getCategoryStrategy(rawCategory) {
  const category = normalizeCategory(rawCategory);

  if (matchSet(category, BOOK_CATEGORIES)) {
    return { key: "book", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, SET_CATEGORIES)) {
    return { key: "set", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, TECH_CATEGORIES)) {
    return { key: "tech", mode: "hybrid", aiRecommended: true };
  }

  if (matchSet(category, STATIONERY_CATEGORIES)) {
    return { key: "stationery", mode: "template-first", aiRecommended: false };
  }

  return { key: "generic", mode: "template-first", aiRecommended: false };
}

module.exports = {
  getCategoryStrategy,
  normalizeCategory
};
