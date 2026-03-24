const { normalizeSpace, toLowerTr } = require("./textUtils");

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
  return found ? normalizeColor(found) : "Standart";
}

function getLeadSize(productName) {
  const mmMatch = productName.match(/(\d+(?:[.,]\d+)?)\s*mm/i);
  if (mmMatch) return `${mmMatch[1].replace(",", ".")} mm`;

  const pointMatch = productName.match(/(?:^|\s)(0\.[3579]|1\.0)(?:\s|$)/i);
  if (pointMatch) return `${pointMatch[1]} mm`;

  return "0.7 mm";
}

function getModelNo(productName, stockCode) {
  const modelMatch = productName.match(/(\d{5,8})(?!.*\d)/);
  if (modelMatch) return modelMatch[1];
  return normalizeSpace(stockCode) || "Belirtilmemiş";
}

function getBrand(productName) {
  const normalized = normalizeSpace(productName);
  const parts = normalized.split(" ").filter(Boolean);
  return parts.slice(0, 2).join(" ") || "MaviKalem";
}

function extractProductFacts(product) {
  const title = normalizeSpace(product.UrunAdi || product.urunAdi || product.name);
  const category = normalizeSpace(product.Kategori || product.kategori || "Genel");
  const stockCode = normalizeSpace(product.StokKodu || product.stokKodu || "");

  return {
    title,
    keyword: title,
    category,
    stockCode: stockCode || "Belirtilmemiş",
    brand: getBrand(title),
    color: getColorFromName(title),
    leadSize: getLeadSize(title),
    modelNo: getModelNo(title, stockCode)
  };
}

module.exports = {
  extractProductFacts
};
