console.log("SCRIPT ÇALIŞTI");
const fs = require("fs");
const path = require("path");

function normalizeText(value) {
  return String(value || "").trim();
}

function lowerTr(value) {
  return normalizeText(value).toLocaleLowerCase("tr-TR");
}

function detectBrand(title) {
  const text = lowerTr(title);

  if (text.includes("legamaster")) return "Legamaster";
  if (text.includes("edding") || text.includes("eddıng")) return "Edding";

  return "Edding";
}

function detectCategoryInfo(product) {
  const title = lowerTr(product.urunAdi);
  const desc = lowerTr(product.urunAciklama);
  const text = `${title} ${desc}`;

  if (text.includes("tahta kalemi") || text.includes("flipchart")) {
    return {
      key: "whiteboard",
      Kategori: "Tahta Kalemi",
      AnaKategori: "Yazım ve İşaretleme",
      AltKategori: "Beyaz Tahta Kalemi"
    };
  }

  if (text.includes("yedek mürekkep")) {
    return {
      key: "refill",
      Kategori: "Yedek Mürekkep",
      AnaKategori: "Yazım ve İşaretleme",
      AltKategori: "Tahta Kalemi Yedek Mürekkebi"
    };
  }

  if (text.includes("asetat")) {
    return {
      key: "acetate",
      Kategori: "Asetat Kalemi",
      AnaKategori: "Yazım ve İşaretleme",
      AltKategori: "Silgili Asetat Kalemi"
    };
  }

  if (text.includes("fosforlu")) {
    return {
      key: "highlighter",
      Kategori: "Fosforlu Kalem",
      AnaKategori: "Yazım ve İşaretleme",
      AltKategori: "Highlighter"
    };
  }

  if (text.includes("akrilik")) {
    return {
      key: "acrylic",
      Kategori: "Akrilik Markör",
      AnaKategori: "Hobi ve Sanat",
      AltKategori: "Akrilik Boyama"
    };
  }

  return {
    key: "generic",
    Kategori: "Genel",
    AnaKategori: "Genel",
    AltKategori: ""
  };
}

function buildHtmlDescription(product, categoryInfo, brand) {
  const title = normalizeText(product.urunAdi);
  const desc = normalizeText(product.urunAciklama);

  // 🔥 PREMIUM FORMAT
  return `
<h2>${title}</h2>

<p><strong>${title}</strong>, ${categoryInfo.Kategori.toLocaleLowerCase("tr-TR")} kategorisinde yer alan kaliteli bir ${brand} ürünüdür.</p>

<p>${desc}</p>

<table style="width: 100%; border-collapse: collapse; border: 1px solid #eaeaea;" cellpadding="8">
<tbody>
<tr style="border-bottom: 1px solid #eaeaea;">
<th style="width:30%; background:#f9f9f9;">Marka</th>
<td>${brand}</td>
</tr>
<tr style="border-bottom: 1px solid #eaeaea;">
<th style="background:#f9f9f9;">Kategori</th>
<td>${categoryInfo.Kategori}</td>
</tr>
<tr style="border-bottom: 1px solid #eaeaea;">
<th style="background:#f9f9f9;">Ürün Adı</th>
<td>${title}</td>
</tr>
</tbody>
</table>

<h3>Sıkça Sorulan Sorular</h3>

<p><strong>Bu ürün nerelerde kullanılır?</strong> ${categoryInfo.Kategori} kategorisinde günlük kullanım için uygundur.</p>
<p><strong>Kaliteli mi?</strong> ${brand} markasının güvenilir üretim standartlarına sahiptir.</p>
<p><strong>Kimler için uygundur?</strong> Pratik ve uzun ömürlü kullanım isteyen herkes için uygundur.</p>

<p>Siz de <strong>${title}</strong> ile kaliteli ve güvenilir bir kullanım deneyimi yaşayabilirsiniz.</p>
`;
}

function transformProduct(product) {
  const brand = detectBrand(product.urunAdi);
  const categoryInfo = detectCategoryInfo(product);

  return {
    ...product,
    Marka: brand,
    Kategori: categoryInfo.Kategori,
    AnaKategori: categoryInfo.AnaKategori,
    AltKategori: categoryInfo.AltKategori,
    AciklamaHtml: buildHtmlDescription(product, categoryInfo, brand),
    Detaylar: buildHtmlDescription(product, categoryInfo, brand),
    Varyantlar: []
  };
}

function main() {
  const inputPath = path.join(__dirname, "..", "..", "..", "data", "input", "JsonFormat", "edding-urunler.json");
  const outputPath = path.join(__dirname, "..", "..", "..", "data", "input", "JsonFormat", "edding-urunler-normalized.json");

  const products = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const result = products.map(transformProduct);

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log("🔥 Bitti kral. Tüm ürünler premium formata çevrildi.");
}

main();