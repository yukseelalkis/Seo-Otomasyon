const axios = require("axios");
const { normalizeSpace } = require("./textUtils");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME ="gemini-2.5-flash";

let geminiEnabled = process.env.USE_GEMINI !== "false" && Boolean(API_KEY);

function isGeminiEnabled() {
  return geminiEnabled;
}

function disableGemini() {
  geminiEnabled = false;
}

function buildPrompt(facts, strategyKey, minAiWords) {
  const strategyLabel = {
    stationery: "kırtasiye ürünü",
    book: "eğitim kitabı",
    set: "ürün seti",
    tech: "teknoloji ürünü",
    art: "sanatsal ürün",
    bag: "çanta veya taşıma ürünü",
    office: "ofis ürünü",
    kids: "çocuk odaklı ürün",
    generic: "e-ticaret ürünü"
  }[strategyKey] || "e-ticaret ürünü";

  const technicalSummary = [
    facts.materyal ? `Materyal: ${facts.materyal}` : "",
    facts.boyut ? `Boyut: ${facts.boyut}` : "",
    facts.agirlik ? `Ağırlık: ${facts.agirlik}` : "",
    facts.bolmeSayisi ? `Bölme sayısı: ${facts.bolmeSayisi}` : "",
    facts.renk ? `Renk: ${facts.renk}` : "",
    facts.yasGrubu ? `Yaş grubu: ${facts.yasGrubu}` : "",
    facts.karakter ? `Karakter/tema: ${facts.karakter}` : "",
    facts.yikanabilirlik ? `Temizlik: ${facts.yikanabilirlik}` : ""
  ]
    .filter(Boolean)
    .join(" | ");

  return `
Görev: ${strategyLabel} için özgün ve doğal bir HTML ürün açıklaması yaz.

Ürün Bilgileri:
- Ürün adı: "${facts.title}"
- Marka: "${facts.brand}"
- Kategori: "${facts.category}"
- Ana kategori: "${facts.mainCategory || ""}"
- Alt kategori: "${facts.subCategory || ""}"
- Renk: "${facts.color}"
- Uç kalınlığı: "${facts.leadSize}"
- Model no: "${facts.modelNo}"
- Stok kodu: "${facts.stockCode}"
- Yapılandırılmış teknik bilgiler: "${technicalSummary}"
- Teknik özet: "${facts.detailsText || ""}"

Kurallar:
1. Sadece HTML döndür.
2. <h2> başlıkta ürünün tam adı geçsin.
3. En az 2 adet <p> paragrafı yaz.
4. 1 adet <ul> teknik özellik listesi yaz.
5. <h3>Sıkça Sorulan Sorular</h3> bölümü ve 3 kısa cevap yaz.
6. Ürün adı doğal biçimde metinde geçsin.
7. Teknik veri varsa ona sadık kal, yoksa nötr ve güvenli ifadeler kullan.
8. Spam, abartılı satış dili ve gereksiz tekrar kullanma.
9. Kategoriye uygun terminoloji kullan. Örneğin fırça için kalem dili kullanma, çanta için teknik cihaz dili kullanma.
10. Türkçe yaz ve en az ${minAiWords} kelime üret.
`;
}

async function callGeminiText(prompt) {
  if (!geminiEnabled) {
    throw new Error("GEMINI_DISABLED");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return normalizeSpace(text);
  } catch (error) {
    const apiError =
      error.response && error.response.data
        ? JSON.stringify(error.response.data)
        : error.message;

    if (/API_KEY_INVALID|API key not valid/i.test(apiError)) {
      disableGemini();
    }
    throw new Error(apiError);
  }
}

async function generateHtmlDescription(facts, strategyKey, minAiWords) {
  const prompt = buildPrompt(facts, strategyKey, minAiWords);
  return callGeminiText(prompt);
}

module.exports = {
  callGeminiText,
  generateHtmlDescription,
  isGeminiEnabled
};
