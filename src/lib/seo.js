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
  const categoryPhrase = facts.subCategory || facts.category;
  const base = `${facts.title} MaviKalem'de. ${categoryPhrase} kategorisinde orijinal ürün, uygun fiyat ve hızlı kargo avantajıyla şimdi inceleyin.`;
  const min = seoRules.minMetaDescriptionLength;
  const max = seoRules.maxMetaDescriptionLength;

  let value = normalizeSpace(base);
  if (value.length < min) {
    value = `${value} Güvenli alışveriş fırsatlarını kaçırmayın.`;
  }
  return safeTruncate(value, max);
}

function buildMetaKeywords(facts) {
  const categoryPhrase = facts.subCategory || facts.category;
  const contextKeywords = [];

  if (facts.brushType) contextKeywords.push(`${facts.brushType} fırça`);
  if (facts.material) contextKeywords.push(facts.material);
  if (facts.medium) contextKeywords.push(facts.medium);
  if (facts.usageType) contextKeywords.push(facts.usageType);
  if (facts.lesson) contextKeywords.push(`${facts.lesson} kitabı`);
  if (facts.examType) contextKeywords.push(`${facts.examType} hazırlık`);
  if (facts.classLevel) contextKeywords.push(facts.classLevel);
  if (facts.leadSize && /kalem/i.test(categoryPhrase)) contextKeywords.push(`${facts.leadSize} kalem`);
  if (facts.color !== "Standart") contextKeywords.push(`${facts.color} ${categoryPhrase}`);

  const keywords = [
    facts.title,
    categoryPhrase,
    `${facts.brand} ${categoryPhrase}`,
    ...contextKeywords,
    "MaviKalem",
    facts.mainCategory || "kırtasiye"
  ]
    .map((item) => normalizeSpace(item))
    .filter(Boolean);

  return [...new Set(keywords)].join(", ");
}

function buildSeoChecklist(title, keyword, description, rules = seoRules) {
  const wordCount = countWords(description);
  const density = calcDensityPercent(description, keyword);

  return [
    { rule: "Hedef kelime tanımlandı.", passed: Boolean(normalizeSpace(keyword)) },
    { rule: "Ürün adı boş bırakılamaz.", passed: Boolean(normalizeSpace(title)) },
    { rule: "Hedef kelime Ürün başlığı içerisinde geçiyor.", passed: containsKeyword(title, keyword) },
    { rule: "Ürün açıklama alanı boş bırakılamaz.", passed: Boolean(normalizeSpace(description)) },
    { rule: "Hedef kelime Ürün açıklaması içerisinde geçiyor.", passed: containsKeyword(description, keyword) },
    {
      rule: `Ürün açıklama alanı en az ${rules.minDescriptionWords} kelime içermelidir. Kelime Sayısı: ${wordCount}`,
      passed: wordCount >= rules.minDescriptionWords
    },
    {
      rule: `Hedef kelime, Ürün açıklamasında %${density.toFixed(2)} oranında geçmektedir.`,
      passed: density >= rules.minKeywordDensity && density <= rules.maxKeywordDensity
    }
  ];
}

module.exports = {
  buildSeoTitle,
  buildMetaDescription,
  buildMetaKeywords,
  buildSeoChecklist
};
