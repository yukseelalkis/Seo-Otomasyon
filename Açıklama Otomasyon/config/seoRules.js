
module.exports = {
  minDescriptionWords: Number(process.env.MIN_DESCRIPTION_WORDS || 70),
  minAiWords: Number(process.env.MIN_AI_WORDS || 90),
  minKeywordDensity: Number(process.env.MIN_KEYWORD_DENSITY || 1.5),
  maxKeywordDensity: Number(process.env.MAX_KEYWORD_DENSITY || 4.0),
  minMetaDescriptionLength: Number(process.env.MIN_META_DESC || 120),
  maxMetaDescriptionLength: Number(process.env.MAX_META_DESC || 155),
  maxSeoTitleLength: Number(process.env.MAX_SEO_TITLE || 60),
  similarityThreshold: Number(process.env.MAX_SIMILARITY_SCORE || 0.72)
};
