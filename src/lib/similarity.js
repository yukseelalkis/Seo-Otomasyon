const { stripHtml } = require("./textUtils");

function tokenizeForSimilarity(text) {
  return new Set(
    stripHtml(text)
      .toLocaleLowerCase("tr-TR")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );
}

function calculateSimilarityScore(textA, textB) {
  const setA = tokenizeForSimilarity(textA);
  const setB = tokenizeForSimilarity(textB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }

  return intersection / Math.min(setA.size, setB.size);
}

function getHighestSimilarity(text, existingTexts) {
  let highest = 0;
  for (const current of existingTexts) {
    const score = calculateSimilarityScore(text, current);
    if (score > highest) highest = score;
  }
  return highest;
}

function getMostSimilarMatch(text, existingTexts) {
  let highest = 0;
  let mostSimilarText = "";

  for (const current of existingTexts) {
    const score = calculateSimilarityScore(text, current);
    if (score > highest) {
      highest = score;
      mostSimilarText = current;
    }
  }

  return {
    highestSimilarity: highest,
    mostSimilarText
  };
}

module.exports = {
  calculateSimilarityScore,
  getHighestSimilarity,
  getMostSimilarMatch
};
