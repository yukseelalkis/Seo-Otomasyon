require("dotenv").config();
const fs = require("fs");
const path = require("path");

const seoRules = require("./config/seoRules");
const { getCategoryStrategy, normalizeCategory, getCategorySearchText } = require("./config/categories");
const { extractProductFacts } = require("./lib/productFacts");
const { buildSeoTitle, buildMetaDescription, buildMetaKeywords, buildSeoChecklist } = require("./lib/seo");
const { getMostSimilarMatch } = require("./lib/similarity");
const { generateHtmlDescription, isGeminiEnabled } = require("./lib/geminiClient");
const { stripHtml, countWords, countKeywordOccurrences, calcDensityPercent, normalizeSpace, sleep } = require("./lib/textUtils");

const { buildStationeryDescription } = require("./generators/staioneryTemplate/stationeryTemplate");
const { buildBookDescription } = require("./generators/bookTemplates");
const { buildBagDescription, buildPreschoolBagDescription } = require("./generators/bagTemplate/bagTemplate");
// const { buildSetDescription } = require("./generators/setTemplate");
// const { buildTechDescription } = require("./generators/techTemplate");
const { buildArtDescription } = require("./generators/artTemplate/artTemplate");
const { buildOfficeDescription } = require("./generators/officeTemplate/officeTemplate");
// const { buildWhiteboardMarkerDescription } = require("./generators/whiteboardMarkerTemplate");
// const { buildGenericDescription } = require("./generators/genericTemplate");

const INPUT_FILE = path.join(__dirname, "..", "data", "input", process.env.INPUT_FILE || "urunler.json");
const OUTPUT_FILE = path.join(__dirname, "..", "data", "output", process.env.OUTPUT_FILE || "cikti.json");
const FEATURE_INPUT_FILE = process.env.FEATURE_INPUT_FILE
  ? path.join(__dirname, "..", "data", "output", process.env.FEATURE_INPUT_FILE)
  : "";
const TARGET_CATEGORY = normalizeCategory(process.env.TARGET_CATEGORY || "");
const APPROVED_FEATURE_STATUS = normalizeCategory(process.env.APPROVED_FEATURE_STATUS || "onaylandi");
const API_DELAY_MS = Number(process.env.API_DELAY_MS || 1200);
const MAX_TEMPLATE_VARIATIONS = Number(process.env.MAX_TEMPLATE_VARIATIONS || 3);

function shouldIncludeByCategory(product) {
  if (!TARGET_CATEGORY) return true;
  const category = normalizeCategory(getCategorySearchText(product));
  if (category === TARGET_CATEGORY) return true;
  return category.includes(TARGET_CATEGORY) || category === `${TARGET_CATEGORY}ler`;
}

function getFeatureLookupKeys(record) {
  const stockCode = normalizeSpace(record.stockCode || record.StokKodu || "");
  const title = normalizeSpace(record.title || record.UrunAdi || "");
  const keys = [];

  if (stockCode) keys.push(`stock:${stockCode}`);
  if (title) keys.push(`title:${normalizeCategory(title)}`);
  return keys;
}

function loadApprovedFeatureRecords() {
  if (!FEATURE_INPUT_FILE) {
    return { featureMap: new Map(), approvedCount: 0 };
  }

  if (!fs.existsSync(FEATURE_INPUT_FILE)) {
    throw new Error(`Özellik dosyası bulunamadı: ${FEATURE_INPUT_FILE}`);
  }

  const raw = fs.readFileSync(FEATURE_INPUT_FILE, "utf8");
  const records = JSON.parse(raw);
  if (!Array.isArray(records)) {
    throw new Error("Özellik dosyası dizi (array) formatında olmalıdır.");
  }

  const approved = records.filter((record) => {
    if (!APPROVED_FEATURE_STATUS) return true;
    return normalizeCategory(record.Durum || "") === APPROVED_FEATURE_STATUS;
  });

  const featureMap = new Map();
  for (const record of approved) {
    for (const key of getFeatureLookupKeys(record)) {
      featureMap.set(key, record);
    }
  }

  return {
    featureMap,
    approvedCount: approved.length
  };
}

function getApprovedFeatureRecord(product, facts, featureMap) {
  for (const key of [...getFeatureLookupKeys(facts), ...getFeatureLookupKeys(product)]) {
    const record = featureMap.get(key);
    if (record) return record;
  }
  return null;
}

function mergeApprovedFeatures(facts, featureRecord) {
  const approvedFeatures = featureRecord?.Ozellikler;
  if (!approvedFeatures || typeof approvedFeatures !== "object") {
    return facts;
  }

  return {
    ...facts,
    ...approvedFeatures
  };
}

function getTemplateDescription(strategyKey, facts) {
  switch (strategyKey) {
    case "stationery":
    case "kids":
    case "set":
    case "tech":
    case "office":
      return buildOfficeDescription(facts);
    case "whiteboard-marker":
      return buildStationeryDescription(facts);
    case "art":
      return buildArtDescription(facts);
    case "book":
      return buildBookDescription(facts);
    case "preschool-bag":
      return buildPreschoolBagDescription(facts);
    case "bag":
      return buildBagDescription(facts);
    default:
      return buildStationeryDescription(facts);
  }
}

function validateDescription(description, facts, existingDescriptions, strategyRules) {
  const plainText = stripHtml(description);
  const seoChecklist = buildSeoChecklist(facts.title, facts.keyword, plainText, strategyRules);
  const { highestSimilarity } = getMostSimilarMatch(description, existingDescriptions);
  const hasSpecBlock = /<ul>[\s\S]*?<\/ul>/i.test(description) || /<table[\s\S]*?<\/table>/i.test(description);
  const looksLikeHtml = /<h2>.*<\/h2>/i.test(description) && hasSpecBlock;
  const words = countWords(plainText);

  const qualityChecks = [
    { rule: "HTML başlık etiketi mevcut.", passed: /<h2>.*<\/h2>/i.test(description) },
    { rule: "HTML özellik tablosu/listesi mevcut.", passed: hasSpecBlock },
    {
      rule: `Açıklama en az ${strategyRules.minAiWords} kelime olmalıdır. Kelime Sayısı: ${words}`,
      passed: words >= strategyRules.minAiWords
    },
    {
      rule: `Benzerlik skoru ${strategyRules.similarityThreshold.toFixed(2)} değerini aşmamalıdır. Mevcut Skor: ${highestSimilarity.toFixed(2)}`,
      passed: highestSimilarity <= strategyRules.similarityThreshold
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

function buildStyledSpecTable(rows) {
  const body = rows
    .map(
      (row) => `<tr><th>${row.key}</th><td>${row.value}</td></tr>`
    )
    .join("");

  return `<table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse;"><tbody>${body}</tbody></table>`;
}

function formatDescriptionToTable(description, facts) {
  const ulMatch = String(description || "").match(/<ul>([\s\S]*?)<\/ul>/i);
  if (!ulMatch) return description;

  const liRegex = /<li>\s*<strong>([^<:]+):<\/strong>\s*([\s\S]*?)\s*<\/li>/gi;
  const parsedRows = [];
  let match;
  while ((match = liRegex.exec(ulMatch[1])) !== null) {
    const key = normalizeSpace(match[1]);
    const value = normalizeSpace(match[2]);
    if (key && value) parsedRows.push({ key, value });
  }

  if (parsedRows.length === 0) return description;

  const required = [
    { key: "Ürün Adı", value: facts.title },
    { key: "Stok Kodu", value: facts.stockCode }
  ];
  for (const item of required) {
    if (!parsedRows.some((row) => row.key === item.key) && item.value) {
      parsedRows.push(item);
    }
  }

  const table = buildStyledSpecTable(parsedRows);
  return String(description).replace(ulMatch[0], table).replace(/\n+/g, "");
}

// === DÜZELTİLEN VE ÇİFT TEKRARI ÖNLEYEN FONKSİYON ===
function rebalanceKeywordDensity(description, keyword, rules, strategyKey) {
  if (!keyword) return description;

  let updatedDescription = String(description);
  const plainDensity = calcDensityPercent(stripHtml(updatedDescription), keyword);
  const rawDensity = calcDensityPercent(updatedDescription, keyword);

  // Yoğunluk zaten yeterliyse hiç dokunma
  if (plainDensity >= rules.minKeywordDensity && rawDensity >= rules.minKeywordDensity) {
    return updatedDescription;
  }

  // Stratejiye göre SEO destek cümlesini seç
  let boosterParagraph = `<p><strong>${keyword}</strong> tercih eden kullanıcılar için pratik ve düzenli kullanım sunar.</p>`;
  if (strategyKey === "book" || strategyKey.includes("sinav") || strategyKey.includes("edebiyat")) {
    boosterParagraph = `<p>Özellikle <strong>${keyword}</strong> arayan öğrenciler ve eğitmenler için ideal bir içerik sunar.</p>`;
  }

  // Çift tekrarı önle
  if (updatedDescription.includes("pratik ve düzenli kullanım sunar") || updatedDescription.includes("öğrenciler ve eğitmenler için ideal")) {
    return updatedDescription;
  }

  // SSS bloğunun üstüne sadece 1 kere ekle
  if (/<h3>/i.test(updatedDescription)) {
    updatedDescription = updatedDescription.replace(/<h3>/i, `${boosterParagraph}<h3>`);
  } else {
    updatedDescription += boosterParagraph;
  }

  return updatedDescription;
}
// ===================================================

function getParagraphBlocks(html) {
  return String(html || "").match(/<p>[\s\S]*?<\/p>/gi) || [];
}

function getFirstListBlock(html) {
  const match = String(html || "").match(/<ul>[\s\S]*?<\/ul>/i);
  return match ? match[0] : "";
}

function getFaqSection(html) {
  const headingMatch = String(html || "").match(/<h3>[\s\S]*?<\/h3>/i);
  const paragraphs = getParagraphBlocks(html).slice(2, 5);
  if (!headingMatch && paragraphs.length === 0) return "";
  return `${headingMatch ? headingMatch[0] : "<h3>Sıkça Sorulan Sorular</h3>"}${paragraphs.join("")}`;
}

function buildHybridDescription(localDescription, aiDescription, facts) {
  const aiParagraphs = getParagraphBlocks(aiDescription).slice(0, 2);
  const titleMatch = String(localDescription || "").match(/<h2>[\s\S]*?<\/h2>/i);
  const titleBlock = titleMatch ? titleMatch[0] : `<h2>${facts.title}</h2>`;
  const listBlock = getFirstListBlock(localDescription);
  const faqSection = getFaqSection(aiDescription) || getFaqSection(localDescription);

  if (aiParagraphs.length < 2 || !listBlock) {
    return localDescription;
  }

  return `${titleBlock}${aiParagraphs.join("")}${listBlock}${faqSection}`;
}

function getCategorySpecificExistingDescriptions(approvedDescriptions, strategyKey) {
  return approvedDescriptions
    .filter((item) => item.strategyKey === strategyKey)
    .map((item) => item.description);
}

function buildBestTemplateDescription(strategyKey, facts, approvedDescriptions, strategyRules) {
  let bestDescription = getTemplateDescription(strategyKey, facts);
  let bestValidation = validateDescription(bestDescription, facts, approvedDescriptions, strategyRules);

  for (let attempt = 1; attempt < MAX_TEMPLATE_VARIATIONS; attempt += 1) {
    const candidateFacts = { ...facts, variationSeed: `${facts.stockCode}-${attempt}` };
    const candidateDescription = getTemplateDescription(strategyKey, candidateFacts);
    const candidateValidation = validateDescription(candidateDescription, facts, approvedDescriptions, strategyRules);

    if (candidateValidation.highestSimilarity < bestValidation.highestSimilarity) {
      bestDescription = candidateDescription;
      bestValidation = candidateValidation;
    }

    if (candidateValidation.passed) {
      return {
        description: candidateDescription,
        validation: candidateValidation
      };
    }
  }

  return {
    description: bestDescription,
    validation: bestValidation
  };
}

async function generateRecord(product, approvedDescriptions, approvedFeatureMap) {
  const baseFacts = extractProductFacts(product);
  const featureRecord = getApprovedFeatureRecord(product, baseFacts, approvedFeatureMap);
  const facts = mergeApprovedFeatures(baseFacts, featureRecord);
  const strategy = getCategoryStrategy(facts);
  const strategyRules = seoRules.getStrategySeoRules(strategy.key);
  const categoryDescriptions = getCategorySpecificExistingDescriptions(approvedDescriptions, strategy.key);
  const templateResult = buildBestTemplateDescription(strategy.key, facts, categoryDescriptions, strategyRules);
  const templateDescription = templateResult.description;

  console.log(`DEBUG: Strategy for ${facts.title}: ${strategy.key}`);
  if (templateDescription.includes("<table")) {
    console.log(`DEBUG: Template produced a TABLE.`);
  } else {
    console.log(`DEBUG: Template DID NOT produce a table.`);
  }

  let description = templateDescription;
  let source = "local-template";
  let validation = templateResult.validation;
  let fallbackReason = null;

  const canUseAi = isGeminiEnabled() && strategy.aiRecommended;
  if (canUseAi) {
    try {
      const aiDescription = await generateHtmlDescription(facts, strategy.key, strategyRules.minAiWords);
      const candidateDescription =
        strategy.mode === "hybrid" ? buildHybridDescription(templateDescription, aiDescription, facts) : aiDescription;
      const aiValidation = validateDescription(candidateDescription, facts, categoryDescriptions, strategyRules);
      if (aiValidation.passed) {
        description = candidateDescription;
        source = "gemini";
        validation = aiValidation;
      } else {
        source = "local-fallback";
        fallbackReason = "AI çıktısı kalite veya benzerlik kontrolünü geçemedi, kategoriye özel şablona dönüldü.";
      }
    } catch (error) {
      source = "local-fallback";
      fallbackReason = `Gemini isteği başarısız oldu: ${error.message}`;
    }
  }

  // Kendi tablosunu üreten şablonlar için otomatik dönüşümü atla
  if (strategy.key !== "book" && strategy.key !== "art" && strategy.key !== "bag" && strategy.key !== "preschool-bag" && strategy.key !== "office") {
    description = formatDescriptionToTable(description, facts);
  }
  if (strategy.key !== "preschool-bag") {
    description = rebalanceKeywordDensity(description, facts.keyword, strategyRules, strategy.key);
  }
  validation = validateDescription(description, facts, categoryDescriptions, strategyRules);

  const seoTitle = buildSeoTitle(facts.title);
  const metaDescription = buildMetaDescription(facts);
  const metaKeywords = buildMetaKeywords(facts);
  const seoChecklist = buildSeoChecklist(facts.title, facts.keyword, stripHtml(description), strategyRules);
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
    AnaKategori: facts.mainCategory || "",
    AltKategori: facts.subCategory || "",
    Strateji: strategy.key,
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

  const filtered = products.filter((product) => shouldIncludeByCategory(product));
  if (filtered.length === 0) {
    throw new Error("Filtreye uyan ürün bulunamadı.");
  }

  console.log(`Toplam ürün: ${filtered.length}`);
  console.log(`Gemini durumu: ${isGeminiEnabled() ? "aktif" : "kapalı / anahtar yok"}`);

  const { featureMap: approvedFeatureMap, approvedCount } = loadApprovedFeatureRecords();
  if (FEATURE_INPUT_FILE) {
    console.log(`Onaylı özellik kaydı: ${approvedCount}`);
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  const results = [];
  const approvedDescriptions = [];

  for (let index = 0; index < filtered.length; index += 1) {
    const product = filtered[index];
    console.log(`[${index + 1}/${filtered.length}] İşleniyor: ${normalizeSpace(product.UrunAdi)}`);

    const record = await generateRecord(product, approvedDescriptions, approvedFeatureMap);
    results.push(record);
    approvedDescriptions.push({
      strategyKey: record.Strateji,
      description: record.UrunAciklamasi
    });

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