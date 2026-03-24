const axios = require("axios");
const { normalizeSpace } = require("./textUtils");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
    generic: "e-ticaret ürünü"
  }[strategyKey] || "e-ticaret ürünü";

  return `
Görev: ${strategyLabel} için özgün ve doğal bir HTML ürün açıklaması yaz.

Ürün Bilgileri:
- Ürün adı: "${facts.title}"
- Marka: "${facts.brand}"
- Kategori: "${facts.category}"
- Renk: "${facts.color}"
- Uç kalınlığı: "${facts.leadSize}"
- Model no: "${facts.modelNo}"
- Stok kodu: "${facts.stockCode}"

Kurallar:
1. Sadece HTML döndür.
2. <h2> başlıkta ürünün tam adı geçsin.
3. En az 2 adet <p> paragrafı yaz.
4. 1 adet <ul> teknik özellik listesi yaz.
5. <h3>Sıkça Sorulan Sorular</h3> bölümü ve 3 kısa cevap yaz.
6. Ürün adı doğal biçimde metinde geçsin.
7. Uydurma teknik özellik kullanma.
8. Spam, abartılı satış dili ve gereksiz tekrar kullanma.
9. Türkçe yaz ve en az ${minAiWords} kelime üret.
`;
}

async function generateHtmlDescription(facts, strategyKey, minAiWords) {
  if (!geminiEnabled) {
    throw new Error("GEMINI_DISABLED");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  const prompt = buildPrompt(facts, strategyKey, minAiWords);

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

module.exports = {
  generateHtmlDescription,
  isGeminiEnabled
};
