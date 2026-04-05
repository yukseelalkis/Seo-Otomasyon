const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 1. Klasör ve Dosya Yollarını Belirle
// __dirname scriptin olduğu klasörü (src/scripts) verir. 
// Excel dosyası data/input/Excel içinde olduğu için yolları ona göre kuruyoruz.
const excelPath = path.join(__dirname, '../../data/input/Excel/edding.xlsx');
const outputDir = path.join(__dirname, '../../data/output/JsonFormat');
const outputPath = path.join(outputDir, 'edding-urunler.json');

try {
    // 2. Çıktı klasörü yoksa oluştur (Hata almamak için önemli)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 3. Excel dosyasını oku
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 4. JSON'a çevir (Header'lar 2. satırda ise range: 1 ekledik)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { range: 1, defval: "" });

    // 5. Veriyi Temizle ve Formatla
    const cleanedData = rawData.map(item => ({
        urunKodu: String(item["Ürün Kodu"] || item["Ürün Kodu "] || "").trim(),
        barcode: String(item["Barcode"] || "").trim(),
        urunAdi: String(item["Ürün Adı"] || item["Ürün Adı "] || "").trim(),
        urunAciklama: String(item["Ürün Açıklama"] || "").trim()
    }));

    // 6. JSON dosyasını yazdır
    fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), "utf-8");


} catch (error) {
    console.error("❌ Hata oluştu kral:", error.message);
}