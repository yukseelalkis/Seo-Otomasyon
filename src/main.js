require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: "SEO Otomasyon - MaviKalem",
    autoHideMenuBar: true,
    backgroundColor: "#0b0f1a"
  });

  mainWindow.loadFile(path.join(__dirname, "frontend", "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ============================================================
// Üretim motoru (IPC handler'lar tarafından paylaşılır)
// ============================================================

function loadGenerationDeps() {
  const { normalizeCategory, getCategoryStrategy, getCategorySearchText } = require("./backend/config/categories");
  const seoRules = require("./backend/config/seoRules");
  const { extractProductFacts } = require("./backend/lib/productFacts");
  const { buildSeoTitle, buildMetaDescription, buildMetaKeywords, buildSeoChecklist } = require("./backend/lib/seo");
  const { getMostSimilarMatch } = require("./backend/lib/similarity");
  const { stripHtml, countWords, normalizeSpace } = require("./backend/lib/textUtils");

  const { buildStationeryDescription } = require("./backend/generators/staioneryTemplate/stationeryTemplate");
  const { buildBookDescription } = require("./backend/generators/bookTemplates");
  const { buildBagDescription, buildPreschoolBagDescription } = require("./backend/generators/bagTemplate/bagTemplate");
  const { buildArtDescription } = require("./backend/generators/artTemplate/artTemplate");
  const { buildOfficeDescription } = require("./backend/generators/officeTemplate/officeTemplate");

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

  return {
    normalizeCategory,
    getCategoryStrategy,
    getCategorySearchText,
    seoRules,
    extractProductFacts,
    buildSeoTitle,
    buildMetaDescription,
    buildMetaKeywords,
    buildSeoChecklist,
    getMostSimilarMatch,
    stripHtml,
    countWords,
    normalizeSpace,
    getTemplateDescription
  };
}

function applyTargetCategoryEnv(targetCategory) {
  if (targetCategory) {
    process.env.TARGET_CATEGORY = targetCategory;
  } else {
    delete process.env.TARGET_CATEGORY;
  }
}

function parseProductsArray(raw) {
  let products = JSON.parse(raw);
  if (!Array.isArray(products)) {
    if (products && typeof products === "object") {
      products = [products];
    } else {
      throw new Error("Geçersiz JSON: dizi veya nesne bekleniyor.");
    }
  }
  if (products.length === 0) {
    throw new Error("Dosya boş.");
  }
  return products;
}

function filterProducts(products, targetCategory, ctx) {
  const filterCategory = ctx.normalizeCategory(targetCategory || "");
  return products.filter((product) => {
    if (!filterCategory) return true;
    const cat = ctx.normalizeCategory(ctx.getCategorySearchText(product));
    return cat === filterCategory || cat.includes(filterCategory);
  });
}

async function processOneProduct(product, approvedDescriptions, ctx) {
  const facts = ctx.extractProductFacts(product);
  const hedefKelime = ctx.normalizeSpace(product.HedefKelime || product.hedefKelime || "") || facts.keyword;
  const urunBasligi = ctx.normalizeSpace(product.UrunBasligi || product.urunBasligi || "") || facts.title;
  const factsForSeo = { ...facts, keyword: hedefKelime, title: urunBasligi };

  const strategy = ctx.getCategoryStrategy(facts);
  const strategyRules = ctx.seoRules.getStrategySeoRules(strategy.key);

  const categoryDescriptions = approvedDescriptions
    .filter((d) => d.strategyKey === strategy.key)
    .map((d) => d.description);

  const templateDescription = ctx.getTemplateDescription(strategy.key, facts);
  let description = templateDescription;
  let uretimKaynagi = "local-template";
  let fallbackReason = null;

  const { isGeminiEnabled, generateHtmlDescription } = require("./backend/lib/geminiClient");
  const {
    validateDescription,
    buildHybridDescription,
    formatDescriptionToTable,
    rebalanceKeywordDensity
  } = require("./backend/lib/descriptionGenerationHelpers");

  const canUseAi = isGeminiEnabled() && strategy.aiRecommended;
  if (canUseAi) {
    try {
      const aiDescription = await generateHtmlDescription(facts, strategy.key, strategyRules.minAiWords);
      const candidateDescription =
        strategy.mode === "hybrid" ? buildHybridDescription(templateDescription, aiDescription, facts) : aiDescription;
      const aiValidation = validateDescription(candidateDescription, factsForSeo, categoryDescriptions, strategyRules);
      if (aiValidation.passed) {
        description = candidateDescription;
        uretimKaynagi = "gemini";
      } else {
        uretimKaynagi = "local-fallback";
        fallbackReason = "AI çıktısı kalite veya benzerlik kontrolünü geçemedi, kategoriye özel şablona dönüldü.";
      }
    } catch (error) {
      uretimKaynagi = "local-fallback";
      fallbackReason = `Gemini isteği başarısız oldu: ${error.message}`;
    }
  }

  if (strategy.key !== "book" && strategy.key !== "art" && strategy.key !== "bag" && strategy.key !== "preschool-bag" && strategy.key !== "office") {
    description = formatDescriptionToTable(description, factsForSeo);
  }
  if (strategy.key !== "preschool-bag") {
    description = rebalanceKeywordDensity(description, factsForSeo.keyword, strategyRules, strategy.key);
  }

  const validation = validateDescription(description, factsForSeo, categoryDescriptions, strategyRules);
  const plainText = ctx.stripHtml(description);
  const seoTitle = ctx.buildSeoTitle(factsForSeo.title);
  const metaDescription = ctx.buildMetaDescription(factsForSeo);
  const metaKeywords = ctx.buildMetaKeywords(factsForSeo);
  const seoChecklist = ctx.buildSeoChecklist(factsForSeo.title, factsForSeo.keyword, plainText, strategyRules);
  const passedAllRules = seoChecklist.every((item) => item.passed);

  const record = {
    StokKodu: facts.stockCode,
    UrunAdi: facts.title,
    Kategori: facts.category,
    Marka: facts.brand,
    HedefKelime: hedefKelime,
    UrunBasligi: urunBasligi,
    SeoBaslik: seoTitle,
    MetaDescription: metaDescription,
    MetaKeywords: metaKeywords,
    UrunAciklamasi: description,
    Strateji: strategy.key,
    UretimKaynagi: uretimKaynagi,
    // Kategori-bazlı ekstra alanlar
    materyal: facts.materyal || "",
    kumasOzelligi: facts.kumasOzelligi || "",
    boyut: facts.boyut || "",
    agirlik: facts.agirlik || "",
    bolmeSayisi: facts.bolmeSayisi || "",
    yanBolme: facts.yanBolme || "",
    askiOzelligi: facts.askiOzelligi || "",
    renk: facts.renk || "",
    yasGrubu: facts.yasGrubu || "",
    karakter: facts.karakter || "",
    yikanabilirlik: facts.yikanabilirlik || "",
    uyumluUrunler: facts.uyumluUrunler || "",
    color: facts.color || "",
    leadSize: facts.leadSize || "",
    modelNo: facts.modelNo || "",
    yazar: facts.yazar || "",
    yayinevi: facts.yayinevi || "",
    sayfaSayisi: facts.sayfaSayisi || "",
    ebat: facts.ebat || "",
    isbn: facts.isbn || "",
    classLevel: facts.classLevel || "",
    examType: facts.examType || "",
    lesson: facts.lesson || "",
    publicationType: facts.publicationType || "",
    medium: facts.medium || "",
    countInfo: facts.countInfo || "",
    brushType: facts.brushType || "",
    material: facts.material || "",
    SEOKontrol: { passedAllRules, checklist: seoChecklist },
    KaliteKontrol: {
      wordCount: validation.wordCount,
      highestSimilarity: Number(validation.highestSimilarity.toFixed(2)),
      qualityChecks: validation.qualityChecks,
      fallbackReason
    }
  };

  approvedDescriptions.push({ strategyKey: strategy.key, description });

  return record;
}

/**
 * Yükleme: ham ürün listesi renderer'dan (products) veya diskten (filePath) gelir, filtre uygulanır.
 */
function readAndFilterForLoad(options, targetCategory) {
  const ctx = loadGenerationDeps();
  let products;
  if (options && Array.isArray(options.products)) {
    products = options.products;
    if (products.length === 0) {
      throw new Error("Dosya boş.");
    }
  } else {
    const filePath = options && options.filePath;
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error(
        options && options.filePath
          ? `Dosya bulunamadı: ${filePath}`
          : "Ürün verisi yok: JSON içeriği veya dosya yolu gerekli."
      );
    }
    const raw = fs.readFileSync(filePath, "utf8");
    products = parseProductsArray(raw);
  }
  const filtered = filterProducts(products, targetCategory, ctx);
  if (filtered.length === 0) {
    throw new Error("Filtreye uyan ürün bulunamadı.");
  }
  return { filtered, ctx };
}

/**
 * Üretim: ekrandaki liste (products) doğrudan kullanılır; yoksa dosyadan okunup filtrelenir.
 */
function resolveGenerationList(options, targetCategory) {
  const ctx = loadGenerationDeps();
  if (options && Array.isArray(options.products)) {
    if (options.products.length === 0) {
      throw new Error("Ürün listesi boş.");
    }
    return { list: options.products, ctx };
  }
  const { filtered } = readAndFilterForLoad(options, targetCategory);
  return { list: filtered, ctx };
}

function normalizePriorDescriptions(prior) {
  if (!Array.isArray(prior)) return [];
  return prior
    .filter((p) => p && p.strategyKey && p.description)
    .map((p) => ({ strategyKey: p.strategyKey, description: p.description }));
}

function sendProgress(current, total, productName) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("generation-progress", {
      current,
      total,
      productName
    });
  }
}

// ============================================================
// IPC HANDLERS
// ============================================================

/**
 * Ürün kataloğu (iç içe hiyerarşi). data/productCatalog.json
 */
ipcMain.handle("get-product-catalog", async () => {
  try {
    const catalogPath = path.join(__dirname, "..", "data", "productCatalog.json");
    if (!fs.existsSync(catalogPath)) {
      return { success: false, message: "productCatalog.json bulunamadı.", catalog: null };
    }
    const raw = fs.readFileSync(catalogPath, "utf8");
    const catalog = JSON.parse(raw);
    if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) {
      return { success: false, message: "Geçersiz katalog formatı.", catalog: null };
    }
    return { success: true, catalog };
  } catch (error) {
    return { success: false, message: error.message, catalog: null };
  }
});

const TEST_KITAPLARI_PATH = path.join(__dirname, "..", "data", "input", "test_kitaplari.json");
const MAX_TEST_KITAPLARI_FILTERED = 600;

/** @type {unknown[] | null} */
let testKitaplariCache = null;

function loadTestKitaplariArray() {
  if (!fs.existsSync(TEST_KITAPLARI_PATH)) {
    throw new Error("data/input/test_kitaplari.json bulunamadı.");
  }
  if (!testKitaplariCache) {
    const raw = fs.readFileSync(TEST_KITAPLARI_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      throw new Error("test_kitaplari.json bir dizi olmalıdır.");
    }
    testKitaplariCache = data;
  }
  return testKitaplariCache;
}

function categoryKeyFromProduct(item) {
  const k = String(item.Kategori ?? item.kategori ?? "").trim();
  return k === "" ? "__EMPTY__" : k;
}

ipcMain.handle("get-test-kitaplari-meta", async () => {
  try {
    const arr = loadTestKitaplariArray();
    const catSet = new Set();
    for (let i = 0; i < arr.length; i++) {
      catSet.add(categoryKeyFromProduct(arr[i]));
    }
    const categories = [...catSet].sort((a, b) => {
      if (a === "__EMPTY__") return 1;
      if (b === "__EMPTY__") return -1;
      return a.localeCompare(b, "tr");
    });
    return {
      success: true,
      categories,
      total: arr.length,
      sourcePath: "data/input/test_kitaplari.json"
    };
  } catch (error) {
    return { success: false, message: error.message, categories: [], total: 0, sourcePath: "" };
  }
});

ipcMain.handle("get-test-kitaplari-filtered", async (_event, payload) => {
  try {
    const selected = payload && Array.isArray(payload.categories) ? payload.categories : [];
    if (selected.length === 0) {
      return { success: true, products: [], totalMatched: 0, truncated: false };
    }
    const arr = loadTestKitaplariArray();
    const wanted = new Set(selected);
    const filtered = arr.filter((item) => wanted.has(categoryKeyFromProduct(item)));
    const totalMatched = filtered.length;
    let products = filtered;
    let truncated = false;
    if (products.length > MAX_TEST_KITAPLARI_FILTERED) {
      products = products.slice(0, MAX_TEST_KITAPLARI_FILTERED);
      truncated = true;
    }
    return { success: true, products, totalMatched, truncated };
  } catch (error) {
    return { success: false, message: error.message, products: [], totalMatched: 0, truncated: false };
  }
});

/**
 * JSON dosyasını oku; hedef kategoriye göre filtrelenmiş ürün listesini döndür.
 */
ipcMain.handle("load-json-products", async (_event, options) => {
  try {
    const { targetCategory } = options || {};
    applyTargetCategoryEnv(targetCategory);
    const { filtered } = readAndFilterForLoad(options || {}, targetCategory);
    return { success: true, products: filtered, message: `${filtered.length} ürün yüklendi.` };
  } catch (error) {
    return { success: false, message: error.message, products: [] };
  }
});

/**
 * Belirli indekslerdeki ürünleri üret. Önceki oturum açıklamaları priorDescriptions ile gelir.
 */
ipcMain.handle("generate-at-indices", async (_event, options) => {
  try {
    const { targetCategory, indices, priorDescriptions } = options || {};
    if (!Array.isArray(indices) || indices.length === 0) {
      return { success: false, message: "Geçersiz indeks listesi.", updates: [] };
    }

    applyTargetCategoryEnv(targetCategory);
    const { list, ctx } = resolveGenerationList(options || {}, targetCategory);

    const approvedDescriptions = normalizePriorDescriptions(priorDescriptions);
    const uniqueSorted = [...new Set(indices.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 0))].sort(
      (a, b) => a - b
    );

    const updates = [];
    let progressStep = 0;
    const totalSteps = uniqueSorted.length;

    for (const index of uniqueSorted) {
      if (index >= list.length) {
        return { success: false, message: `Geçersiz ürün indeksi: ${index}`, updates };
      }
      progressStep += 1;
      const product = list[index];
      const facts = ctx.extractProductFacts(product);
      const record = await processOneProduct(product, approvedDescriptions, ctx);
      updates.push({ index, record });
      sendProgress(progressStep, totalSteps, facts.title);
    }

    return { success: true, updates, message: `${updates.length} ürün üretildi.` };
  } catch (error) {
    return { success: false, message: error.message, updates: [] };
  }
});

/**
 * Tüm filtrelenmiş listeyi tek seferde üret (tam işlem).
 */
ipcMain.handle("start-generation", async (_event, options) => {
  try {
    const { targetCategory } = options || {};
    applyTargetCategoryEnv(targetCategory);

    const { list, ctx } = resolveGenerationList(options || {}, targetCategory);
    const approvedDescriptions = [];
    const results = [];

    for (let i = 0; i < list.length; i++) {
      const product = list[i];
      const facts = ctx.extractProductFacts(product);
      const record = await processOneProduct(product, approvedDescriptions, ctx);
      results.push(record);
      sendProgress(i + 1, list.length, facts.title);
    }

    const outputDir = path.join(__dirname, "..", "data", "output");
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `cikti-${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");

    return { success: true, data: results, outputPath, message: `${results.length} ürün işlendi.` };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
