const { callGeminiText } = require("./geminiClient");
const { normalizeSpace } = require("./textUtils");

const FEATURE_KEYS = [
  "materyal",
  "boyut",
  "agirlik",
  "bolmeSayisi",
  "renk",
  "yasGrubu",
  "karakter",
  "yikanabilirlik"
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
    boyut: facts.boyut || facts.bagSize || MANUAL_PLACEHOLDER,
    agirlik: facts.agirlik || MANUAL_PLACEHOLDER,
    bolmeSayisi: facts.bolmeSayisi || MANUAL_PLACEHOLDER,
    renk: facts.renk || facts.bagColor || MANUAL_PLACEHOLDER,
    yasGrubu: facts.yasGrubu || "3-6 Yaş",
    karakter: facts.karakter || facts.character || MANUAL_PLACEHOLDER,
    yikanabilirlik: facts.yikanabilirlik || "Nemli bez ile silinebilir [KONTROL ET]"
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

function buildFeatureExtractionPrompt(facts, strategyKey) {
  const categoryLabel =
    strategyKey === "preschool-bag" ? "anaokul çantası" : facts.category || "ürün";

  return `
Görev: Aşağıdaki ürün metninden sadece doğrulanabilir teknik özellikleri çıkar.

Ürün Bilgileri:
- Ürün adı: "${facts.title}"
- Marka: "${facts.brand}"
- Kategori: "${facts.category}"
- Stok kodu: "${facts.stockCode}"
- Ürün metni: "${facts.detailsText || ""}"

Kurallar:
1. Sadece geçerli JSON döndür.
2. Sadece verilen ürün metnindeki bilgilere göre çıkarım yap.
3. Metinde açıkça geçmeyen hiçbir bilgiyi tahmin etme.
4. Emin olmadığın alanlar için boş string döndür.
5. HTML, açıklama, not, markdown veya ekstra metin ekleme.
6. Ürün tipi "${categoryLabel}" olduğundan aşağıdaki alanları döndür:
   - materyal
   - boyut
   - agirlik
   - bolmeSayisi
   - renk
   - yasGrubu
   - karakter
   - yikanabilirlik
7. Çıktı şeması tam olarak şu yapıda olsun:
{
  "Ozellikler": {
    "materyal": "",
    "boyut": "",
    "agirlik": "",
    "bolmeSayisi": "",
    "renk": "",
    "yasGrubu": "",
    "karakter": "",
    "yikanabilirlik": ""
  }
}
`;
}

async function generateFeatureExtraction(facts, strategyKey) {
  if (!normalizeSpace(facts.detailsText)) {
    return {
      Ozellikler: getEmptyFeatureSet(),
      Kaynak: "missing-input-details",
      Durum: "kaynak_yok",
      Hata: "Ürün detay metni bulunamadı."
    };
  }

  const prompt = buildFeatureExtractionPrompt(facts, strategyKey);
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
  return {
    Ozellikler: normalizeFeatureObject(rawFeatures),
    Kaynak: "gemini-from-input-details",
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
