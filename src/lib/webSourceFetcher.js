const axios = require("axios");
const cheerio = require("cheerio");
const { normalizeSpace, normalizeTurkishForMatch } = require("./textUtils");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BRAND_SOURCES = {
  frocx: {
    searchUrl: "https://www.frocx.com/arama?q=",
    baseUrl: "https://www.frocx.com",
    productSelector: ".product-item a, .productItem a, .product-card a, a.product-link, .col-item a",
    detailSelectors: [
      ".product-detail",
      ".product-description",
      ".product-info",
      "#productDescription",
      ".tab-content",
      ".detail-desc",
      ".product-properties",
      ".product_detail",
      "#description",
      ".detay-aciklama",
      "main"
    ]
  },
  adel: {
    searchUrl: "https://www.adel.com.tr/urunler?search=",
    baseUrl: "https://www.adel.com.tr",
    productSelector: ".product-item a, .productItem a, .product-card a, a.product-link, .col-item a",
    detailSelectors: [
      ".product-detail",
      ".product-description",
      ".product-info",
      "#productDescription",
      ".tab-content",
      ".detail-desc",
      ".product-properties",
      "main"
    ]
  },
  adelShop: {
    searchUrl: "https://shop.adel.com.tr/arama?q=",
    baseUrl: "https://shop.adel.com.tr",
    productSelector: ".product-item a, .productItem a, .product-card a, a.product-link, .col-item a",
    detailSelectors: [
      ".product-detail",
      ".product-description",
      ".product-info",
      "#productDescription",
      ".tab-content",
      ".detail-desc",
      ".product-properties",
      "main"
    ]
  }
};

function getBrandSourceConfigs(brandName) {
  const normalized = normalizeTurkishForMatch(brandName);
  if (normalized.includes("frocx") || normalized.includes("otto")) return [BRAND_SOURCES.frocx];
  if (normalized.includes("adel") || normalized.includes("faber")) {
    return [BRAND_SOURCES.adelShop, BRAND_SOURCES.adel];
  }
  return [];
}

function buildSearchQuery(productName, brandName) {
  let query = normalizeSpace(productName);

  const brandWords = normalizeSpace(brandName).split(/\s+/);
  for (const word of brandWords) {
    if (word.length >= 2) {
      query = query.replace(new RegExp(`^${word}\\s+`, "i"), "");
    }
  }

  query = query
    .replace(/\b(OTTO\.)?\d{4,}[-.]?\d*\b/g, "")
    .replace(/\b[A-Z]{2,5}\.\d{4,}\b/g, "")
    .replace(/\b\d{6,}\b/g, "");

  return normalizeSpace(query);
}

async function fetchPage(url, timeoutMs = 10000) {
  const response = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    timeout: timeoutMs,
    maxRedirects: 3
  });
  return response.data;
}

function extractTextFromSelectors($, selectors) {
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      element.find("script, style, nav, footer, header").remove();
      const text = normalizeSpace(element.text());
      if (text.length > 30) return text;
    }
  }
  return "";
}

function findProductLinks($, productSelector, baseUrl, searchTerm) {
  const links = [];
  const normalizedSearch = normalizeTurkishForMatch(searchTerm);

  $(productSelector).each((_index, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    const fullUrl = href.startsWith("http") ? href : `${baseUrl}${href.startsWith("/") ? "" : "/"}${href}`;
    const linkText = normalizeSpace($(element).text());
    const normalizedText = normalizeTurkishForMatch(linkText);
    const titleAttr = normalizeSpace($(element).attr("title") || "");
    const normalizedTitle = normalizeTurkishForMatch(titleAttr);

    const searchWords = normalizedSearch.split(/\s+/).filter((w) => w.length > 2);
    const matchCount = searchWords.filter(
      (word) => normalizedText.includes(word) || normalizedTitle.includes(word) || normalizeTurkishForMatch(fullUrl).includes(word)
    ).length;

    if (matchCount >= Math.max(2, Math.floor(searchWords.length * 0.3))) {
      links.push({ url: fullUrl, text: linkText, matchScore: matchCount / searchWords.length });
    }
  });

  links.sort((a, b) => b.matchScore - a.matchScore);
  return links.slice(0, 3);
}

function extractProductDetailText($, selectors) {
  let detailText = extractTextFromSelectors($, selectors);
  if (detailText) return detailText;

  const specTexts = [];
  $("table").each((_index, table) => {
    $(table)
      .find("tr")
      .each((_rowIndex, row) => {
        const cells = $(row).find("td, th");
        if (cells.length >= 2) {
          const key = normalizeSpace($(cells[0]).text());
          const value = normalizeSpace($(cells[1]).text());
          if (key && value) specTexts.push(`${key}: ${value}`);
        }
      });
  });

  $("li").each((_index, li) => {
    const text = normalizeSpace($(li).text());
    if (text.length > 5 && text.length < 200) specTexts.push(text);
  });

  return specTexts.join(" | ");
}

async function tryFetchFromSource(sourceConfig, searchTerm) {
  const searchQuery = encodeURIComponent(normalizeSpace(searchTerm));
  const searchUrl = `${sourceConfig.searchUrl}${searchQuery}`;

  let searchHtml;
  try {
    searchHtml = await fetchPage(searchUrl);
  } catch (error) {
    return { text: "", source: "search-fetch-error", url: searchUrl, error: error.message };
  }

  const $search = cheerio.load(searchHtml);

  const searchPageText = extractProductDetailText($search, sourceConfig.detailSelectors);
  if (searchPageText.length > 100) {
    return { text: searchPageText, source: "search-page-content", url: searchUrl };
  }

  const productLinks = findProductLinks($search, sourceConfig.productSelector, sourceConfig.baseUrl, searchTerm);
  if (productLinks.length === 0) {
    const fallbackText = normalizeSpace($search("body").text()).slice(0, 2000);
    if (fallbackText.length > 100) {
      return { text: fallbackText, source: "search-page-fallback", url: searchUrl };
    }
    return { text: "", source: "no-product-links-found", url: searchUrl };
  }

  const bestLink = productLinks[0];
  let detailHtml;
  try {
    detailHtml = await fetchPage(bestLink.url);
  } catch (error) {
    return { text: "", source: "detail-fetch-error", url: bestLink.url, error: error.message };
  }

  const $detail = cheerio.load(detailHtml);
  const detailText = extractProductDetailText($detail, sourceConfig.detailSelectors);

  if (detailText.length > 30) {
    return { text: detailText, source: "product-detail-page", url: bestLink.url };
  }

  const bodyText = normalizeSpace($detail("body").text()).slice(0, 2000);
  return { text: bodyText, source: "product-page-body", url: bestLink.url };
}

async function fetchProductDetailsFromWeb(productName, brandName) {
  const sourceConfigs = getBrandSourceConfigs(brandName);
  if (sourceConfigs.length === 0) {
    return { text: "", source: "no-source-config", url: "" };
  }

  const cleanQuery = buildSearchQuery(productName, brandName);

  for (const config of sourceConfigs) {
    const result = await tryFetchFromSource(config, cleanQuery);
    if (result.text && result.text.length > 30) {
      return result;
    }
  }

  return await tryFetchFromSource(sourceConfigs[0], cleanQuery);
}

module.exports = {
  fetchProductDetailsFromWeb,
  getBrandSourceConfigs,
  buildSearchQuery,
  BRAND_SOURCES
};
