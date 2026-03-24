const seoRules = require("../config/seoRules");
const {
  normalizeSpace,
  countWords,
  containsKeyword,
  calcDensityPercent,
  safeTruncate
} = require("./textUtils");

function buildSeoTitle(title) {
  const suffix = " | MaviKalem";
  const normalized = normalizeSpace(title);
  const max = seoRules.maxSeoTitleLength;
  if (normalized.length + suffix.length <= max) return `${normalized}${suffix}`;
  return safeTruncate(normalized, max);
}

function buildMetaDescription(facts) {
  const base = `${facts.title} MaviKalem'de. ${facts.category} kategorisinde orijinal ürün, uygun fiyat ve hızlı kargo avantajıyla şimdi inceleyin.`;
  const min = seoRules.minMetaDescriptionLength;
  const max = seoRules.maxMetaDescriptionLength;

  let value = normalizeSpace(base);
  if (value.length < min) {
    value = `${value} Güvenli alışveriş fırsatlarını kaçırmayın.`;
  }
  return safeTruncate(value, max);
}

function buildMetaKeywords(facts) {
  const keywords = [
    facts.title,
    facts.category,
    `${facts.brand} ${facts.category}`,
    `${facts.leadSize} kalem`,
    `${facts.color} ${facts.category}`,
    "MaviKalem",
    "kırtasiye"
  ]
    .map((item) => normalizeSpace(item))
    .filter(Boolean);

  return [...new Set(keywords)].join(", ");
}

function buildSeoChecklist(title, keyword, description) {
  const wordCount = countWords(description);
  const density = calcDensityPercent(description, keyword);

  return [
    { rule: "Hedef kelime tanımlandı.", passed: Boolean(normalizeSpace(keyword)) },
    { rule: "Ürün adı boş bırakılamaz.", passed: Boolean(normalizeSpace(title)) },
    { rule: "Hedef kelime Ürün başlığı içerisinde geçiyor.", passed: containsKeyword(title, keyword) },
    { rule: "Ürün açıklama alanı boş bırakılamaz.", passed: Boolean(normalizeSpace(description)) },
    { rule: "Hedef kelime Ürün açıklaması içerisinde geçiyor.", passed: containsKeyword(description, keyword) },
    {
      rule: `Ürün açıklama alanı en az ${seoRules.minDescriptionWords} kelime içermelidir. Kelime Sayısı: ${wordCount}`,
      passed: wordCount >= seoRules.minDescriptionWords
    },
    {
      rule: `Hedef kelime, Ürün açıklamasında %${density.toFixed(2)} oranında geçmektedir.`,
      passed: density >= seoRules.minKeywordDensity && density <= seoRules.maxKeywordDensity
    }
  ];
}

module.exports = {
  buildSeoTitle,
  buildMetaDescription,
  buildMetaKeywords,
  buildSeoChecklist
};
