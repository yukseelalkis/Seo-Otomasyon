const { callGeminiText } = require("./geminiClient");
const { normalizeSpace } = require("./textUtils");

const FEATURE_KEYS = [
  "materyal",
  "kumasOzelligi",
  "boyut",
  "agirlik",
  "bolmeSayisi",
  "yanBolme",
  "askiOzelligi",
  "renk",
  "yasGrubu",
  "karakter",
  "yikanabilirlik",
  "uyumluUrunler"
];

const MANUAL_PLACEHOLDER = "[DOLDUR]";

function getEmptyFeatureSet() {
  return FEATURE_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});
}

function getManualFeatureTemplate(facts = {}) {
  return normalizeFeatureObject({
    materyal: facts.materyal || MANUAL_PLACEHOLDER,
    kumasOzelligi: facts.kumasOzelligi || MANUAL_PLACEHOLDER,
    boyut: facts.boyut || facts.bagSize || MANUAL_PLACEHOLDER,
    agirlik: facts.agirlik || MANUAL_PLACEHOLDER,
    bolmeSayisi: facts.bolmeSayisi || MANUAL_PLACEHOLDER,
    yanBolme: facts.yanBolme || MANUAL_PLACEHOLDER,
    askiOzelligi: facts.askiOzelligi || MANUAL_PLACEHOLDER,
    renk: facts.renk || facts.bagColor || MANUAL_PLACEHOLDER,
    yasGrubu: facts.yasGrubu || "3-6 Yaş",
    karakter: facts.karakter || facts.character || MANUAL_PLACEHOLDER,
    yikanabilirlik: facts.yikanabilirlik || "Nemli bez ile silinebilir [KONTROL ET]",
    uyumluUrunler: facts.uyumluUrunler || MANUAL_PLACEHOLDER
  });
}

function normalizeDimension(value) {
  return normalizeSpace(String(value || ""))
    .replace(/\s*[xX×]\s*/g, "x")
    .replace(/\s*cm\b/gi, " cm");
}

function normalizeWeight(value) {
  return normalizeSpace(String(value || ""))
    .replace(/(\d)\s*(gr|g)\b/gi, "$1 gr")
    .replace(/(\d)\s*kg\b/gi, "$1 kg");
}

function normalizeAgeGroup(value) {
  return normalizeSpace(String(value || ""))
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*yas\b/gi, " Yaş")
    .replace(/\s*yaş\b/gi, " Yaş");
}

function normalizeFeatureValue(key, value) {
  const normalized = normalizeSpace(value);
  if (!normalized) return "";

  if (key === "boyut") return normalizeDimension(normalized);
  if (key === "agirlik") return normalizeWeight(normalized);
  if (key === "yasGrubu") return normalizeAgeGroup(normalized);
  return normalized;
}

function normalizeFeatureObject(rawFeatures) {
  const normalized = getEmptyFeatureSet();
  if (!rawFeatures || typeof rawFeatures !== "object") {
    return normalized;
  }

  for (const key of FEATURE_KEYS) {
    normalized[key] = normalizeFeatureValue(key, rawFeatures[key]);
  }

  return normalized;
}

function extractJsonText(responseText) {
  const cleaned = normalizeSpace(responseText);
  const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    return cleaned.slice(objectStart, objectEnd + 1);
  }

  return cleaned;
}

function buildFeatureExtractionPrompt(facts, strategyKey, webSourceText) {
  const categoryLabel =
    strategyKey === "preschool-bag" ? "anaokul çantası" : facts.category || "ürün";

  const webSection = webSourceText
    ? `- Üretici/mağaza sitesinden alınan ürün bilgisi: "${webSourceText}"`
    : "";

  return `
Görev: Aşağıdaki ürün bilgilerinden sadece doğrulanabilir teknik özellikleri çıkar.

Ürün Bilgileri:
- Ürün adı: "${facts.title}"
- Marka: "${facts.brand}"
- Kategori: "${facts.category}"
- Stok kodu: "${facts.stockCode}"
- Ürün metni (mağaza veritabanı): "${facts.detailsText || ""}"
${webSection}

Kurallar:
1. Sadece geçerli JSON döndür.
2. Hem ürün metninden hem de üretici/mağaza sitesi bilgisinden çıkarım yapabilirsin.
3. İki kaynak çelişirse üretici sitesindeki bilgiyi tercih et.
4. Hiçbir kaynakta açıkça geçmeyen bilgiyi tahmin etme.
5. Emin olmadığın alanlar için boş string döndür.
6. HTML, açıklama, not, markdown veya ekstra metin ekleme.
7. Ürün tipi "${categoryLabel}" olduğundan aşağıdaki alanları döndür:
   - materyal
   - kumasOzelligi
   - boyut
   - agirlik
   - bolmeSayisi
   - yanBolme
   - askiOzelligi
   - renk
   - yasGrubu
   - karakter
   - yikanabilirlik
   - uyumluUrunler
8. Çıktı şeması tam olarak şu yapıda olsun:
{
  "Ozellikler": {
    "materyal": "",
    "kumasOzelligi": "",
    "boyut": "",
    "agirlik": "",
    "bolmeSayisi": "",
    "yanBolme": "",
    "askiOzelligi": "",
    "renk": "",
    "yasGrubu": "",
    "karakter": "",
    "yikanabilirlik": "",
    "uyumluUrunler": ""
  }
}
`;
}

async function generateFeatureExtraction(facts, strategyKey, webSourceText) {
  const hasInputDetails = Boolean(normalizeSpace(facts.detailsText));
  const hasWebSource = Boolean(normalizeSpace(webSourceText));

  if (!hasInputDetails && !hasWebSource) {
    return {
      Ozellikler: getEmptyFeatureSet(),
      Kaynak: "missing-all-sources",
      Durum: "kaynak_yok",
      Hata: "Ne ürün detay metni ne de web kaynağı bulunamadı."
    };
  }

  const prompt = buildFeatureExtractionPrompt(facts, strategyKey, webSourceText);
  const responseText = await callGeminiText(prompt);
  const jsonText = extractJsonText(responseText);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return {
      Ozellikler: getEmptyFeatureSet(),
      Kaynak: "gemini-invalid-json",
      Durum: "hata",
      Hata: `Gemini JSON parse hatası: ${error.message}`
    };
  }

  const rawFeatures = parsed?.Ozellikler || parsed?.ozellikler || parsed;
  const sourceLabel = hasWebSource
    ? hasInputDetails ? "gemini-from-input+web" : "gemini-from-web"
    : "gemini-from-input-details";

  return {
    Ozellikler: normalizeFeatureObject(rawFeatures),
    Kaynak: sourceLabel,
    Durum: "bekliyor",
    Hata: ""
  };
}

module.exports = {
  FEATURE_KEYS,
  MANUAL_PLACEHOLDER,
  generateFeatureExtraction,
  getEmptyFeatureSet,
  getManualFeatureTemplate
};
