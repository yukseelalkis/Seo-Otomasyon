// ============================================================
// SEO Otomasyon — Frontend Uygulama Mantığı
// Sürükle-bırak, üretim başlatma, kopyalanabilir sonuçlar
// ============================================================

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const selectedFileBox = document.getElementById("selectedFileBox");
const selectedFileName = document.getElementById("selectedFileName");
const selectedFileSize = document.getElementById("selectedFileSize");
const btnRemoveFile = document.getElementById("btnRemoveFile");
const btnGenerate = document.getElementById("btnGenerate");
const targetCategoryInput = document.getElementById("targetCategory");
const resultsArea = document.getElementById("resultsArea");
const resultsActions = document.getElementById("resultsActions");
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

let selectedFilePath = null;
let currentResults = [];

// ============================================================
// YARDIMCI
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
  navigator.clipboard.writeText(text).then(() => showToast());
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

// ============================================================
// SÜRÜKLE-BIRAK
// ============================================================

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
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

function handleFileSelected(file) {
  selectedFilePath = file.path;
  selectedFileName.textContent = file.name;
  selectedFileSize.textContent = formatBytes(file.size);

  dropZone.style.display = "none";
  selectedFileBox.style.display = "flex";
  btnGenerate.disabled = false;
}

btnRemoveFile.addEventListener("click", () => {
  selectedFilePath = null;
  fileInput.value = "";
  dropZone.style.display = "block";
  selectedFileBox.style.display = "none";
  btnGenerate.disabled = true;
});

// ============================================================
// ÜRETİM BAŞLAT
// ============================================================

btnGenerate.addEventListener("click", async () => {
  if (!selectedFilePath) return;

  const targetCategory = targetCategoryInput.value.trim();

  // UI güncelle
  setStatus("Üretiliyor...", "running");
  btnGenerate.disabled = true;
  progressSection.style.display = "block";
  progressFill.style.width = "10%";
  progressText.textContent = "Dosya okunuyor...";
  statsGrid.style.display = "none";
  resultsActions.style.display = "none";
  resultsArea.innerHTML = "";

  try {
    progressFill.style.width = "30%";
    progressText.textContent = "Ürünler işleniyor...";

    const result = await window.api.startGeneration({
      filePath: selectedFilePath,
      targetCategory
    });

    progressFill.style.width = "100%";

    if (result.success) {
      setStatus("Tamamlandı");
      progressText.textContent = `${result.data.length} ürün işlendi.`;
      currentResults = result.data;
      renderResults(result.data);

      // İstatistikler
      const total = result.data.length;
      const success = result.data.filter(r => r.SEOKontrol?.passedAllRules).length;
      statTotal.textContent = total;
      statSuccess.textContent = success;
      statFail.textContent = total - success;
      statsGrid.style.display = "grid";
      resultsActions.style.display = "flex";
    } else {
      setStatus("Hata", "error");
      progressText.textContent = "Hata oluştu.";
      resultsArea.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p class="empty-title">Hata</p><p class="empty-subtitle">${result.message}</p></div>`;
    }
  } catch (error) {
    setStatus("Hata", "error");
    progressText.textContent = "Sistem hatası.";
    resultsArea.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p class="empty-title">Sistem Hatası</p><p class="empty-subtitle">${error.message}</p></div>`;
  } finally {
    btnGenerate.disabled = false;
  }
});

// ============================================================
// SONUÇLARI GÖSTER
// ============================================================

function renderResults(data) {
  resultsArea.innerHTML = "";

  data.forEach((item, index) => {
    const seoPassed = item.SEOKontrol?.passedAllRules;
    const seoClass = seoPassed ? "badge-seo-pass" : "badge-seo-fail";
    const seoLabel = seoPassed ? "SEO ✓" : "SEO ✗";

    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <div class="result-card-header" data-index="${index}">
        <div class="result-card-title">
          <span class="result-index">${index + 1}</span>
          <span class="result-name" title="${item.UrunAdi}">${item.UrunAdi}</span>
        </div>
        <div class="result-badges">
          <span class="badge badge-strategy">${item.Strateji || "—"}</span>
          <span class="badge ${seoClass}">${seoLabel}</span>
        </div>
        <div class="result-card-actions">
          <button class="btn-copy" title="Açıklamayı kopyala" data-copy-index="${index}">📋</button>
          <button class="btn-toggle" data-toggle-index="${index}">▼</button>
        </div>
      </div>
      <div class="result-card-body" id="body-${index}">
        ${buildFieldRow("Ürün Adı", item.UrunAdi)}
        ${buildFieldRow("Stok Kodu", item.StokKodu)}
        ${buildFieldRow("SEO Başlık", item.SeoBaslik)}
        ${buildFieldRow("Meta Açıklama", item.MetaDescription)}
        ${buildFieldRow("Meta Anahtar Kelimeler", item.MetaKeywords)}
        ${buildFieldRow("Ürün Açıklaması", item.UrunAciklamasi, true)}
        ${buildFieldRow("Kaynak", item.UretimKaynagi)}
        ${buildFieldRow("Kelime Sayısı", item.KaliteKontrol?.wordCount)}
        ${buildFieldRow("Benzerlik Skoru", item.KaliteKontrol?.highestSimilarity)}
      </div>
    `;

    resultsArea.appendChild(card);
  });

  // Event delegation
  resultsArea.addEventListener("click", handleResultClick);
}

function buildFieldRow(label, value, isHtml = false) {
  if (!value && value !== 0) return "";
  const displayValue = isHtml
    ? `<div style="max-height:200px;overflow-y:auto;font-size:11px;line-height:1.5;opacity:0.85;word-break:break-all;">${escapeHtml(String(value))}</div>`
    : escapeHtml(String(value));

  return `
    <div class="result-field">
      <span class="field-label">${label}</span>
      <span class="field-value">${displayValue}</span>
      <button class="field-copy" data-copy-text="${escapeAttr(String(value))}" title="Kopyala">📋</button>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function handleResultClick(e) {
  // Kart kopyala butonu
  const copyBtn = e.target.closest("[data-copy-index]");
  if (copyBtn) {
    const idx = parseInt(copyBtn.dataset.copyIndex);
    if (currentResults[idx]) {
      copyToClipboard(currentResults[idx].UrunAciklamasi || "");
    }
    return;
  }

  // Alan kopyala butonu
  const fieldCopy = e.target.closest("[data-copy-text]");
  if (fieldCopy) {
    copyToClipboard(fieldCopy.dataset.copyText);
    return;
  }

  // Aç/kapat butonu veya header tıklama
  const toggleBtn = e.target.closest("[data-toggle-index]");
  const header = e.target.closest(".result-card-header");

  if (toggleBtn || header) {
    const idx = toggleBtn
      ? toggleBtn.dataset.toggleIndex
      : header.dataset.index;
    const body = document.getElementById(`body-${idx}`);
    if (body) {
      body.classList.toggle("open");
      // Toggle ikon
      const btn = document.querySelector(`[data-toggle-index="${idx}"]`);
      if (btn) btn.textContent = body.classList.contains("open") ? "▲" : "▼";
    }
  }
}

// ============================================================
// TOPLU İŞLEMLER
// ============================================================

btnCopyAll.addEventListener("click", () => {
  if (currentResults.length === 0) return;
  const allDescriptions = currentResults
    .map((r) => `--- ${r.UrunAdi} ---\n${r.UrunAciklamasi}`)
    .join("\n\n");
  copyToClipboard(allDescriptions);
  showToast("Tüm açıklamalar kopyalandı!");
});

btnExportJson.addEventListener("click", () => {
  if (currentResults.length === 0) return;
  const blob = new Blob([JSON.stringify(currentResults, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `seo-cikti-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("JSON dosyası indirildi!");
});
