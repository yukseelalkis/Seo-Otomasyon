require("dotenv").config();
const fs = require("fs");
const path = require("path");

const { getCategoryStrategy, normalizeCategory, getCategorySearchText } = require("../config/categories");
const { extractProductFacts } = require("../lib/productFacts");
const {
  generateFeatureExtraction,
  getEmptyFeatureSet,
  getManualFeatureTemplate
} = require("../lib/geminiFeatureExtractor");
const { isGeminiEnabled } = require("../lib/geminiClient");
const { fetchProductDetailsFromWeb } = require("../lib/webSourceFetcher");
const { normalizeSpace, sleep } = require("../lib/textUtils");

const INPUT_FILE = path.join(__dirname, "..", "..", "..", "data", "input", process.env.INPUT_FILE || "urunler.json");
const OUTPUT_FILE = path.join(__dirname, "..", "..", "..", "data", "output", process.env.OUTPUT_FILE || "ozellikler.json");
const TARGET_CATEGORY = normalizeCategory(process.env.TARGET_CATEGORY || "");
const API_DELAY_MS = Number(process.env.API_DELAY_MS || 1200);
const FEATURE_MODE = normalizeCategory(process.env.FEATURE_MODE || "auto");
const USE_WEB_SOURCE = process.env.USE_WEB_SOURCE !== "false";

function shouldIncludeByCategory(product) {
  if (!TARGET_CATEGORY) return true;
  const category = normalizeCategory(getCategorySearchText(product));
  if (category === TARGET_CATEGORY) return true;
  return category.includes(TARGET_CATEGORY) || category === `${TARGET_CATEGORY}ler`;
}

function buildFeatureRecord(facts, strategy, extraction, webInfo) {
  return {
    StokKodu: facts.stockCode,
    UrunAdi: facts.title,
    Kategori: facts.category,
    Marka: facts.brand,
    Strateji: strategy.key,
    Ozellikler: extraction.Ozellikler,
    Kaynak: extraction.Kaynak,
    Durum: extraction.Durum,
    Hata: extraction.Hata || "",
    KontrolNotu: extraction.KontrolNotu || "",
    WebKaynak: webInfo ? { url: webInfo.url || "", source: webInfo.source || "" } : null
  };
}

function getTemplateExtraction(facts) {
  return {
    Ozellikler: getManualFeatureTemplate(facts),
    Kaynak: "manual-template",
    Durum: "manuel_doldurulacak",
    Hata: "",
    KontrolNotu: "Placeholder alanlari doldurup onaylamak için Durum alanını onaylandi yap."
  };
}

function shouldUseManualTemplateMode() {
  return FEATURE_MODE === "template" || FEATURE_MODE === "manuel" || FEATURE_MODE === "manual";
}

async function main() {
  const manualTemplateMode = shouldUseManualTemplateMode();
  if (!manualTemplateMode && !isGeminiEnabled()) {
    throw new Error("Gemini kapalı veya API anahtarı eksik. `bilgitopla` için geçerli bir GEMINI_API_KEY gerekli.");
  }

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
  console.log(`Çalışma modu: ${manualTemplateMode ? "bilgitopla-template" : "bilgitopla"}`);
  console.log(`Web kaynak: ${USE_WEB_SOURCE ? "aktif" : "kapalı"}`);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  const results = [];

  for (let index = 0; index < filtered.length; index += 1) {
    const product = filtered[index];
    const facts = extractProductFacts(product);
    const strategy = getCategoryStrategy(facts);
    console.log(`[${index + 1}/${filtered.length}] Özellik toplanıyor: ${normalizeSpace(facts.title)}`);

    if (manualTemplateMode) {
      results.push(buildFeatureRecord(facts, strategy, getTemplateExtraction(facts), null));
      continue;
    }

    let webInfo = null;
    let webSourceText = "";
    if (USE_WEB_SOURCE) {
      try {
        webInfo = await fetchProductDetailsFromWeb(facts.title, facts.brand);
        webSourceText = webInfo.text || "";
        if (webSourceText) {
          console.log(`  Web kaynak bulundu: ${webInfo.source} (${webSourceText.length} karakter)`);
        } else {
          console.log(`  Web kaynak bulunamadı: ${webInfo.source}`);
        }
      } catch (error) {
        console.log(`  Web kaynak hatası: ${error.message}`);
      }
    }

    try {
      const extraction = await generateFeatureExtraction(facts, strategy.key, webSourceText);
      results.push(buildFeatureRecord(facts, strategy, extraction, webInfo));
    } catch (error) {
      results.push(
        buildFeatureRecord(facts, strategy, {
          Ozellikler: getEmptyFeatureSet(),
          Kaynak: "gemini-request-error",
          Durum: "hata",
          Hata: error.message
        }, webInfo)
      );
    }

    if (index < filtered.length - 1) {
      await sleep(API_DELAY_MS);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf8");

  const waitingCount = results.filter((item) => item.Durum === "bekliyor").length;
  const errorCount = results.filter((item) => item.Durum === "hata").length;
  const skippedCount = results.filter((item) => item.Durum === "kaynak_yok").length;
  const manualCount = results.filter((item) => item.Durum === "manuel_doldurulacak").length;

  console.log(`Tamamlandı: ${results.length} ürün işlendi.`);
  console.log(`Çıktı dosyası: ${OUTPUT_FILE}`);
  console.log(`Kontrol bekleyen kayıt: ${waitingCount}`);
  console.log(`Hatalı kayıt: ${errorCount}`);
  console.log(`Kaynağı yetersiz kayıt: ${skippedCount}`);
  console.log(`Manuel doldurulacak kayıt: ${manualCount}`);
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
