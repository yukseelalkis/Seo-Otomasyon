/**
 * Kitap şablonları için ortak yardımcı fonksiyonlar
 */

function pickVariation(pool, seed) {
  if (!pool || pool.length === 0) return '';
  if (!seed) return pool[0];
  let hash = 0;
  const seedStr = String(seed);
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length];
}

function pickVariationOffset(pool, seed, offset) {
  if (!pool || pool.length === 0) return '';
  if (!seed) return pool[offset % pool.length];
  let hash = 0;
  const seedStr = String(seed) + '_' + String(offset);
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length];
}

/**
 * Sitede kusursuz çalıştığı kanıtlanmış HTML yapısıyla tablo oluşturur.
 * rows: [{ key: "Yazar", value: "Ali Veli" }, ...]
 *
 * HTML attribute'lerinde TEK TIRNAK kullanılır — template literal içinde
 * çift tırnak çakışmasını önler.
 */
function buildStyledTable(rows) {
  const filteredRows = rows.filter(
    (r) => r.value && r.value !== "Belirtilmemiş" && String(r.value).trim() !== ""
  );
  if (filteredRows.length === 0) return "";

  const body = filteredRows
    .map((row, i) => {
      // HTML attribute'leri için TEK TIRNAK kullanıyoruz
      const thStyle = i === 0
        ? "width: 30%; background-color: #f9f9f9;"
        : "background-color: #f9f9f9;";
      return `<tr style='border-bottom: 1px solid #eaeaea;'><th style='${thStyle}'>${row.key}</th><td>${row.value}</td></tr>`;
    })
    .join("");

  return `<table style='width: 100%; border-collapse: collapse; border: 1px solid #eaeaea; text-align: left;' cellpadding='8'><tbody>${body}</tbody></table>`;
}

/**
 * SSS bloğu oluşturur.
 */
function buildFaqBlock(faqs) {
  if (!faqs || faqs.length === 0) return '';

  var html = '<h3>Sıkça Sorulan Sorular</h3>';
  faqs.forEach(function (faq) {
    html += '<p><strong>' + faq.question + '</strong><br />' + faq.answer + '</p>';
  });
  return html;
}

/**
 * MaviKalem güvencesi ile kapanış CTA paragrafı.
 */
function buildClosingParagraph(title, ctaVariation) {
  var closingPool = [
    '<p>Hemen kütüphanenize eklemek için <strong>' + title + '</strong> ürününe MaviKalem güvencesiyle, %100 orijinal ürün garantisi ve hızlı kargo avantajıyla sahip olabilirsiniz.</p>',
    '<p><strong>' + title + '</strong> kitabını MaviKalem güvencesi, orijinal ürün garantisi ve aynı gün kargo avantajıyla hemen sipariş edebilirsiniz.</p>',
    '<p>Başarıya giden yolda bir adım öne geçmek için <strong>' + title + '</strong> ürününe %100 orijinal ürün garantisi ve MaviKalem güvencesiyle hemen sahip olabilirsiniz.</p>',
    '<p><strong>' + title + '</strong> ile hedeflerinize bir adım daha yaklaşabilirsiniz; MaviKalem güvencesi ve hızlı kargo avantajıyla hemen sipariş verin.</p>',
    '<p>Kaliteli ve güvenilir bir kaynak arayanlar için <strong>' + title + '</strong>, MaviKalem güvencesi ve %100 orijinal ürün garantisiyle sizleri bekliyor.</p>'
  ];
  return pickVariation(closingPool, ctaVariation || title);
}

function getAuthor(facts) {
  return facts.yazar || '';
}

function getPublisher(facts) {
  return facts.yayinevi || facts.brand || '';
}

module.exports = {
  pickVariation,
  pickVariationOffset,
  buildStyledTable,
  buildFaqBlock,
  buildClosingParagraph,
  getAuthor,
  getPublisher
};