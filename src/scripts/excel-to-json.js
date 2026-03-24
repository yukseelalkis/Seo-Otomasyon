const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFilePath = path.join(__dirname, '..', '..', 'data', 'input', 'faberVersatilKalem.xlsx');
const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'input', 'urunler.json');

try {
  const workbook = xlsx.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  
  // Yaratıcı Çözüm: { header: 1 } parametresi ile veriyi Object yerine Array of Arrays (2D Dizi) olarak alıyoruz.
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

  if (rows.length < 2) {
    throw new Error("Dosya boş veya sadece başlık satırından ibaret.");
  }

  // 1. Satır: Başlıklar. Hepsini küçük harfe çevirip boşlukları siliyoruz.
  const headers = rows[0].map(h => String(h).toLowerCase().replace(/[\s_.-]/g, ''));
  
  // Stok ve Ürün Adı sütunlarının index'ini dinamik olarak bul
  // Stok için 'stockcode' ve 'barcode', ürün adı için 'label' anahtarlarını arama listesine ekledik.
  const stokIndex = headers.findIndex(h => h.includes('stockcode') || h.includes('barcode') || h.includes('stok') || h.includes('kod'));
  const adIndex = headers.findIndex(h => h.includes('label') || h.includes('ürün') || h.includes('urun') || h.includes('ad'));

  if (stokIndex === -1 || adIndex === -1) {
    console.log("Bulunan Ham Başlıklar:", rows[0]);
    throw new Error("Stok veya Ürün eşleştirmesi yapılamadı. Başlıkları kontrol et.");
  }

  const jsonCiktisi = [];

  // 2. Satırdan itibaren (i=1) verileri döngüye al
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const stokKodu = row[stokIndex];
    const urunAdi = row[adIndex];

    if (urunAdi) { // Ürün adı boş değilse diziye ekle
      jsonCiktisi.push({
        StokKodu: stokKodu ? String(stokKodu).trim() : "",
        UrunAdi: String(urunAdi).trim()
      });
    }
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonCiktisi, null, 2), 'utf-8');
  console.log(`Başarılı! Toplam ${jsonCiktisi.length} adet ürün urunler.json dosyasına yazıldı.`);

} catch (error) {
  console.error("Sistem Hatası:", error.message);
}