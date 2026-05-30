// const xlsx = require("xlsx");
// const fs = require("fs");
// const path = require("path");

// const excelFilePath = path.join(__dirname, "..", "..", "..", "data", "input", process.env.SOURCE_XLSX || "tum_urunler.xlsx");
// const jsonFilePath = path.join(__dirname, "..", "..", "..", "data", "input", process.env.INPUT_FILE || "urunler.json");

// function normalizeSpace(value) {
//   return String(value || "").replace(/\s+/g, " ").trim();
// }

// try {
//   const workbook = xlsx.readFile(excelFilePath);
//   const sheetName = workbook.SheetNames[0];
//   const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: false });

//   if (rows.length === 0) {
//     throw new Error("Dosya boş.");
//   }

//   const output = rows
//     .map((row) => ({
//       StokKodu: normalizeSpace(row.stockCode || row.barcode),
//       UrunAdi: normalizeSpace(row.label),
//       Marka: normalizeSpace(row.brand),
//       Kategori: normalizeSpace(row.subCategory || row.category || row.mainCategory),
//       AnaKategori: normalizeSpace(row.mainCategory),
//       AltKategori: normalizeSpace(row.subCategory),
//       AciklamaHtml: normalizeSpace(row.details),
//       Varyantlar: [
//         { ad: normalizeSpace(row.variantName1), deger: normalizeSpace(row.variantValue1) },
//         { ad: normalizeSpace(row.variantName2), deger: normalizeSpace(row.variantValue2) },
//         { ad: normalizeSpace(row.variantName3), deger: normalizeSpace(row.variantValue3) },
//         { ad: normalizeSpace(row.variantName4), deger: normalizeSpace(row.variantValue4) },
//         { ad: normalizeSpace(row.variantName5), deger: normalizeSpace(row.variantValue5) }
//       ].filter((item) => item.ad || item.deger)
//     }))
//     .filter((item) => item.UrunAdi);

//   fs.writeFileSync(jsonFilePath, JSON.stringify(output, null, 2), "utf8");
//   console.log(`Başarılı! Toplam ${output.length} ürün ${path.basename(jsonFilePath)} dosyasına yazıldı.`);
// } catch (error) {
//   console.error("Sistem Hatası:", error.message);
// }
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const excelFilePath = path.join(__dirname, "..", "..", "..", "data", "input", "Excel", process.env.SOURCE_XLSX || "sirt_cantasi.xlsx");
const jsonFilePath = path.join(__dirname, "..", "..", "..", "data", "input", "JsonFormat", process.env.INPUT_FILE || "sirt_cantasi.json");

function normalizeSpace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

// Yaratıcı Çözüm: Hücre içindeki verinin JSON olup olmadığını güvenli bir şekilde test eder.
function parseSafely(value) {
  if (!value) return null;
  try {
    return JSON.parse(value); // Veri JSON ise obje olarak döner
  } catch (e) {
    return normalizeSpace(value); // JSON değilse temizlenmiş string olarak döner
  }
}

try {
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: false });

  if (rows.length === 0) throw new Error("Dosya boş.");

  const output = rows
    .map((row) => ({
      StokKodu: normalizeSpace(row.stockCode || row.barcode),
      UrunAdi: normalizeSpace(row.label),
      Marka: normalizeSpace(row.brand),
      Kategori: normalizeSpace(row.subCategory || row.category || row.mainCategory),
      AnaKategori: normalizeSpace(row.mainCategory),
      AltKategori: normalizeSpace(row.subCategory),
      AciklamaHtml: normalizeSpace(row.details),
      
      // EKLENEN KISIM: Details sütununu güvenli parse ederek ayrı bir alan olarak ekleme
      Detaylar: parseSafely(row.details), 

      Varyantlar: [
        { ad: normalizeSpace(row.variantName1), deger: normalizeSpace(row.variantValue1) },
        { ad: normalizeSpace(row.variantName2), deger: normalizeSpace(row.variantValue2) },
        { ad: normalizeSpace(row.variantName3), deger: normalizeSpace(row.variantValue3) },
        { ad: normalizeSpace(row.variantName4), deger: normalizeSpace(row.variantValue4) },
        { ad: normalizeSpace(row.variantName5), deger: normalizeSpace(row.variantValue5) }
      ].filter((item) => item.ad || item.deger)
    }))
    .filter((item) => item.UrunAdi);

  fs.writeFileSync(jsonFilePath, JSON.stringify(output, null, 2), "utf8");
  console.log(`Başarılı! Toplam ${output.length} ürün ${path.basename(jsonFilePath)} dosyasına yazıldı.`);
} catch (error) {
  console.error("Sistem Hatası:", error.message);
}