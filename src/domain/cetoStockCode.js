/**
 * CETO stok kodu motoru — VBA CETO_TemizMetin + CETO_KodMotoru_Mac ile uyumlu saf mantık.
 * UUID vb. kullanılmaz.
 */

(function (global) {
  "use strict";

  /**
   * Excel A–H sütunlarından üretilen kategori satırı (Kategori Kod sayfası).
   * @typedef {Object} KategoriKodRow
   * @property {string} ANA_GRUP
   * @property {string} UST_GRUP_KODU
   * @property {string} UST_GRUP_ADI
   * @property {string} ALT_GRUP_KODU
   * @property {string} ALT_GRUP_OZELLIK_ADI
   * @property {string} OZELLIK_KODU
   * @property {string} ANAHTAR
   * @property {string} KOD
   */

  /**
   * @param {unknown} txt
   * @returns {string}
   */
  function cetoTemizMetin(txt) {
    if (txt == null || txt === "") return "";

    let t = String(txt).toLocaleLowerCase("tr-TR");

    t = t.replace(//g, "c");
    t = t.replace(/Û/g, "g");
    t = t.replace(/Ý/g, "i");
    t = t.replace(/š/g, "o");
    t = t.replace(/ß/g, "s");
    t = t.replace(/Ÿ/g, "u");

    const specials = ["\t", "\n", "\r", "\u00a0"];
    for (let i = 0; i < specials.length; i++) {
      t = t.split(specials[i]).join(" ");
    }

    while (t.includes("  ")) {
      t = t.split("  ").join(" ");
    }

    return t.trim();
  }

  /**
   * VBA: InStr(v,".")>0 And InStrRev(v,".")<Len(v) ve son kısım IsNumeric
   * @param {string} fullCode
   * @returns {{ base: string, serial: number } | null}
   */
  function parseTrailingNumericSuffix(fullCode) {
    const v = String(fullCode || "").trim();
    if (!v || v === "KOD YOK") return null;
    const lastDot = v.lastIndexOf(".");
    if (lastDot <= 0 || lastDot >= v.length - 1) return null;
    const sonKisim = v.slice(lastDot + 1);
    if (!/^\d+$/.test(sonKisim)) return null;
    const base = v.slice(0, lastDot);
    return { base, serial: parseInt(sonKisim, 10) };
  }

  /**
   * Mevcut tam kodlardan taban → en yüksek seri (son 3 hane) haritası.
   * @param {string[]} fullCodes
   * @returns {Record<string, number>}
   */
  function buildMaxSerialByBaseFromCodes(fullCodes) {
    /** @type {Record<string, number>} */
    const maxByBase = {};
    if (!Array.isArray(fullCodes)) return maxByBase;
    for (let i = 0; i < fullCodes.length; i++) {
      const parsed = parseTrailingNumericSuffix(fullCodes[i]);
      if (!parsed) continue;
      const prev = maxByBase[parsed.base];
      if (prev == null || parsed.serial > prev) {
        maxByBase[parsed.base] = parsed.serial;
      }
    }
    return maxByBase;
  }

  /**
   * @param {Record<string, unknown>} row
   * @returns {string}
   */
  function rowAnahtarTemiz(row) {
    return cetoTemizMetin(row && row.ANAHTAR != null ? row.ANAHTAR : "");
  }

  /**
   * Kategori satırında G (ANAHTAR) eşleşmesi — temiz metin birebir.
   * @param {Record<string, unknown>[]} catalogRows
   * @param {string} temizAnahtar
   * @returns {Record<string, unknown> | null}
   */
  function findCatalogRowByAnahtar(catalogRows, temizAnahtar) {
    if (!temizAnahtar || !Array.isArray(catalogRows)) return null;
    for (let r = 0; r < catalogRows.length; r++) {
      const row = catalogRows[r];
      if (rowAnahtarTemiz(row) === temizAnahtar) return row;
    }
    return null;
  }

  /**
   * @typedef {Object} CetoMotorState
   * @property {Record<string, number>} maxByBase
   * @property {Record<string, string>} nameToCode  temizUrun → tam stok kodu
   */

  /**
   * @returns {CetoMotorState}
   */
  function createCetoMotorState() {
    return { maxByBase: {}, nameToCode: {} };
  }

  /**
   * Tek ürün satırından (VBA Fatura Giriş D+E) durumu güncelle: önce mevcut kodları işle.
   * @param {CetoMotorState} state
   * @param {string} urunAdi
   * @param {string} fullCode
   */
  function ingestExistingProductRow(state, urunAdi, fullCode) {
    const v = String(fullCode || "").trim();
    if (!v || v === "KOD YOK") return;
    const temizUrun = cetoTemizMetin(urunAdi);
    if (!temizUrun) return;

    const parsed = parseTrailingNumericSuffix(v);
    if (!parsed) return;

    const prev = state.maxByBase[parsed.base];
    if (prev == null || parsed.serial > prev) {
      state.maxByBase[parsed.base] = parsed.serial;
    }
    state.nameToCode[temizUrun] = v;
  }

  /**
   * Makro adım 2: yeni kod üret (veya aynı ürün adında mevcut kodu döndür).
   * @param {CetoMotorState} state
   * @param {string} urunAdi
   * @param {string} anahtar — F sütunu / arama anahtarı
   * @param {Record<string, unknown>[]} catalogRows — Kategori Kod sayfası
   * @returns {{ ok: boolean, code: string, duplicate?: boolean, reason?: string }}
   */
  /**
   * UI doğrudan base_kod verir; anahtar ile JSON araması yapılmaz.
   * @param {CetoMotorState} state
   * @param {string} urunAdi
   * @param {string} baseKod
   * @returns {{ ok: boolean, code: string, duplicate?: boolean, reason?: string }}
   */
  function assignStockCodeByBase(state, urunAdi, baseKod) {
    const temizUrun = cetoTemizMetin(urunAdi);
    if (!temizUrun) {
      return { ok: false, code: "KOD YOK", reason: "Ürün adı boş" };
    }

    const existing = state.nameToCode[temizUrun];
    if (existing) {
      return { ok: true, code: existing, duplicate: true };
    }

    const base = String(baseKod || "").trim();
    if (!base) {
      return { ok: false, code: "KOD YOK", reason: "Base kod boş" };
    }

    const curMax = state.maxByBase[base] || 0;
    const nextNo = curMax + 1;
    const yeniKod = `${base}.${String(nextNo).padStart(3, "0")}`;

    state.maxByBase[base] = nextNo;
    state.nameToCode[temizUrun] = yeniKod;

    return { ok: true, code: yeniKod };
  }

  function assignStockCodeLikeMacro(state, urunAdi, anahtar, catalogRows) {
    const temizUrun = cetoTemizMetin(urunAdi);
    if (!temizUrun) {
      return { ok: false, code: "KOD YOK", reason: "Ürün adı boş" };
    }

    const existing = state.nameToCode[temizUrun];
    if (existing) {
      return { ok: true, code: existing, duplicate: true };
    }

    const temizAnahtar = cetoTemizMetin(anahtar);
    const row = findCatalogRowByAnahtar(catalogRows, temizAnahtar);
    if (!row) {
      return { ok: false, code: "KOD YOK", reason: "Anahtar eşleşmedi" };
    }

    const baseKod = String(row.KOD != null ? row.KOD : "").trim();
    if (!baseKod) {
      return { ok: false, code: "KOD YOK", reason: "KOD boş" };
    }

    const curMax = state.maxByBase[baseKod] || 0;
    const nextNo = curMax + 1;
    const yeniKod = `${baseKod}.${String(nextNo).padStart(3, "0")}`;

    state.maxByBase[baseKod] = nextNo;
    state.nameToCode[temizUrun] = yeniKod;

    return { ok: true, code: yeniKod };
  }

  /**
   * Katalog satırı + ürün alanlarından SEO/backend uyumlu tek ürün nesnesi.
   * @param {Record<string, unknown>} catalogRow
   * @param {Record<string, unknown>} fields
   * @returns {Record<string, unknown>}
   */
  /**
   * İç içe katalog öğesi (isim, anahtar, base_kod) + ürün alanları.
   * @param {{ anaGrup: string, ustGrup: string, item: { isim: string, anahtar: string, base_kod: string } }} treeCtx
   * @param {Record<string, unknown>} fields
   */
  function buildProductPayloadFromTree(treeCtx, fields) {
    const { anaGrup, ustGrup, item } = treeCtx;
    const kategoriPath = [anaGrup, ustGrup, item.isim].filter(Boolean).join(" › ");
    const urunAdi = String(fields.UrunAdi || "").trim();
    const marka = String(fields.Marka || "").trim();
    const stokKodu = String(fields.StokKodu || "").trim();

    return {
      StokKodu: stokKodu,
      UrunAdi: urunAdi,
      Kategori: kategoriPath || ustGrup || anaGrup,
      Marka: marka || "MaviKalem",
      HedefKelime: fields.HedefKelime != null && String(fields.HedefKelime).trim() ? String(fields.HedefKelime).trim() : urunAdi,
      UrunBasligi: fields.UrunBasligi != null && String(fields.UrunBasligi).trim() ? String(fields.UrunBasligi).trim() : urunAdi,
      ANA_GRUP: anaGrup,
      UST_GRUP_ADI: ustGrup,
      ALT_GRUP_OZELLIK_ADI: item.isim,
      ANAHTAR: item.anahtar,
      KOD: item.base_kod,
      Fotograflar: Array.isArray(fields.Fotograflar) ? fields.Fotograflar : []
    };
  }

  function buildProductPayloadFromCatalog(catalogRow, fields) {
    const anaGrup = String(catalogRow.ANA_GRUP || "");
    const ustAdi = String(catalogRow.UST_GRUP_ADI || "");
    const altOzellik = String(catalogRow.ALT_GRUP_OZELLIK_ADI || "");
    const kategoriPath = [anaGrup, ustAdi, altOzellik].filter(Boolean).join(" › ");

    const urunAdi = String(fields.UrunAdi || "").trim();
    const marka = String(fields.Marka || "").trim();
    const stokKodu = String(fields.StokKodu || "").trim();
    const anahtar = String(fields.ANAHTAR || catalogRow.ANAHTAR || "").trim();

    return {
      StokKodu: stokKodu,
      UrunAdi: urunAdi,
      Kategori: kategoriPath || ustAdi || anaGrup,
      Marka: marka || "MaviKalem",
      HedefKelime: fields.HedefKelime != null && String(fields.HedefKelime).trim() ? String(fields.HedefKelime).trim() : urunAdi,
      UrunBasligi: fields.UrunBasligi != null && String(fields.UrunBasligi).trim() ? String(fields.UrunBasligi).trim() : urunAdi,
      ANA_GRUP: anaGrup,
      UST_GRUP_KODU: catalogRow.UST_GRUP_KODU,
      UST_GRUP_ADI: ustAdi,
      ALT_GRUP_KODU: catalogRow.ALT_GRUP_KODU,
      ALT_GRUP_OZELLIK_ADI: altOzellik,
      OZELLIK_KODU: catalogRow.OZELLIK_KODU,
      ANAHTAR: anahtar,
      KOD: String(catalogRow.KOD || "").trim(),
      Fotograflar: Array.isArray(fields.Fotograflar) ? fields.Fotograflar : []
    };
  }

  const api = {
    cetoTemizMetin,
    parseTrailingNumericSuffix,
    buildMaxSerialByBaseFromCodes,
    findCatalogRowByAnahtar,
    createCetoMotorState,
    ingestExistingProductRow,
    assignStockCodeByBase,
    assignStockCodeLikeMacro,
    buildProductPayloadFromTree,
    buildProductPayloadFromCatalog
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.CetoStockCode = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
