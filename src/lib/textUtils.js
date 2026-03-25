function normalizeSpace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function toLowerTr(text) {
  return normalizeSpace(text).toLocaleLowerCase("tr-TR");
}

function stripHtml(html) {
  return normalizeSpace(String(html || "").replace(/<[^>]+>/g, " "));
}

function normalizeTurkishForMatch(text) {
  return toLowerTr(text)
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function countWords(text) {
  return normalizeSpace(text).split(/\s+/).filter(Boolean).length;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countKeywordOccurrences(text, keyword) {
  const normalizedKeyword = normalizeSpace(keyword);
  if (!normalizedKeyword) return 0;

  const regex = new RegExp(escapeRegExp(normalizedKeyword), "gi");
  const matches = normalizeSpace(text).match(regex);
  return matches ? matches.length : 0;
}

function calcDensityPercent(text, keyword) {
  const words = countWords(text);
  if (words === 0) return 0;
  const occurrences = countKeywordOccurrences(text, keyword);
  return (occurrences / words) * 100;
}

function containsKeyword(text, keyword) {
  return toLowerTr(text).includes(toLowerTr(keyword));
}

function safeTruncate(text, maxLength) {
  const normalized = normalizeSpace(text);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

function hashText(text) {
  const value = normalizeSpace(text);
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickVariant(list, seedText) {
  if (!Array.isArray(list) || list.length === 0) return "";
  return list[hashText(seedText) % list.length];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  normalizeSpace,
  toLowerTr,
  stripHtml,
  normalizeTurkishForMatch,
  countWords,
  countKeywordOccurrences,
  calcDensityPercent,
  containsKeyword,
  safeTruncate,
  hashText,
  pickVariant,
  sleep
};
