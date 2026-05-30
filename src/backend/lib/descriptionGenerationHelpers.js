/**
 * Açıklama üretimi sonrası doğrulama ve HTML birleştirme (CLI + Electron ortak).
 */

const { buildSeoChecklist } = require("./seo");
const { getMostSimilarMatch } = require("./similarity");
const { stripHtml, countWords, normalizeSpace, calcDensityPercent } = require("./textUtils");

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

function buildStyledSpecTable(rows) {
  const body = rows
    .map((row) => `<tr><th>${row.key}</th><td>${row.value}</td></tr>`)
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

function rebalanceKeywordDensity(description, keyword, rules, strategyKey) {
  if (!keyword) return description;

  let updatedDescription = String(description);
  const plainDensity = calcDensityPercent(stripHtml(updatedDescription), keyword);
  const rawDensity = calcDensityPercent(updatedDescription, keyword);

  if (plainDensity >= rules.minKeywordDensity && rawDensity >= rules.minKeywordDensity) {
    return updatedDescription;
  }

  let boosterParagraph = `<p><strong>${keyword}</strong> tercih eden kullanıcılar için pratik ve düzenli kullanım sunar.</p>`;
  if (strategyKey === "book" || strategyKey.includes("sinav") || strategyKey.includes("edebiyat")) {
    boosterParagraph = `<p>Özellikle <strong>${keyword}</strong> arayan öğrenciler ve eğitmenler için ideal bir içerik sunar.</p>`;
  }

  if (updatedDescription.includes("pratik ve düzenli kullanım sunar") || updatedDescription.includes("öğrenciler ve eğitmenler için ideal")) {
    return updatedDescription;
  }

  if (/<h3>/i.test(updatedDescription)) {
    updatedDescription = updatedDescription.replace(/<h3>/i, `${boosterParagraph}<h3>`);
  } else {
    updatedDescription += boosterParagraph;
  }

  return updatedDescription;
}

module.exports = {
  validateDescription,
  buildHybridDescription,
  formatDescriptionToTable,
  rebalanceKeywordDensity
};
