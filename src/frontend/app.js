// ============================================================
// SEO Otomasyon — Frontend (liste, accordion, üretim, kopyala)
// ============================================================

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const selectedFileBox = document.getElementById("selectedFileBox");
const selectedFileName = document.getElementById("selectedFileName");
const selectedFileSize = document.getElementById("selectedFileSize");
const btnRemoveFile = document.getElementById("btnRemoveFile");
const btnGenerate = document.getElementById("btnGenerate");
const btnGenerateAll = document.getElementById("btnGenerateAll");
const targetCategoryInput = document.getElementById("targetCategory");
const resultsArea = document.getElementById("resultsArea");
const resultsActions = document.getElementById("resultsActions");
const resultsListToolbar = document.getElementById("resultsListToolbar");
const statusBadge = document.getElementById("statusBadge");
const progressSection = document.getElementById("progressSection");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const statsGrid = document.getElementById("statsGrid");
const statTotal = document.getElementById("statTotal");
const statSuccess = document.getElementById("statSuccess");
const statFail = document.getElementById("statFail");
const btnCopyAll = document.getElementById("btnCopyAll");
const btnExportJson = document.getElementById("btnExportJson");
const toast = document.getElementById("toast");

/** Electron'da varsa tam yol (opsiyonel); liste/üretim için zorunlu değil */
/** @type {string|null} */
let selectedFilePath = null;
/** FileReader ile okunan ham ürün dizisi (filtre öncesi) */
let sourceProducts = [];
/** Filtrelenmiş satırlar (IPC + üretimle güncellenen alanlar) */
let productRows = [];
let generatingAll = false;
/** @type {Set<number>} */
const generatingIndices = new Set();

const DETAIL_FIELDS = [
  { key: "StokKodu", label: "Stok Kodu" },
  { key: "UrunAdi", label: "Ürün Adı" },
  { key: "Kategori", label: "Kategori" },
  { key: "Marka", label: "Marka" },
  { key: "HedefKelime", label: "Hedef Kelime" },
  { key: "UrunBasligi", label: "Ürün Başlığı" },
  { key: "SeoBaslik", label: "SEO Başlık" },
  { key: "MetaDescription", label: "Meta Açıklama" },
  { key: "MetaKeywords", label: "Meta Anahtar Kelimeler" },
  { key: "UretimKaynagi", label: "Üretim Kaynağı" }
];

// ============================================================
// Yardımcı
// ============================================================

function setStatus(text, type = "ready") {
  statusBadge.textContent = text;
  statusBadge.className = "header-status";
  if (type === "running") statusBadge.classList.add("running");
  if (type === "error") statusBadge.classList.add("error");
}

function showToast(message = "Kopyalandı!") {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function copyToClipboard(text) {
  const s = text == null ? "" : String(text);
  navigator.clipboard.writeText(s).then(() => showToast("Kopyalandı!"));
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error || new Error("Dosya okunamadı"));
    reader.readAsText(file, "UTF-8");
  });
}

function parseProductsJsonText(text) {
  let parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    if (parsed && typeof parsed === "object") {
      parsed = [parsed];
    } else {
      throw new Error("Geçersiz JSON: dizi veya nesne bekleniyor.");
    }
  }
  if (parsed.length === 0) {
    throw new Error("Dosya boş.");
  }
  return parsed;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function displayValue(row, fieldKey) {
  const v = row[fieldKey];
  if (v === undefined || v === null || v === "") return "—";
  return String(v);
}

function mergeRecordIntoRow(row, record) {
  const keys = [
    "StokKodu",
    "UrunAdi",
    "Kategori",
    "Marka",
    "HedefKelime",
    "UrunBasligi",
    "SeoBaslik",
    "MetaDescription",
    "MetaKeywords",
    "UretimKaynagi",
    "UrunAciklamasi",
    "Strateji",
    "SEOKontrol",
    "KaliteKontrol"
  ];
  for (const k of keys) {
    if (record[k] !== undefined) row[k] = record[k];
  }
}

/**
 * Benzerlik havuzu: şu an üretilecek indekslerin eski açıklamaları dışlanır.
 * @param {number[]} excludeIndices
 */
function buildPriorDescriptions(excludeIndices) {
  const exclude = new Set(Array.isArray(excludeIndices) ? excludeIndices : []);
  const out = [];
  productRows.forEach((row, idx) => {
    if (exclude.has(idx)) return;
    if (row.UrunAciklamasi && row.Strateji) {
      out.push({ strategyKey: row.Strateji, description: row.UrunAciklamasi });
    }
  });
  return out;
}

function updateStatsFromRows() {
  const total = productRows.length;
  const success = productRows.filter((r) => r.SEOKontrol?.passedAllRules).length;
  statTotal.textContent = total;
  statSuccess.textContent = success;
  statFail.textContent = total - success;
}

// ============================================================
// Liste çizimi
// ============================================================

function buildDetailRowsHtml(row, index) {
  const lines = DETAIL_FIELDS.map(
    ({ key, label }) => `
    <div class="result-field">
      <span class="field-label">${escapeHtml(label)}</span>
      <span class="field-value field-value-copyable" role="button" tabindex="0" data-copyable="1" data-row-index="${index}" data-field-key="${escapeAttr(
        key
      )}" title="Kopyalamak için tıklayın">${escapeHtml(displayValue(row, key))}</span>
      <button type="button" class="field-copy" data-copy-row="${index}" data-copy-field="${escapeAttr(
        key
      )}" title="Kopyala">📋</button>
    </div>`
  ).join("");

  const extra = row.UrunAciklamasi
    ? `
    <div class="result-field result-field-block">
      <span class="field-label">Ürün Açıklaması</span>
      <div class="field-value-html-wrap">
        <pre class="field-value-html">${escapeHtml(String(row.UrunAciklamasi))}</pre>
        <button type="button" class="btn btn-small btn-outline btn-copy-desc" data-copy-desc-index="${index}">HTML metnini kopyala</button>
      </div>
    </div>
    <div class="result-field">
      <span class="field-label">Kelime</span>
      <span class="field-value field-value-copyable" data-copyable="1" data-row-index="${index}" data-field-key="KaliteKontrol.wordCount" title="Kopyalamak için tıklayın">${escapeHtml(
        String(row.KaliteKontrol?.wordCount ?? "—")
      )}</span>
      <button type="button" class="field-copy" data-copy-row="${index}" data-copy-field="__wordCount" title="Kopyala">📋</button>
    </div>
    <div class="result-field">
      <span class="field-label">Benzerlik</span>
      <span class="field-value field-value-copyable" data-copyable="1" data-row-index="${index}" data-field-key="KaliteKontrol.highestSimilarity" title="Kopyalamak için tıklayın">${escapeHtml(
        String(row.KaliteKontrol?.highestSimilarity ?? "—")
      )}</span>
      <button type="button" class="field-copy" data-copy-row="${index}" data-copy-field="__similarity" title="Kopyala">📋</button>
    </div>`
    : "";

  return lines + extra;
}

function renderProductList() {
  resultsArea.innerHTML = "";

  if (productRows.length === 0) {
    resultsListToolbar.style.display = "none";
    resultsActions.style.display = "none";
    statsGrid.style.display = "none";
    resultsArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-title">Henüz liste yok</p>
        <p class="empty-subtitle">Soldan JSON yükleyin; ürünler burada listelenecek</p>
      </div>`;
    refreshBusyUi();
    return;
  }

  resultsListToolbar.style.display = "flex";
  resultsActions.style.display = "flex";
  updateStatsFromRows();
  statsGrid.style.display = "grid";

  productRows.forEach((row, index) => {
    const seoPassed = row.SEOKontrol?.passedAllRules;
    const hasSeo = row.SEOKontrol !== undefined;
    const seoClass = seoPassed ? "badge-seo-pass" : "badge-seo-fail";
    const seoLabel = !hasSeo ? "" : seoPassed ? "SEO ✓" : "SEO ✗";
    const isGen = generatingIndices.has(index);
    const name = displayValue(row, "UrunAdi");

    const card = document.createElement("div");
    card.className = "result-card product-row";
    card.dataset.rowIndex = String(index);

    card.innerHTML = `
      <div class="result-card-header product-row-header" data-toggle-index="${index}">
        <div class="result-card-title product-row-title">
          <span class="result-index">${index + 1}</span>
          <span class="result-name" title="${escapeAttr(name)}">${escapeHtml(name)}</span>
        </div>
        <div class="result-badges">
          ${row.Strateji ? `<span class="badge badge-strategy">${escapeHtml(row.Strateji)}</span>` : ""}
          ${hasSeo ? `<span class="badge ${seoClass}">${seoLabel}</span>` : ""}
        </div>
        <div class="product-row-actions">
          <button type="button" class="btn btn-small btn-primary btn-uret" data-generate-index="${index}" ${
            isGen || generatingAll ? "disabled" : ""
          }>
            ${isGen ? '<span class="btn-spinner" aria-hidden="true"></span> Üretiliyor...' : "Üret"}
          </button>
          <button type="button" class="btn-toggle" data-chevron-index="${index}" aria-label="Detay">▼</button>
        </div>
      </div>
      <div class="result-card-body" id="body-${index}">
        ${buildDetailRowsHtml(row, index)}
      </div>
    `;

    resultsArea.appendChild(card);
  });

  refreshBusyUi();
}

function refreshBusyUi() {
  const busy = generatingAll || generatingIndices.size > 0;
  btnGenerate.disabled = busy || productRows.length === 0;
  if (btnGenerateAll) {
    btnGenerateAll.disabled = busy || productRows.length === 0;
    btnGenerateAll.innerHTML = generatingAll
      ? '<span class="btn-spinner" aria-hidden="true"></span> Üretiliyor...'
      : "Tümünü Üret";
  }
}

async function reloadProductsFromSource() {
  if (!sourceProducts.length || !window.api?.loadJsonProducts) return;

  setStatus("Yükleniyor...", "running");
  try {
    const targetCategory = targetCategoryInput.value.trim();
    const res = await window.api.loadJsonProducts({
      products: sourceProducts,
      targetCategory,
      filePath: selectedFilePath || undefined
    });

    if (!res.success) {
      setStatus("Hata", "error");
      showToast(res.message || "Yükleme hatası");
      productRows = [];
      renderProductList();
      return;
    }

    productRows = (res.products || []).map((p) => ({ ...p }));
    setStatus("Hazır");
    progressSection.style.display = "none";
    renderProductList();
  } catch (e) {
    setStatus("Hata", "error");
    productRows = [];
    renderProductList();
    showToast(e.message || "Hata");
  }
}

async function runGenerationForIndices(indices) {
  if (!productRows.length || indices.length === 0) return;

  const targetCategory = targetCategoryInput.value.trim();
  const showListProgress = indices.length > 1;

  for (const i of indices) {
    generatingIndices.add(i);
  }
  if (showListProgress) {
    generatingAll = true;
    setStatus("Üretiliyor...", "running");
    progressSection.style.display = "block";
    progressFill.style.width = "5%";
    progressText.textContent = "Üretiliyor...";
  }
  refreshBusyUi();
  renderProductList();

  try {
    const prior = buildPriorDescriptions(indices);

    const res = await window.api.generateAtIndices({
      products: productRows,
      targetCategory,
      indices,
      priorDescriptions: prior,
      filePath: selectedFilePath || undefined
    });

    if (!res.success) {
      setStatus("Hata", "error");
      showToast(res.message || "Üretim hatası");
      return;
    }

    for (const { index, record } of res.updates || []) {
      if (productRows[index]) mergeRecordIntoRow(productRows[index], record);
    }

    if (showListProgress) {
      progressFill.style.width = "100%";
    }
    setStatus("Hazır");
    showToast(`${res.updates?.length || 0} ürün güncellendi`);
  } catch (e) {
    setStatus("Hata", "error");
    showToast(e.message || "Sistem hatası");
  } finally {
    for (const i of indices) generatingIndices.delete(i);
    generatingAll = false;
    if (showListProgress) {
      progressSection.style.display = "none";
    }
    refreshBusyUi();
    updateStatsFromRows();
    renderProductList();
  }
}

async function generateSingle(index) {
  await runGenerationForIndices([index]);
}

async function generateAllRows() {
  const all = productRows.map((_, i) => i);
  await runGenerationForIndices(all);
}

// ============================================================
// Eski tam dosya üretimi (sol panel) — aynı backend
// ============================================================

async function runFullFileGeneration() {
  if (!productRows.length) return;

  const targetCategory = targetCategoryInput.value.trim();

  setStatus("Üretiliyor...", "running");
  generatingAll = true;
  refreshBusyUi();
  progressSection.style.display = "block";
  progressFill.style.width = "10%";
  progressText.textContent = "Başlatılıyor...";

  try {
    const result = await window.api.startGeneration({
      products: productRows,
      targetCategory,
      filePath: selectedFilePath || undefined
    });

    progressFill.style.width = "100%";

    if (result.success) {
      setStatus("Tamamlandı");
      progressText.textContent = `${result.data.length} ürün işlendi.`;
      productRows = productRows.map((p, i) => ({
        ...p,
        ...(result.data[i] || {})
      }));
      renderProductList();
    } else {
      setStatus("Hata", "error");
      progressText.textContent = "Hata oluştu.";
      showToast(result.message || "Hata");
    }
  } catch (error) {
    setStatus("Hata", "error");
    progressText.textContent = "Sistem hatası.";
    showToast(error.message);
  } finally {
    generatingAll = false;
    refreshBusyUi();
  }
}

// ============================================================
// Sonuç alanı — tek seferlik delegasyon
// ============================================================

resultsArea.addEventListener("click", (e) => {
  const genBtn = e.target.closest("[data-generate-index]");
  if (genBtn) {
    e.preventDefault();
    e.stopPropagation();
    const idx = parseInt(genBtn.dataset.generateIndex, 10);
    if (!Number.isNaN(idx)) generateSingle(idx);
    return;
  }

  const copyDesc = e.target.closest("[data-copy-desc-index]");
  if (copyDesc) {
    e.stopPropagation();
    const idx = parseInt(copyDesc.dataset.copyDescIndex, 10);
    if (!Number.isNaN(idx) && productRows[idx]?.UrunAciklamasi) {
      copyToClipboard(productRows[idx].UrunAciklamasi);
    }
    return;
  }

  const fieldCopy = e.target.closest("[data-copy-row]");
  if (fieldCopy) {
    e.stopPropagation();
    const idx = parseInt(fieldCopy.dataset.copyRow, 10);
    const field = fieldCopy.dataset.copyField;
    const row = productRows[idx];
    if (!row) return;
    if (field === "__wordCount") {
      copyToClipboard(String(row.KaliteKontrol?.wordCount ?? ""));
      return;
    }
    if (field === "__similarity") {
      copyToClipboard(String(row.KaliteKontrol?.highestSimilarity ?? ""));
      return;
    }
    copyToClipboard(displayValue(row, field) === "—" ? "" : row[field] ?? "");
    return;
  }

  const copyable = e.target.closest("[data-copyable]");
  if (copyable) {
    e.stopPropagation();
    const idx = parseInt(copyable.dataset.rowIndex, 10);
    const field = copyable.dataset.fieldKey;
    const row = productRows[idx];
    if (!row) return;
    if (field === "KaliteKontrol.wordCount") {
      copyToClipboard(String(row.KaliteKontrol?.wordCount ?? ""));
      return;
    }
    if (field === "KaliteKontrol.highestSimilarity") {
      copyToClipboard(String(row.KaliteKontrol?.highestSimilarity ?? ""));
      return;
    }
    const v = row[field];
    copyToClipboard(v == null || v === "" ? "" : String(v));
    return;
  }

  const chevron = e.target.closest("[data-chevron-index]");
  const header = e.target.closest(".product-row-header");
  if (chevron || header) {
    const idxStr = chevron ? chevron.dataset.chevronIndex : header?.dataset.toggleIndex;
    if (idxStr == null) return;
    const idx = parseInt(idxStr, 10);
    const body = document.getElementById(`body-${idx}`);
    if (body) {
      body.classList.toggle("open");
      const chev = document.querySelector(`[data-chevron-index="${idx}"]`);
      if (chev) chev.textContent = body.classList.contains("open") ? "▲" : "▼";
    }
  }
});

// Klavye: değer üzerinde Enter / Space ile kopyala
resultsArea.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const t = e.target.closest("[data-copyable]");
  if (!t || !resultsArea.contains(t)) return;
  e.preventDefault();
  t.click();
});

// ============================================================
// Sürükle-bırak
// ============================================================

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove("drag-over");

  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].name.endsWith(".json")) {
    handleFileSelected(files[0]);
  } else {
    showToast("Sadece .json dosyaları kabul edilir!");
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    handleFileSelected(fileInput.files[0]);
  }
});

async function handleFileSelected(file) {
  selectedFilePath = file.path || null;
  selectedFileName.textContent = file.name;
  selectedFileSize.textContent = formatBytes(file.size);

  dropZone.style.display = "none";
  selectedFileBox.style.display = "flex";

  try {
    const text = await readFileAsText(file);
    sourceProducts = parseProductsJsonText(text);
    setStatus("Hazır");
    await reloadProductsFromSource();
  } catch (err) {
    sourceProducts = [];
    productRows = [];
    showToast(err.message || "JSON okunamadı");
    setStatus("Hata", "error");
    renderProductList();
    refreshBusyUi();
  }
}

btnRemoveFile.addEventListener("click", () => {
  selectedFilePath = null;
  sourceProducts = [];
  fileInput.value = "";
  dropZone.style.display = "block";
  selectedFileBox.style.display = "none";
  productRows = [];
  progressSection.style.display = "none";
  resultsListToolbar.style.display = "none";
  renderProductList();
  refreshBusyUi();
  setStatus("Hazır");
});

targetCategoryInput.addEventListener(
  "change",
  () => {
    if (sourceProducts.length) reloadProductsFromSource();
  }
);

targetCategoryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && sourceProducts.length) {
    e.preventDefault();
    reloadProductsFromSource();
  }
});

// ============================================================
// Üretim tetikleyicileri
// ============================================================

btnGenerate.addEventListener("click", () => {
  runFullFileGeneration();
});

if (btnGenerateAll) {
  btnGenerateAll.addEventListener("click", (e) => {
    e.preventDefault();
    generateAllRows();
  });
}

btnCopyAll.addEventListener("click", () => {
  if (productRows.length === 0) return;
  const allDescriptions = productRows
    .map((r) => `--- ${displayValue(r, "UrunAdi")} ---\n${r.UrunAciklamasi || "(henüz üretilmedi)"}`)
    .join("\n\n");
  copyToClipboard(allDescriptions);
  showToast("Tüm satırlar panoya kopyalandı");
});

btnExportJson.addEventListener("click", () => {
  if (productRows.length === 0) return;
  const blob = new Blob([JSON.stringify(productRows, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `seo-cikti-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("JSON indirildi");
});

if (window.api?.onProgress) {
  window.api.onProgress((data) => {
    if (!data?.total) return;
    if (progressSection.style.display === "none") return;
    const pct = Math.min(10 + Math.floor((data.current / data.total) * 85), 95);
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${data.current} / ${data.total} — ${data.productName || ""}`;
  });
}

refreshBusyUi();
