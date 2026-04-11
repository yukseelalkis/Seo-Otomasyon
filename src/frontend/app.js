// ============================================================
// SEO Otomasyon — Frontend (liste, accordion, üretim, kopyala)
// ============================================================

const selectedFileName = document.getElementById("selectedFileName");
const selectedFileSize = document.getElementById("selectedFileSize");
const btnClearAktifGirdi = document.getElementById("btnClearAktifGirdi");
const aktifGirdiWrap = document.getElementById("aktifGirdiWrap");
const aktifGirdiPlaceholder = document.getElementById("aktifGirdiPlaceholder");
const aktifUrunDetay = document.getElementById("aktifUrunDetay");
const testKitaplariMetaHint = document.getElementById("testKitaplariMetaHint");
const kategoriCheckboxList = document.getElementById("kategoriCheckboxList");
const katalogListEmpty = document.getElementById("katalogListEmpty");
const katalogListToolbar = document.getElementById("katalogListToolbar");
const katalogListWrap = document.getElementById("katalogListWrap");
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

const panelAciklama = document.getElementById("panelAciklama");
const btnAciklamaUret = document.getElementById("btnAciklamaUret");
const catalogMeta = document.getElementById("catalogMeta");
const addAnaGrup = document.getElementById("addAnaGrup");
const addUstGrup = document.getElementById("addUstGrup");
const addOzellik = document.getElementById("addOzellik");
const addAnahtarInput = document.getElementById("addAnahtarInput");
const addBaseKod = document.getElementById("addBaseKod");
const addUrunAdi = document.getElementById("addUrunAdi");
const addMarka = document.getElementById("addMarka");
const addStokKodu = document.getElementById("addStokKodu");
const btnCopyStokDraft = document.getElementById("btnCopyStokDraft");
const btnUretStokKodu = document.getElementById("btnUretStokKodu");
const btnAddUrunQueue = document.getElementById("btnAddUrunQueue");
const btnSyncToAciklama = document.getElementById("btnSyncToAciklama");
const urunQueueEmpty = document.getElementById("urunQueueEmpty");
const urunQueueTable = document.getElementById("urunQueueTable");
const urunQueueBody = document.getElementById("urunQueueBody");

/** @type {Record<string, Record<string, { isim: string, anahtar: string, base_kod: string }[]>>} */
let productCatalog = {};
/** @type {{ StokKodu: string, UrunAdi: string, ANAHTAR: string, payload: Record<string, unknown> }[]} */
let urunQueue = [];
/** @type {(string|null)[]} */
let slotPhotos = [null, null, null];

/** test_kitaplari.json IPC filtresinden gelen son liste */
/** @type {Record<string, unknown>[]} */
let testKitaplariFiltered = [];
let testKitaplariFilterDebounce = null;

const KATEGORI_EMPTY_KEY = "__EMPTY__";

function categoryCheckboxLabel(key) {
  return key === KATEGORI_EMPTY_KEY ? "Kategori belirtilmemiş" : key;
}

function sanitizeProductDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function htmlToPlainPreview(html, maxLen) {
  if (!html) return "—";
  const d = document.createElement("div");
  d.innerHTML = String(html);
  const t = (d.textContent || "").replace(/\s+/g, " ").trim();
  if (!t) return "—";
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

function displayValueFlat(obj, key) {
  const v = obj[key];
  if (v === undefined || v === null || v === "") return "";
  return String(v);
}

function showAktifGirdiUi(titleLine, subLine, rawProduct) {
  if (aktifGirdiPlaceholder) aktifGirdiPlaceholder.style.display = "none";
  if (aktifGirdiWrap) aktifGirdiWrap.hidden = false;
  if (selectedFileName) selectedFileName.textContent = titleLine;
  if (selectedFileSize) selectedFileSize.textContent = subLine;
  if (aktifUrunDetay) {
    if (!rawProduct) {
      aktifUrunDetay.innerHTML = "";
      return;
    }
    const kat = String(rawProduct.Kategori ?? rawProduct.kategori ?? "").trim() || "—";
    const marka = String(rawProduct.Marka ?? rawProduct.marka ?? "—");
    const det =
      rawProduct.Detay ??
      rawProduct.detay ??
      rawProduct.Aciklama ??
      rawProduct.aciklama ??
      rawProduct.details ??
      "";
    const aciklamaHtml = rawProduct.AciklamaHtml ?? rawProduct.aciklamaHtml ?? "";
    const detStr = det ? String(det) : "";
    const detPreview = detStr
      ? detStr.length > 500
        ? `${detStr.slice(0, 500)}…`
        : detStr
      : htmlToPlainPreview(aciklamaHtml, 400);
    aktifUrunDetay.innerHTML = `
      <dl class="aktif-urun-dl">
        <dt>Kategori</dt><dd>${escapeHtml(kat)}</dd>
        <dt>Marka</dt><dd>${escapeHtml(marka)}</dd>
        <dt>Detay / açıklama özeti</dt><dd>${escapeHtml(detPreview)}</dd>
      </dl>`;
  }
}

function clearAktifGirdiUi() {
  sourceProducts = [];
  selectedFilePath = null;
  if (aktifGirdiWrap) aktifGirdiWrap.hidden = true;
  if (aktifGirdiPlaceholder) aktifGirdiPlaceholder.style.display = "";
  if (aktifUrunDetay) aktifUrunDetay.innerHTML = "";
  productRows = [];
  progressSection.style.display = "none";
  resultsListToolbar.style.display = "none";
  renderProductList();
  refreshBusyUi();
  setStatus("Hazır");
}

async function activateProductForAciklama(rawProduct) {
  sourceProducts = [sanitizeProductDeep(rawProduct)];
  selectedFilePath = null;
  const name = String(rawProduct.UrunAdi ?? rawProduct.urunAdi ?? "Ürün");
  const stok = String(rawProduct.StokKodu ?? rawProduct.stokKodu ?? "—");
  if (targetCategoryInput) {
    targetCategoryInput.value = String(rawProduct.Kategori ?? rawProduct.kategori ?? "").trim();
  }
  showAktifGirdiUi(name, stok, rawProduct);
  setStatus("Yükleniyor...", "running");
  await reloadProductsFromSource();
  setStatus("Hazır");
  panelAciklama?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (btnGenerate) btnGenerate.focus();
  showToast("Ürün üretim girdisine aktarıldı");
}

function getSelectedCategoryKeys() {
  if (!kategoriCheckboxList) return [];
  return [...kategoriCheckboxList.querySelectorAll('input[type="checkbox"]:checked')].map((c) => c.value);
}

function scheduleRefreshKatalogList() {
  if (testKitaplariFilterDebounce) clearTimeout(testKitaplariFilterDebounce);
  testKitaplariFilterDebounce = setTimeout(() => {
    void refreshKatalogList();
  }, 150);
}

async function refreshKatalogList() {
  if (!katalogListEmpty || !katalogListWrap) return;
  const keys = getSelectedCategoryKeys();
  katalogListWrap.hidden = true;
  if (katalogListToolbar) katalogListToolbar.hidden = true;
  if (keys.length === 0) {
    katalogListEmpty.style.display = "";
    katalogListEmpty.textContent = "Lütfen kategori seçin.";
    testKitaplariFiltered = [];
    return;
  }
  katalogListEmpty.style.display = "";
  katalogListEmpty.textContent = "Yükleniyor…";
  if (!window.api?.getTestKitaplariFiltered) {
    katalogListEmpty.textContent = "IPC kullanılamıyor.";
    return;
  }
  const res = await window.api.getTestKitaplariFiltered(keys);
  if (!res.success) {
    katalogListEmpty.textContent = res.message || "Liste alınamadı";
    testKitaplariFiltered = [];
    return;
  }
  testKitaplariFiltered = Array.isArray(res.products) ? res.products : [];
  katalogListEmpty.style.display = "none";
  if (katalogListToolbar) {
    if (res.truncated) {
      katalogListToolbar.hidden = false;
      katalogListToolbar.textContent = `İlk ${res.products.length} ürün gösteriliyor (toplam eşleşen: ${res.totalMatched}).`;
    } else {
      katalogListToolbar.hidden = true;
      katalogListToolbar.textContent = "";
    }
  }
  katalogListWrap.innerHTML = testKitaplariFiltered
    .map(
      (p, i) => `
    <div class="katalog-card" data-katalog-idx="${i}">
      <div class="katalog-card-title">${escapeHtml(displayValueFlat(p, "UrunAdi") || "—")}</div>
      <div class="katalog-card-meta">${escapeHtml(displayValueFlat(p, "StokKodu") || "—")} · ${escapeHtml(
        displayValueFlat(p, "Kategori") || "—"
      )}</div>
      <button type="button" class="btn btn-small btn-primary btn-katalog-sec" data-katalog-idx="${i}">Açıklama üretimine aktar</button>
    </div>`
    )
    .join("");
  katalogListWrap.hidden = testKitaplariFiltered.length === 0;
  if (testKitaplariFiltered.length === 0) {
    katalogListEmpty.style.display = "";
    katalogListEmpty.textContent = "Seçilen kategorilerde ürün yok.";
  }
}

async function initTestKitaplariPanel() {
  if (!kategoriCheckboxList || !testKitaplariMetaHint) return;
  if (!window.api?.getTestKitaplariMeta) {
    testKitaplariMetaHint.textContent = "Katalog IPC kullanılamıyor.";
    return;
  }
  try {
    const res = await window.api.getTestKitaplariMeta();
    if (!res.success) {
      testKitaplariMetaHint.textContent = res.message || "Meta yüklenemedi.";
      return;
    }
    testKitaplariMetaHint.textContent = `Kaynak: ${res.sourcePath || "data/input/test_kitaplari.json"} · ${
      res.total
    } kayıt · ${res.categories?.length ?? 0} kategori.`;
    kategoriCheckboxList.innerHTML = "";
    const cats = res.categories || [];
    for (let c = 0; c < cats.length; c++) {
      const catKey = cats[c];
      const safeId = `kat_${c}_${String(catKey).replace(/[^a-zA-Z0-9_]/g, "_")}`;
      const label = document.createElement("label");
      label.className = "kategori-checkbox-item";
      label.htmlFor = safeId;
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = safeId;
      cb.value = catKey;
      cb.addEventListener("change", scheduleRefreshKatalogList);
      label.appendChild(cb);
      label.appendChild(document.createTextNode(` ${categoryCheckboxLabel(catKey)}`));
      kategoriCheckboxList.appendChild(label);
    }
  } catch (e) {
    testKitaplariMetaHint.textContent = e.message || "Katalog hatası.";
  }
}

function getCeto() {
  const C = globalThis.CetoStockCode;
  if (!C) throw new Error("CetoStockCode yüklenemedi.");
  return C;
}

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
// Ürün Ekle + Kategori / CETO (tek sayfa)
// ============================================================

function hasValidDraftStok() {
  const v = addStokKodu ? addStokKodu.value.trim() : "";
  return Boolean(v && v !== "KOD YOK");
}

function updateAciklamaUretButtonState() {
  if (btnAciklamaUret) {
    btnAciklamaUret.disabled = !hasValidDraftStok();
  }
}

function parseProductCatalogJsonText(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Katalog kök nesne olmalıdır.");
  }
  const anaKeys = Object.keys(parsed);
  for (let a = 0; a < anaKeys.length; a++) {
    const ag = anaKeys[a];
    const sub = parsed[ag];
    if (!sub || typeof sub !== "object" || Array.isArray(sub)) {
      throw new Error(`Geçersiz alt yapı: ${ag}`);
    }
    const ustKeys = Object.keys(sub);
    for (let u = 0; u < ustKeys.length; u++) {
      const ug = ustKeys[u];
      const arr = sub[ug];
      if (!Array.isArray(arr)) {
        throw new Error(`Üst grup dizi olmalı: ${ag} › ${ug}`);
      }
      for (let k = 0; k < arr.length; k++) {
        const it = arr[k];
        if (!it || typeof it !== "object") {
          throw new Error(`Geçersiz öğe: ${ag} › ${ug} [${k}]`);
        }
        if (it.isim == null || it.anahtar == null || it.base_kod == null) {
          throw new Error(`Öğede isim, anahtar, base_kod zorunlu: ${ag} › ${ug}`);
        }
      }
    }
  }
  return parsed;
}

function setCatalogMeta(text) {
  if (catalogMeta) catalogMeta.textContent = text;
}

function countCatalogLeaves(catalog) {
  let n = 0;
  const ana = Object.keys(catalog || {});
  for (let i = 0; i < ana.length; i++) {
    const sub = catalog[ana[i]];
    if (!sub || typeof sub !== "object") continue;
    const ust = Object.keys(sub);
    for (let j = 0; j < ust.length; j++) {
      const arr = sub[ust[j]];
      if (Array.isArray(arr)) n += arr.length;
    }
  }
  return n;
}

function applyProductCatalog(catalog) {
  productCatalog =
    catalog && typeof catalog === "object" && !Array.isArray(catalog) ? catalog : {};
  const anaCount = Object.keys(productCatalog).length;
  const leafCount = countCatalogLeaves(productCatalog);
  setCatalogMeta(anaCount ? `${anaCount} ana grup, ${leafCount} özellik` : "Boş — JSON yükleyin");
  populateAnaGrupSelect();
  populateUstGrupSelect();
  populateOzellikSelect();
  syncOzellikFieldsFromSelection();
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "tr"));
}

function populateAnaGrupSelect() {
  if (!addAnaGrup) return;
  const prev = addAnaGrup.value;
  addAnaGrup.innerHTML = "";
  const ana = uniqueSorted(Object.keys(productCatalog));
  ana.forEach((a) => {
    const o = document.createElement("option");
    o.value = a;
    o.textContent = a;
    addAnaGrup.appendChild(o);
  });
  if (prev && ana.includes(prev)) addAnaGrup.value = prev;
  else if (ana[0]) addAnaGrup.value = ana[0];
}

function populateUstGrupSelect() {
  if (!addUstGrup || !addAnaGrup) return;
  const ana = addAnaGrup.value;
  const prev = addUstGrup.value;
  addUstGrup.innerHTML = "";
  const sub = productCatalog[ana];
  const ust = sub && typeof sub === "object" ? uniqueSorted(Object.keys(sub)) : [];
  ust.forEach((u) => {
    const o = document.createElement("option");
    o.value = u;
    o.textContent = u;
    addUstGrup.appendChild(o);
  });
  if (prev && ust.includes(prev)) addUstGrup.value = prev;
  else if (ust[0]) addUstGrup.value = ust[0];
}

function populateOzellikSelect() {
  if (!addOzellik || !addAnaGrup || !addUstGrup) return;
  const ana = addAnaGrup.value;
  const ust = addUstGrup.value;
  addOzellik.innerHTML = "";
  const sub = productCatalog[ana];
  const items = sub && sub[ust];
  if (!Array.isArray(items)) return;
  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = row.isim != null ? String(row.isim) : "";
    addOzellik.appendChild(o);
  }
}

/**
 * @returns {{ anaGrup: string, ustGrup: string, item: { isim: string, anahtar: string, base_kod: string } } | null}
 */
function getSelectedTreeContext() {
  if (!addOzellik || !addAnaGrup || !addUstGrup || addOzellik.selectedIndex < 0) return null;
  const anaGrup = addAnaGrup.value;
  const ustGrup = addUstGrup.value;
  const idx = parseInt(addOzellik.value, 10);
  const items = productCatalog[anaGrup] && productCatalog[anaGrup][ustGrup];
  if (Number.isNaN(idx) || !Array.isArray(items) || !items[idx]) return null;
  const item = items[idx];
  return {
    anaGrup,
    ustGrup,
    item: {
      isim: String(item.isim ?? ""),
      anahtar: String(item.anahtar ?? ""),
      base_kod: String(item.base_kod ?? "").trim()
    }
  };
}

function syncOzellikFieldsFromSelection() {
  const ctx = getSelectedTreeContext();
  if (!ctx) {
    if (addAnahtarInput) addAnahtarInput.value = "";
    if (addBaseKod) addBaseKod.value = "";
    return;
  }
  if (addAnahtarInput) addAnahtarInput.value = ctx.item.anahtar;
  if (addBaseKod) addBaseKod.value = ctx.item.base_kod;
}

function rebuildCetoMotorState() {
  const Ceto = getCeto();
  const state = Ceto.createCetoMotorState();
  for (let i = 0; i < productRows.length; i++) {
    const p = productRows[i];
    if (p?.UrunAdi && p?.StokKodu) Ceto.ingestExistingProductRow(state, p.UrunAdi, p.StokKodu);
  }
  for (let i = 0; i < urunQueue.length; i++) {
    const q = urunQueue[i];
    if (q?.UrunAdi && q?.StokKodu) Ceto.ingestExistingProductRow(state, q.UrunAdi, q.StokKodu);
  }
  return state;
}

function runStokKoduUret() {
  const Ceto = getCeto();
  const urunAdi = addUrunAdi ? addUrunAdi.value.trim() : "";
  const ctx = getSelectedTreeContext();
  if (!urunAdi) {
    showToast("Ürün adı girin");
    return;
  }
  if (!ctx || !ctx.item.base_kod) {
    showToast("Özellik seçin");
    return;
  }
  const state = rebuildCetoMotorState();
  const res = Ceto.assignStockCodeByBase(state, urunAdi, ctx.item.base_kod);
  if (addStokKodu) addStokKodu.value = res.code;
  updateAciklamaUretButtonState();
  if (!res.ok) showToast(res.reason || res.code);
  else if (res.duplicate) showToast("Mevcut ürün adı — aynı kod");
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(r.error || new Error("Okunamadı"));
    r.readAsDataURL(file);
  });
}

function initMediaSlots() {
  document.querySelectorAll(".media-slot").forEach((slot) => {
    const idx = parseInt(slot.getAttribute("data-slot") || "0", 10);
    const input = slot.querySelector(".media-input");
    const preview = slot.querySelector(".media-preview");
    const img = slot.querySelector(".media-img");
    const ph = slot.querySelector(".media-placeholder");
    const clearBtn = slot.querySelector(".media-clear");
    if (!input || !preview) return;

    preview.addEventListener("click", () => input.click());
    preview.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.click();
      }
    });

    input.addEventListener("change", async () => {
      const f = input.files && input.files[0];
      if (!f) return;
      try {
        const url = await readFileAsDataURL(f);
        slotPhotos[idx] = url;
        if (img) {
          img.src = url;
          img.removeAttribute("hidden");
        }
        if (ph) ph.setAttribute("hidden", "");
        if (clearBtn) clearBtn.removeAttribute("hidden");
      } catch {
        showToast("Görsel okunamadı");
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        slotPhotos[idx] = null;
        input.value = "";
        if (img) {
          img.removeAttribute("src");
          img.setAttribute("hidden", "");
        }
        if (ph) ph.removeAttribute("hidden");
        clearBtn.setAttribute("hidden", "");
      });
    }
  });
}

function renderUrunQueue() {
  if (!urunQueueBody || !urunQueueTable || !urunQueueEmpty) return;
  if (urunQueue.length === 0) {
    urunQueueEmpty.removeAttribute("hidden");
    urunQueueTable.setAttribute("hidden", "");
    urunQueueBody.innerHTML = "";
    return;
  }
  urunQueueEmpty.setAttribute("hidden", "");
  urunQueueTable.removeAttribute("hidden");
  urunQueueBody.innerHTML = urunQueue
    .map(
      (q, i) => `
    <tr>
      <td><button type="button" class="link-copy-stok" data-q-idx="${i}" title="Kopyala">${escapeHtml(q.StokKodu)}</button></td>
      <td>${escapeHtml(q.UrunAdi)}</td>
      <td><span class="field-value-copyable queue-key" tabindex="0" role="button" data-q-copy="${i}" data-part="anahtar">${escapeHtml(
        q.ANAHTAR
      )}</span></td>
      <td><button type="button" class="btn btn-small btn-outline" data-q-remove="${i}">Sil</button></td>
    </tr>`
    )
    .join("");
}

urunQueueBody?.addEventListener("click", (e) => {
  const rm = e.target.closest("[data-q-remove]");
  if (rm) {
    const i = parseInt(rm.dataset.qRemove, 10);
    if (!Number.isNaN(i)) {
      urunQueue.splice(i, 1);
      renderUrunQueue();
    }
    return;
  }
  const lk = e.target.closest(".link-copy-stok");
  if (lk) {
    const i = parseInt(lk.dataset.qIdx, 10);
    if (!Number.isNaN(i) && urunQueue[i]) copyToClipboard(urunQueue[i].StokKodu);
    return;
  }
  const c = e.target.closest("[data-q-copy]");
  if (c && c.dataset.part === "anahtar") {
    const i = parseInt(c.dataset.qCopy, 10);
    if (!Number.isNaN(i) && urunQueue[i]) copyToClipboard(urunQueue[i].ANAHTAR);
  }
});

async function loadProductCatalogFromIpc() {
  if (!window.api?.getProductCatalog) return;
  try {
    const res = await window.api.getProductCatalog();
    if (res.success && res.catalog && Object.keys(res.catalog).length) {
      applyProductCatalog(res.catalog);
    } else {
      setCatalogMeta(res.message || "Katalog yok — JSON yükleyin");
      applyProductCatalog({});
    }
  } catch {
    setCatalogMeta("Yüklenemedi");
    applyProductCatalog({});
  }
}

if (addAnaGrup) {
  addAnaGrup.addEventListener("change", () => {
    populateUstGrupSelect();
    populateOzellikSelect();
    syncOzellikFieldsFromSelection();
  });
}
if (addUstGrup) {
  addUstGrup.addEventListener("change", () => {
    populateOzellikSelect();
    syncOzellikFieldsFromSelection();
  });
}
if (addOzellik) {
  addOzellik.addEventListener("change", () => syncOzellikFieldsFromSelection());
}

if (btnUretStokKodu) btnUretStokKodu.addEventListener("click", () => runStokKoduUret());

if (btnAciklamaUret) {
  btnAciklamaUret.addEventListener("click", async () => {
    const Ceto = getCeto();
    const ctx = getSelectedTreeContext();
    const urunAdi = addUrunAdi ? addUrunAdi.value.trim() : "";
    const stok = addStokKodu ? addStokKodu.value.trim() : "";
    if (!hasValidDraftStok()) {
      showToast("Önce stok kodu üretin");
      return;
    }
    if (!ctx || !ctx.item.base_kod) {
      showToast("Özellik seçin");
      return;
    }
    if (!urunAdi) {
      showToast("Ürün adı girin");
      return;
    }
    const marka = addMarka ? addMarka.value.trim() : "";
    const fotograflar = slotPhotos.filter(Boolean);
    const payload = Ceto.buildProductPayloadFromTree(ctx, {
      UrunAdi: urunAdi,
      Marka: marka,
      StokKodu: stok,
      Fotograflar: fotograflar
    });
    const o = { ...payload };
    delete o.Fotograflar;
    sourceProducts = [o];
    selectedFilePath = null;
    showAktifGirdiUi(urunAdi, stok, o);
    await reloadProductsFromSource();
    panelAciklama?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    showToast("Açıklama paneline aktarıldı");
  });
}

if (btnCopyStokDraft && addStokKodu) {
  btnCopyStokDraft.addEventListener("click", () => {
    const v = addStokKodu.value.trim();
    if (v) copyToClipboard(v);
  });
}

if (btnAddUrunQueue) {
  btnAddUrunQueue.addEventListener("click", () => {
    const Ceto = getCeto();
    const ctx = getSelectedTreeContext();
    const urunAdi = addUrunAdi ? addUrunAdi.value.trim() : "";
    const marka = addMarka ? addMarka.value.trim() : "";
    const anahtar = ctx ? ctx.item.anahtar : "";
    if (!ctx || !ctx.item.base_kod) {
      showToast("Özellik seçin");
      return;
    }
    if (!urunAdi) {
      showToast("Ürün adı girin");
      return;
    }
    let stok = addStokKodu ? addStokKodu.value.trim() : "";
    if (!stok || stok === "KOD YOK") {
      const state = rebuildCetoMotorState();
      const res = Ceto.assignStockCodeByBase(state, urunAdi, ctx.item.base_kod);
      stok = res.code;
      if (addStokKodu) addStokKodu.value = stok;
      if (!res.ok) {
        showToast(res.reason || "KOD YOK");
        return;
      }
    }
    const fotograflar = slotPhotos.filter(Boolean);
    const payload = Ceto.buildProductPayloadFromTree(ctx, {
      UrunAdi: urunAdi,
      Marka: marka,
      StokKodu: stok,
      Fotograflar: fotograflar
    });
    urunQueue.push({ StokKodu: stok, UrunAdi: urunAdi, ANAHTAR: anahtar, payload });
    renderUrunQueue();
    slotPhotos = [null, null, null];
    document.querySelectorAll(".media-slot").forEach((slot) => {
      const input = slot.querySelector(".media-input");
      const img = slot.querySelector(".media-img");
      const ph = slot.querySelector(".media-placeholder");
      const clearBtn = slot.querySelector(".media-clear");
      if (input) input.value = "";
      if (img) {
        img.removeAttribute("src");
        img.setAttribute("hidden", "");
      }
      if (ph) ph.removeAttribute("hidden");
      if (clearBtn) clearBtn.setAttribute("hidden", "");
    });
    if (addStokKodu) addStokKodu.value = "";
    updateAciklamaUretButtonState();
    showToast("Listeye eklendi");
  });
}

if (btnSyncToAciklama) {
  btnSyncToAciklama.addEventListener("click", async () => {
    if (!urunQueue.length) {
      showToast("Önce ürün ekleyin");
      return;
    }
    sourceProducts = urunQueue.map((q) => {
      const o = { ...q.payload };
      delete o.Fotograflar;
      return o;
    });
    selectedFilePath = null;
    const first = sourceProducts[0];
    showAktifGirdiUi("Ürün kuyruğu", `${sourceProducts.length} ürün`, first || null);
    if (first && targetCategoryInput) {
      targetCategoryInput.value = String(first.Kategori || first.kategori || "").trim();
    }
    await reloadProductsFromSource();
    panelAciklama?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    showToast("Kuyruk açıklama paneline aktarıldı");
  });
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
        <p class="empty-subtitle">Katalogdan ürün seçin veya soldan taslak / kuyruk aktarın</p>
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

if (katalogListWrap) {
  katalogListWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-katalog-sec");
    if (!btn) return;
    const idx = parseInt(btn.dataset.katalogIdx, 10);
    if (Number.isNaN(idx) || !testKitaplariFiltered[idx]) return;
    void activateProductForAciklama(testKitaplariFiltered[idx]);
  });
}

if (btnClearAktifGirdi) {
  btnClearAktifGirdi.addEventListener("click", () => clearAktifGirdiUi());
}

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

initMediaSlots();
loadProductCatalogFromIpc();
void initTestKitaplariPanel();
updateAciklamaUretButtonState();

refreshBusyUi();
