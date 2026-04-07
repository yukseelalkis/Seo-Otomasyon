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
// IPC HANDLERS
// ============================================================

/**
 * Sürükle-bırak ile gelen dosyayı işle ve sonuçları döndür.
 * Frontend dosya yolunu (filePath) gönderir.
 */
ipcMain.handle("start-generation", async (_event, options) => {
  try {
    const { filePath, targetCategory } = options || {};

    if (!filePath || !fs.existsSync(filePath)) {
      return { success: false, message: `Dosya bulunamadı: ${filePath}` };
    }

    // .env yerine doğrudan environment set et
    if (targetCategory) {
      process.env.TARGET_CATEGORY = targetCategory;
    } else {
      delete process.env.TARGET_CATEGORY;
    }

    // Dosyayı oku ve parse et
    const raw = fs.readFileSync(filePath, "utf8");
    const products = JSON.parse(raw);

    if (!Array.isArray(products) || products.length === 0) {
      return { success: false, message: "Dosya boş veya geçersiz format (array bekleniyor)." };
    }

    // Backend modüllerini yükle
    const { normalizeCategory, getCategoryStrategy, getCategorySearchText } = require("./backend/config/categories");
    const seoRules = require("./backend/config/seoRules");
    const { extractProductFacts } = require("./backend/lib/productFacts");
    const { buildSeoTitle, buildMetaDescription, buildMetaKeywords, buildSeoChecklist } = require("./backend/lib/seo");
    const { getMostSimilarMatch } = require("./backend/lib/similarity");
    const { stripHtml, countWords, normalizeSpace } = require("./backend/lib/textUtils");

    // Template generators
    const { buildStationeryDescription } = require("./backend/generators/staioneryTemplate/stationeryTemplate");
    const { buildBookDescription } = require("./backend/generators/bookTemplates");
    const { buildBagDescription, buildPreschoolBagDescription } = require("./backend/generators/bagTemplate/bagTemplate");
    const { buildArtDescription } = require("./backend/generators/artTemplate/artTemplate");
    const { buildOfficeDescription } = require("./backend/generators/officeTemplate/officeTemplate");

    function getTemplateDescription(strategyKey, facts) {
      switch (strategyKey) {
        case "stationery": case "kids": case "set": case "tech": case "office":
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

    // Kategori filtresi
    const filterCategory = normalizeCategory(targetCategory || "");
    const filtered = products.filter((product) => {
      if (!filterCategory) return true;
      const cat = normalizeCategory(getCategorySearchText(product));
      return cat === filterCategory || cat.includes(filterCategory);
    });

    if (filtered.length === 0) {
      return { success: false, message: "Filtreye uyan ürün bulunamadı." };
    }

    // Üretim döngüsü
    const results = [];
    const approvedDescriptions = [];

    for (let i = 0; i < filtered.length; i++) {
      const product = filtered[i];
      const facts = extractProductFacts(product);
      const strategy = getCategoryStrategy(facts);
      const strategyRules = seoRules.getStrategySeoRules(strategy.key);

      const categoryDescriptions = approvedDescriptions
        .filter(d => d.strategyKey === strategy.key)
        .map(d => d.description);

      const description = getTemplateDescription(strategy.key, facts);
      const plainText = stripHtml(description);
      const seoTitle = buildSeoTitle(facts.title);
      const metaDescription = buildMetaDescription(facts);
      const metaKeywords = buildMetaKeywords(facts);
      const seoChecklist = buildSeoChecklist(facts.title, facts.keyword, plainText, strategyRules);
      const passedAllRules = seoChecklist.every(item => item.passed);
      const { highestSimilarity } = getMostSimilarMatch(description, categoryDescriptions);

      const record = {
        StokKodu: facts.stockCode,
        UrunAdi: facts.title,
        Kategori: facts.category,
        Marka: facts.brand,
        SeoBaslik: seoTitle,
        MetaDescription: metaDescription,
        MetaKeywords: metaKeywords,
        UrunAciklamasi: description,
        Strateji: strategy.key,
        UretimKaynagi: "local-template",
        SEOKontrol: { passedAllRules, checklist: seoChecklist },
        KaliteKontrol: {
          wordCount: countWords(plainText),
          highestSimilarity: Number(highestSimilarity.toFixed(2))
        }
      };

      results.push(record);
      approvedDescriptions.push({ strategyKey: strategy.key, description });

      // Progress bildir
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("generation-progress", {
          current: i + 1,
          total: filtered.length,
          productName: facts.title
        });
      }
    }

    // Çıktıyı da dosyaya yaz
    const outputDir = path.join(__dirname, "..", "data", "output");
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `cikti-${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");

    return { success: true, data: results, outputPath, message: `${results.length} ürün işlendi.` };

  } catch (error) {
    return { success: false, message: error.message };
  }
});
