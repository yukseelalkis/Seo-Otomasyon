const defaults = {
  minDescriptionWords: Number(process.env.MIN_DESCRIPTION_WORDS || 70),
  minAiWords: Number(process.env.MIN_AI_WORDS || 90),
  minKeywordDensity: Number(process.env.MIN_KEYWORD_DENSITY || 2.0),
  maxKeywordDensity: Number(process.env.MAX_KEYWORD_DENSITY || 3.0),
  minMetaDescriptionLength: Number(process.env.MIN_META_DESC || 120),
  maxMetaDescriptionLength: Number(process.env.MAX_META_DESC || 155),
  maxSeoTitleLength: Number(process.env.MAX_SEO_TITLE || 60),
  similarityThreshold: Number(process.env.MAX_SIMILARITY_SCORE || 0.72)
};

const perStrategy = {
  stationery: {
    minDescriptionWords: 80,
    minAiWords: 95,
    similarityThreshold: 0.68
  },
  book: {
    minDescriptionWords: 110,
    minAiWords: 130,
    similarityThreshold: 0.78
  },
  set: {
    minDescriptionWords: 100,
    minAiWords: 120,
    similarityThreshold: 0.72
  },
  tech: {
    minDescriptionWords: 95,
    minAiWords: 120,
    similarityThreshold: 0.66
  },
  art: {
    minDescriptionWords: 95,
    minAiWords: 120,
    similarityThreshold: 0.65
  },
  bag: {
    minDescriptionWords: 95,
    minAiWords: 120,
    similarityThreshold: 0.65
  },
  "preschool-bag": {
    minDescriptionWords: 50,
    minAiWords: 60,
    minKeywordDensity: 2.0,
    maxKeywordDensity: 6.0,
    similarityThreshold: 0.65
  },
  office: {
    minDescriptionWords: 85,
    minAiWords: 105,
    similarityThreshold: 0.68
  },
  kids: {
    minDescriptionWords: 90,
    minAiWords: 110,
    similarityThreshold: 0.67
  },
  generic: {
    minDescriptionWords: 85,
    minAiWords: 100,
    similarityThreshold: 0.64
  }
};

function getStrategySeoRules(strategyKey) {
  return {
    ...defaults,
    ...(perStrategy[strategyKey] || {})
  };
}

module.exports = {
  ...defaults,
  getStrategySeoRules
};
