const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const inputPath = path.join(__dirname, "..", "..", "..", "data", "input", process.env.SOURCE_XLSX || "tum_urunler.xlsx");
const outputPath = path.join(__dirname, "..", "..", "..", "data", "output", "kategori_envanteri.json");

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim() || "(bos)";
}

function countBy(rows, key) {
  const counts = {};
  for (const row of rows) {
    const value = normalize(row[key]);
    counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

try {
  const workbook = xlsx.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: false });

  const report = {
    sourceFile: inputPath,
    rowCount: rows.length,
    headers: Object.keys(rows[0] || {}),
    topMainCategory: countBy(rows, "mainCategory").slice(0, 50),
    topSubCategory: countBy(rows, "subCategory").slice(0, 100),
    missingData: {
      emptyMainCategory: rows.filter((row) => !normalize(row.mainCategory) || normalize(row.mainCategory) === "(bos)").length,
      emptySubCategory: rows.filter((row) => !normalize(row.subCategory) || normalize(row.subCategory) === "(bos)").length,
      emptyDetails: rows.filter((row) => !normalize(row.details) || normalize(row.details) === "(bos)").length,
      emptyBrand: rows.filter((row) => !normalize(row.brand) || normalize(row.brand) === "(bos)").length
    }
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Kategori envanteri oluşturuldu: ${outputPath}`);
} catch (error) {
  console.error("Katalog analizi başarısız:", error.message);
  process.exitCode = 1;
}
