const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = "c:\\Users\\Monster\\Desktop\\mavikalem\\otomasyon\\Seo-Otomasyon\\data\\input\\Excel\\STANDART-KATALOG-CIKTISI-v3-EXCELkopyasi (3).xlsx";
const jsonOutputPath = "c:\\Users\\Monster\\Desktop\\mavikalem\\otomasyon\\Seo-Otomasyon\\data\\input\\test_kitaplari.json";

function main() {
    console.log(`[1/3] Excel dosyası okunuyor...\nDosya: ${excelPath}`);
    
    if (!fs.existsSync(excelPath)) {
        console.error(`HATA: Excel dosyası bulunamadı! Lütfen dosya yolunu kontrol edin:\n${excelPath}`);
        return;
    }

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    console.log(`[2/3] '${sheetName}' isimli çalışma sayfası JSON'a çevriliyor...`);
    
    // JSON olarak ham veriyi çıkaralım
    const rawData = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    
    if (rawData.length === 0) {
        console.log("Uyarı: Excel sayfası boş görünüyor.");
        return;
    }
    
    // Kullanıcının attığı formata birebir çeviriyoruz
    const formattedData = rawData.map((row) => {
        // Varyantları toplayalım
        const varyantlar = [];
        for (let i = 1; i <= 5; i++) {
            const vName = row[`variantName${i}`];
            const vValue = row[`variantValue${i}`];
            if (vName && vValue) {
                varyantlar.push({ isim: String(vName).trim(), deger: String(vValue).trim() });
            }
        }
        
        return {
            StokKodu: typeof row["stockCode"] !== "undefined" ? String(row["stockCode"]).trim() : "",
            UrunAdi: typeof row["label"] !== "undefined" ? String(row["label"]).trim() : "",
            Marka: typeof row["brand"] !== "undefined" ? String(row["brand"]).trim() : "",
            Kategori: typeof row["category"] !== "undefined" ? String(row["category"]).trim() : "",
            AnaKategori: typeof row["mainCategory"] !== "undefined" ? String(row["mainCategory"]).trim() : "",
            AltKategori: typeof row["subCategory"] !== "undefined" ? String(row["subCategory"]).trim() : "",
            AciklamaHtml: typeof row["details"] !== "undefined" ? String(row["details"]).trim() : "",
            Varyantlar: varyantlar
        };
    });

    fs.writeFileSync(jsonOutputPath, JSON.stringify(formattedData, null, 2), "utf8");
    console.log(`[3/3] Dönüşüm tamamlandı! Toplam ${formattedData.length} ürün işlendi.`);
    console.log(`Çıktı başarıyla şuraya kaydedildi:\n${jsonOutputPath}`);
}

main();
