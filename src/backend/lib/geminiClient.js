const axios = require("axios");
const { normalizeSpace } = require("./textUtils");
const { buildDynamicDescriptionPrompt, buildGeminiUserPrompt } = require("./descriptionAiPrompt");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";

let geminiEnabled = process.env.USE_GEMINI !== "false" && Boolean(API_KEY);

function isGeminiEnabled() {
  return geminiEnabled;
}

function disableGemini() {
  geminiEnabled = false;
}

/**
 * @param {string} systemInstruction
 * @param {string} userText
 */
async function callGeminiWithSystemInstruction(systemInstruction, userText) {
  if (!geminiEnabled) {
    throw new Error("GEMINI_DISABLED");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const body = {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [{ parts: [{ text: userText }] }]
  };

  try {
    const response = await axios.post(url, body);
    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return normalizeSpace(text);
  } catch (error) {
    const apiError =
      error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;

    if (/API_KEY_INVALID|API key not valid/i.test(apiError)) {
      disableGemini();
    }
    throw new Error(apiError);
  }
}

/** @deprecated tek parça prompt için; geriye dönük */
async function callGeminiText(singlePrompt) {
  return callGeminiWithSystemInstruction(
    "Sen uzman bir e-ticaret SEO yazarısın. Talimatlara uyarak HTML ürün açıklaması üret.",
    singlePrompt
  );
}

async function generateHtmlDescription(facts, strategyKey, minAiWords) {
  const { systemInstruction } = buildDynamicDescriptionPrompt({
    kategori: facts.category,
    urunAdi: facts.title,
    detayMetni: facts.detailsText || ""
  });
  const userText = buildGeminiUserPrompt(facts, strategyKey, minAiWords);
  return callGeminiWithSystemInstruction(systemInstruction, userText);
}

module.exports = {
  callGeminiText,
  callGeminiWithSystemInstruction,
  generateHtmlDescription,
  isGeminiEnabled
};
