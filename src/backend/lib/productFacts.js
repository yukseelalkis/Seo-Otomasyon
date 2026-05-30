const { normalizeSpace, toLowerTr, stripHtml, normalizeTurkishForMatch } = require("./textUtils");

const COLOR_MAP = [
  "siyah",
  "mavi",
  "kirmizi",
  "kırmızı",
  "yesil",
  "yeşil",
  "turuncu",
  "sari",
  "sarı",
  "mor",
  "pembe",
  "gri",
  "beyaz",
  "lacivert"
];

function normalizeColor(value) {
  if (value === "kirmizi") return "Kırmızı";
  if (value === "yesil") return "Yeşil";
  if (value === "sari") return "Sarı";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getColorFromName(productName) {
  const lower = toLowerTr(productName);
  const found = COLOR_MAP.find((color) => lower.includes(color));
  return found ? normalizeColor(found) : "";
}

function getLeadSize(productName) {
  const mmMatch = productName.match(/(\d+(?:[.,]\d+)?)\s*mm/i);
  if (mmMatch) return `${mmMatch[1].replace(",", ".")} mm`;

  const pointMatch = productName.match(/(?:^|\s)(0\.[3579]|1\.0)(?:\s|$)/i);
  if (pointMatch) return `${pointMatch[1]} mm`;

  return "";
}

function getModelNo(productName, stockCode) {
  const modelMatch = productName.match(/(\d{5,8})(?!.*\d)/);
  if (modelMatch) return modelMatch[1];
  return "";
}

function getBrand(productName) {
  const normalized = normalizeSpace(productName);
  const parts = normalized.split(" ").filter(Boolean);
  return parts.slice(0, 2).join(" ") || "MaviKalem";
}

function inferCategory(product) {
  return normalizeSpace(
    product.Kategori ||
      product.kategori ||
      product.subCategory ||
      product.category ||
      product.mainCategory ||
      "Genel"
  );
}

function extractBrushFacts(title, detailsText) {
  const combined = `${title} ${detailsText}`;
  const normalized = normalizeTurkishForMatch(combined);
  const seriesMatch = combined.match(/seri\s*([A-Za-z0-9-]+)/i);
  const numberMatch = combined.match(/(?:no|nr|numara)\s*[:.]?\s*([A-Za-z0-9-]+)/i);

  let brushType = "";
  if (normalized.includes("duz")) brushType = "Düz Uç";
  else if (normalized.includes("yuvarlak")) brushType = "Yuvarlak Uç";
  else if (normalized.includes("yelpaze")) brushType = "Yelpaze Uç";

  let material = "";
  if (normalized.includes("sentetik")) material = "Sentetik Kıl";
  else if (normalized.includes("dogal")) material = "Doğal Kıl";

  return {
    brushType,
    material,
    series: seriesMatch ? normalizeSpace(seriesMatch[1]) : "",
    sizeNo: numberMatch ? normalizeSpace(numberMatch[1]) : ""
  };
}

function extractBookFacts(title, detailsText) {
  const combined = `${title} ${detailsText}`;
  const classMatch = combined.match(/(\d{1,2})\.\s*Sınıf/i);
  const examMatch = combined.match(/\b(TYT|AYT|LGS|YKS|KPSS|ALES|DGS|YDS|YÖKDİL)\b/i);
  const lessonMatch = combined.match(/\b(Fizik|Kimya|Matematik|Türkçe|Biyoloji|Geometri|Tarih|Coğrafya|Fen|İngilizce|Edebiyat|Felsefe|Din Kültürü|Sosyal Bilgiler|Vatandaşlık)\b/i);
  const questionTypeMatch = combined.match(/\b(Soru Bankası|Deneme|Konu Anlatım|Föy|Foy|Konu Anlatımlı|Yaprak Test|Fasikül|Soru Kitabı|Test Kitabı)\b/i);
  const pageMatch = combined.match(/(\d{2,4})\s*(?:sayfa|syf|sf|yaprak|yp)/i);
  const sizeMatch = combined.match(/(\d{1,2})\s*[xX×]\s*(\d{1,2})\s*cm/i);
  const isbnMatch = combined.match(/(97[89]\d{10})/i);

  return {
    classLevel: classMatch ? `${classMatch[1]}. Sınıf` : "",
    examType: examMatch ? examMatch[1].toUpperCase() : "",
    lesson: lessonMatch ? lessonMatch[1] : "",
    publicationType: questionTypeMatch ? normalizeSpace(questionTypeMatch[1]) : "",
    sayfaSayisi: pageMatch ? pageMatch[1] : "",
    ebat: sizeMatch ? `${sizeMatch[1]} x ${sizeMatch[2]} cm` : "",
    isbn: isbnMatch ? isbnMatch[1] : ""
  };
}

function extractBagFacts(title, detailsText) {
  const combined = `${title} ${detailsText}`;
  const normalized = normalizeTurkishForMatch(combined);

  let usageType = "";
  if (normalized.includes("sirt cantasi")) usageType = "Sırt Çantası";
  else if (normalized.includes("beslenme cantasi")) usageType = "Beslenme Çantası";
  else if (normalized.includes("kalem kutusu")) usageType = "Kalem Kutusu";

  let pattern = "";
  const parts = ["kuromi", "unicorn", "dino", "spiderman", "frozen", "arabalar"];
  const found = parts.find((item) => normalized.includes(item));
  if (found) pattern = found.charAt(0).toUpperCase() + found.slice(1);

  return {
    usageType,
    pattern
  };
}

const PRESCHOOL_CHARACTER_MAP = [
  { keys: ["spiderman", "spider man", "örümcek adam"], label: "Spiderman" },
  { keys: ["frozen", "karlar ülkesi", "elsa", "anna"], label: "Frozen" },
  { keys: ["peppa", "peppa pig", "peppa pıg"], label: "Peppa Pig" },
  { keys: ["paw patrol", "paw", "patrol"], label: "Paw Patrol" },
  { keys: ["unicorn", "unicorn"], label: "Unicorn" },
  { keys: ["kuromi"], label: "Kuromi" },
  { keys: ["minnie", "mickey", "disney"], label: "Disney" },
  { keys: ["stitch", "lilo"], label: "Stitch" },
  { keys: ["batman"], label: "Batman" },
  { keys: ["süpermen", "superman"], label: "Superman" },
  { keys: ["pjmasks", "pj masks", "pijamaskeliler"], label: "PJ Masks" },
  { keys: ["dino", "dinozor"], label: "Dinozor" },
  { keys: ["arabalar", "mcqueen", "cars"], label: "Cars" },
  { keys: ["minions", "minion"], label: "Minions" },
  { keys: ["bluey"], label: "Bluey" }
];

const BAG_SIZE_PATTERN = /(\d{2,3})\s*[xX×]\s*(\d{2,3})(?:\s*[xX×]\s*(\d{2,3}))?\s*cm/i;

function extractPreschoolBagFacts(title, detailsText) {
  const combined = `${title} ${detailsText}`;
  const normalized = normalizeTurkishForMatch(combined);

  let character = "";
  for (const entry of PRESCHOOL_CHARACTER_MAP) {
    if (entry.keys.some((key) => normalized.includes(normalizeTurkishForMatch(key)))) {
      character = entry.label;
      break;
    }
  }

  let bagColor = "";
  const colorFound = COLOR_MAP.find((color) => normalized.includes(normalizeTurkishForMatch(color)));
  if (colorFound) bagColor = normalizeColor(colorFound);

  let bagSize = "";
  const sizeMatch = combined.match(BAG_SIZE_PATTERN);
  if (sizeMatch) {
    bagSize = sizeMatch[3]
      ? `${sizeMatch[1]}x${sizeMatch[2]}x${sizeMatch[3]} cm`
      : `${sizeMatch[1]}x${sizeMatch[2]} cm`;
  }

  return {
    character,
    bagColor,
    bagSize
  };
}

function extractArtFacts(title, detailsText) {
  const normalized = normalizeTurkishForMatch(`${title} ${detailsText}`);
  let medium = "";
  if (normalized.includes("akrilik")) medium = "Akrilik Boya";
  else if (normalized.includes("sulu boya") || normalized.includes("suluboya")) medium = "Sulu Boya";
  else if (normalized.includes("guaj")) medium = "Guaj Boya";

  const countMatch = `${title} ${detailsText}`.match(/(\d+)\s*(adet|li|lü|lu|lu set|renk)/i);

  return {
    medium,
    countInfo: countMatch ? normalizeSpace(countMatch[0]) : ""
  };
}

function extractWhiteboardMarkerFacts(title, detailsText) {
  const combined = `${title} ${detailsText}`;
  const normalized = normalizeTurkishForMatch(combined);

  let productType = "";
  if (
    normalized.includes("tahta kalemi") ||
    normalized.includes("beyaz tahta kalemi") ||
    normalized.includes("yazi tahtasi kalemi")
  ) {
    productType = "Tahta Kalemi";
  }

  let usageArea = "";
  const usageAreas = [];
  if (normalized.includes("beyaz yazi tahtasi")) usageAreas.push("Beyaz Tahta");
  if (normalized.includes("flipchart")) usageAreas.push("Flipchart");
  if (usageAreas.length > 0) usageArea = usageAreas.join(", ");

  let tipType = "";
  if (normalized.includes("yuvarlak uc")) tipType = "Yuvarlak Uç";
  else if (normalized.includes("kesik uc")) tipType = "Kesik Uç";

  let tipThickness = "";
  const thicknessMatch = combined.match(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s*mm/i);
  if (thicknessMatch) {
    tipThickness = `${thicknessMatch[1].replace(",", ".")} - ${thicknessMatch[2].replace(",", ".")} mm`;
  } else {
    const singleThicknessMatch = combined.match(/(\d+(?:[.,]\d+)?)\s*mm/i);
    if (singleThicknessMatch) {
      tipThickness = `${singleThicknessMatch[1].replace(",", ".")} mm`;
    }
  }

  let inkType = "";
  if (normalized.includes("pigment murekkep")) inkType = "Pigment Mürekkep";

  let erasable = false;
  if (
    normalized.includes("kuru bezle silinebilir") ||
    normalized.includes("silinebilir")
  ) {
    erasable = true;
  }

  let technology = "";
  if (normalized.includes("cap-off")) {
    technology = "Cap-off (Kurumaya Dayanıklı)";
  }

  let refillable = false;
  if (
    normalized.includes("yeniden doldurulabilir") ||
    normalized.includes("yedek murekkep ile yeniden doldurulabilir")
  ) {
    refillable = true;
  }

  let chemicalContent = "";
  if (normalized.includes("butil asetat icermez")) {
    chemicalContent = "Bütil asetat içermez";
  }

  return {
    productType,
    usageArea,
    tipType,
    tipThickness,
    inkType,
    erasable,
    technology,
    refillable,
    chemicalContent
  };
}

function extractProductFacts(product) {
  const title = normalizeSpace(product.UrunAdi || product.urunAdi || product.label || product.name);
  const category = inferCategory(product);
  const stockCode = normalizeSpace(product.StokKodu || product.stokKodu || product.stockCode || "");
  const brand = normalizeSpace(product.Marka || product.marka || product.brand) || getBrand(title);
  const detailsHtml = normalizeSpace(
    product.details ||
      product.Details ||
      product.AciklamaHtml ||
      product.aciklamaHtml ||
      ""
  );
  let detailsText = stripHtml(detailsHtml);

  const detayPlain = normalizeSpace(product.Detay || product.detay || "");
  let aciklamaPlain = normalizeSpace(product.Aciklama || product.aciklama || "");
  if (aciklamaPlain && (aciklamaPlain.includes("<") || aciklamaPlain.includes("&lt;"))) {
    aciklamaPlain = normalizeSpace(stripHtml(aciklamaPlain));
  }
  const extraParts = [detayPlain, aciklamaPlain].filter(Boolean);
  if (extraParts.length > 0) {
    const merged = extraParts.join("\n").trim();
    detailsText = detailsText ? `${detailsText}\n${merged}`.trim() : merged;
  }
  const mainCategory = normalizeSpace(product.AnaKategori || product.mainCategory || "");
  const subCategory = normalizeSpace(product.AltKategori || product.subCategory || "");

  const brushFacts = extractBrushFacts(title, detailsText);
  const bookFacts = extractBookFacts(title, detailsText);
  const bagFacts = extractBagFacts(title, detailsText);
  const artFacts = extractArtFacts(title, detailsText);
  const preschoolBagFacts = extractPreschoolBagFacts(title, detailsText);
  const whiteboardMarkerFacts = extractWhiteboardMarkerFacts(title, detailsText);

  // Kitap-spesifik alanlar (ürün verisinden veya extractBookFacts'ten)
  const yazar = normalizeSpace(
    product.Yazar || product.yazar || product.author || ""
  );
  const yayinevi = normalizeSpace(
    product.Yayinevi || product.yayinevi || product.publisher || ""
  );
  const sayfaSayisi = normalizeSpace(
    product.SayfaSayisi || product.sayfaSayisi || product.pageCount || bookFacts.sayfaSayisi || ""
  );
  const ebat = normalizeSpace(
    product.Ebat || product.ebat || product.dimensions || bookFacts.ebat || ""
  );
  const isbn = normalizeSpace(
    product.ISBN || product.isbn || bookFacts.isbn || ""
  );

  return {
    title,
    keyword: title,
    category,
    mainCategory,
    subCategory,
    stockCode: stockCode || "Belirtilmemiş",
    brand,
    color: getColorFromName(title),
    leadSize: getLeadSize(title),
    modelNo: getModelNo(title, stockCode),
    detailsHtml,
    detailsText,
    materyal: normalizeSpace(product.materyal || ""),
    kumasOzelligi: normalizeSpace(product.kumasOzelligi || ""),
    boyut: normalizeSpace(product.boyut || preschoolBagFacts.bagSize || ""),
    agirlik: normalizeSpace(product.agirlik || ""),
    bolmeSayisi: normalizeSpace(product.bolmeSayisi || ""),
    yanBolme: normalizeSpace(product.yanBolme || ""),
    askiOzelligi: normalizeSpace(product.askiOzelligi || ""),
    renk: normalizeSpace(product.renk || preschoolBagFacts.bagColor || ""),
    yasGrubu: normalizeSpace(product.yasGrubu || ""),
    karakter: normalizeSpace(product.karakter || preschoolBagFacts.character || ""),
    yikanabilirlik: normalizeSpace(product.yikanabilirlik || ""),
    uyumluUrunler: normalizeSpace(product.uyumluUrunler || ""),
    yazar,
    yayinevi: yayinevi || brand,
    sayfaSayisi,
    ebat,
    isbn,
    ...brushFacts,
    ...bookFacts,
    ...bagFacts,
    ...artFacts,
    ...preschoolBagFacts,
    ...whiteboardMarkerFacts
  };
}

module.exports = {
  extractProductFacts
};