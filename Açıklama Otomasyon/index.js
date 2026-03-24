require("dotenv").config();
const fs = require("fs");
const path = require("path");

const seoRules = require("./config/seoRules");
const { getCategoryStrategy, normalizeCategory } = require("./config/categories");
const { extractProductFacts } = require("./lib/productFacts");
const { buildSeoTitle, buildMetaDescription, buildMetaKeywords, buildSeoChecklist } = require("./lib/seo");
const { getHighestSimilarity } = require("./lib/similarity");
const { generateHtmlDescription, isGeminiEnabled } = require("./lib/geminiClient");
const { stripHtml, countWords, normalizeSpace, sleep } = require("./lib/textUtils");

const { buildStationeryDescription } = require("./generators/stationeryTemplate");
const { buildBookDescription } = require("./generators/bookTemplate");
const { buildSetDescription } = require("./generators/setTemplate");
const { buildTechDescription } = require("./generators/techTemplate");
const { buildGenericDescription } = require("./generators/genericTemplate");

const INPUT_FILE = path.join(__dirname, process.env.INPUT_FILE || "urunler.json");
const OUTPUT_FILE = path.join(__dirname, process.env.OUTPUT_FILE || "urunler_aciklamali.json");
const TARGET_CATEGORY = normalizeCategory(process.env.TARGET_CATEGORY || "");
const API_DELAY_MS = Number(process.env.API_DELAY_MS || 1200);

function shouldIncludeByCategory(rawCategory) {
  if (!TARGET_CATEGORY) return true;
  const category = normalizeCategory(rawCategory);
  if (category === TARGET_CATEGORY) return true;
  return category === `${TARGET_CATEGORY}ler`;
}

function getTemplateDescription(strategyKey, facts) {
  switch (strategyKey) {
    case "stationery":
      return buildStationeryDescription(facts);
    case "book":
      return buildBookDescription(facts);
    case "set":
      return buildSetDescription(facts);
    case "tech":
      return buildTechDescription(facts);
    default:
      return buildGenericDescription(facts);
  }
}

function validateDescription(description, facts, existingDescriptions) {
  const plainText = stripHtml(description);
  const seoChecklist = buildSeoChecklist(facts.title, facts.keyword, plainText);
  const highestSimilarity = getHighestSimilarity(description, existingDescriptions);
  const looksLikeHtml = /<h2>.*<\/h2>/i.test(description) && /<ul>.*<\/ul>/i.test(description);
  const words = countWords(plainText);

  const qualityChecks = [
    { rule: "HTML başlık etiketi mevcut.", passed: /<h2>.*<\/h2>/i.test(description) },
    { rule: "HTML özellik listesi mevcut.", passed: /<ul>.*<\/ul>/i.test(description) },
    {
      rule: `Açıklama en az ${seoRules.minAiWords} kelime olmalıdır. Kelime Sayısı: ${words}`,
      passed: words >= seoRules.minAiWords
    },
    {
      rule: `Benzerlik skoru ${seoRules.similarityThreshold.toFixed(2)} değerini aşmamalıdır. Mevcut Skor: ${highestSimilarity.toFixed(2)}`,
      passed: highestSimilarity <= seoRules.similarityThreshold
    }
  ];

  return {
    wordCount: words,
    highestSimilarity,
    looksLikeHtml,
    seoChecklist,
    qualityChecks,
    passed: looksLikeHtml && [...seoChecklist, ...qualityChecks].every((item) => item.passed)
  };
}

async function generateRecord(product, approvedDescriptions) {
  const facts = extractProductFacts(product);
  const strategy = getCategoryStrategy(facts.category);
  const templateDescription = getTemplateDescription(strategy.key, facts);

  let description = templateDescription;
  let source = "local-template";
  let validation = validateDescription(description, facts, approvedDescriptions);
  let fallbackReason = null;

  const canUseAi = isGeminiEnabled() && strategy.aiRecommended;
  if (canUseAi) {
    try {
      const aiDescription = await generateHtmlDescription(facts, strategy.key, seoRules.minAiWords);
      const aiValidation = validateDescription(aiDescription, facts, approvedDescriptions);
      if (aiValidation.passed) {
        description = aiDescription;
        source = "gemini";
        validation = aiValidation;
      } else {
        source = "local-fallback";
        fallbackReason = "AI çıktısı kalite veya benzerlik kontrolünü geçemedi.";
      }
    } catch (error) {
      source = "local-fallback";
      fallbackReason = `Gemini isteği başarısız oldu: ${error.message}`;
    }
  }

  const seoTitle = buildSeoTitle(facts.title);
  const metaDescription = buildMetaDescription(facts);
  const metaKeywords = buildMetaKeywords(facts);
  const seoChecklist = buildSeoChecklist(facts.title, facts.keyword, stripHtml(description));
  const passedAllRules = seoChecklist.every((item) => item.passed);

  return {
    StokKodu: facts.stockCode,
    UrunAdi: facts.title,
    Kategori: facts.category,
    Marka: facts.brand,
    HedefKelime: facts.keyword,
    UrunBasligi: facts.title,
    SeoBaslik: seoTitle,
    MetaDescription: metaDescription,
    MetaKeywords: metaKeywords,
    UrunAciklamasi: description,
    UretimKaynagi: source,
    SEOKontrol: {
      passedAllRules,
      checklist: seoChecklist
    },
    KaliteKontrol: {
      wordCount: validation.wordCount,
      highestSimilarity: Number(validation.highestSimilarity.toFixed(2)),
      qualityChecks: validation.qualityChecks,
      fallbackReason
    }
  };
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Girdi dosyası bulunamadı: ${INPUT_FILE}`);
  }

  const raw = fs.readFileSync(INPUT_FILE, "utf8");
  const products = JSON.parse(raw);
  if (!Array.isArray(products)) {
    throw new Error("Girdi dosyası dizi (array) formatında olmalıdır.");
  }

  const filtered = products.filter((product) => shouldIncludeByCategory(product.Kategori));
  if (filtered.length === 0) {
    throw new Error("Filtreye uyan ürün bulunamadı.");
  }

  console.log(`Toplam ürün: ${filtered.length}`);
  console.log(`Gemini durumu: ${isGeminiEnabled() ? "aktif" : "kapalı / anahtar yok"}`);

  const results = [];
  const approvedDescriptions = [];

  for (let index = 0; index < filtered.length; index += 1) {
    const product = filtered[index];
    console.log(`[${index + 1}/${filtered.length}] İşleniyor: ${normalizeSpace(product.UrunAdi)}`);

    const record = await generateRecord(product, approvedDescriptions);
    results.push(record);
    approvedDescriptions.push(record.UrunAciklamasi);

    if (isGeminiEnabled() && index < filtered.length - 1) {
      await sleep(API_DELAY_MS);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf8");

  const seoFailed = results.filter((item) => !item.SEOKontrol.passedAllRules).length;
  const aiCount = results.filter((item) => item.UretimKaynagi === "gemini").length;
  const fallbackCount = results.filter((item) => item.UretimKaynagi !== "gemini").length;

  console.log(`Tamamlandı: ${results.length} ürün işlendi.`);
  console.log(`Çıktı dosyası: ${OUTPUT_FILE}`);
  console.log(`AI üretimi: ${aiCount} ürün`);
  console.log(`Fallback/lokal üretim: ${fallbackCount} ürün`);
  if (seoFailed > 0) {
    console.log(`Uyarı: ${seoFailed} üründe SEO kontrolü başarısız.`);
  } else {
    console.log("Tüm ürünler SEO kontrolünü geçti.");
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Hata:", error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  main
};
