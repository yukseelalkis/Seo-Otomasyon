---
description: "Faz 0 (ölçüm zemini) ön koşullarını 4 madde üzerinden kontrol eder. Eksik varsa ilgili ISSUES.md issue numarasıyla yönlendirir."
---

# /faz0-status

Faz 0 = ölçüm zemini. Kurulmadan Faz 1'e geçilmez (bkz. `docs/ARCHITECTURE.md` § Yol haritası).

Aşağıdaki 4 kontrolü tek tek yap, sonra tablo + yönlendirme döndür.

## 1. GSC bağlantısı

Kontrol et:
- `.env` veya `.env.example` içinde `GSC_*` değişkenleri tanımlı mı? (örn. `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY` ya da OAuth client kimliği)
- `src/gsc/` klasörü var mı, içinde Search Console API istemcisi var mı?
- `.env`'i okuma; varlığını dolaylı kontrol et:
  ```bash
  grep -l "GSC_" .env.example 2>/dev/null
  ls -d src/gsc 2>/dev/null
  ```

## 2. Treated / Control gruplaması

Kontrol et:
- DB ya da `data/` altında ürünleri `treated`/`control` olarak işaretleyen yapı var mı?
- En az 5 ürün her grupta mı?
- İpucu:
  ```bash
  ls data/groups/ 2>/dev/null
  grep -rEl "treated|control" src/ data/ 2>/dev/null | head -5
  ```

## 3. Baz metrikler

Kontrol et:
- Son 3 ayın gösterim/tıklama/pozisyon verisi yerelde alınmış mı?
- İpucu:
  ```bash
  ls data/gsc/ 2>/dev/null
  find data -name "baseline*.json" -o -name "baseline*.csv" 2>/dev/null
  ```

## 4. schema.org doğrulama

Kontrol et:
- En az 10 örnek ürün için Product/FAQPage schema kontrol raporu var mı?
- İpucu:
  ```bash
  find docs data -name "schema-check*.md" -o -name "schema-check*.json" 2>/dev/null
  ```

## Çıktı formatı

```
## Faz 0 Durumu

| # | Kontrol                  | Durum     | Eksikse ne yap                      |
|---|--------------------------|-----------|-------------------------------------|
| 1 | GSC bağlantısı           | ✅ / ❌    | → ISSUES.md > Issue 1 (GSC + baz)   |
| 2 | Treated / Control        | ✅ / ❌    | → ISSUES.md > Issue 3               |
| 3 | Baz metrikler            | ✅ / ❌    | → ISSUES.md > Issue 1 (aynı kapsam) |
| 4 | schema.org doğrulama     | ✅ / ❌    | → ISSUES.md > Issue 2               |

→ Karar: PASS (Faz 1'e geçebilirsin) | FAIL (önce eksikleri kapat)

Eksikse kısa eylem listesi:
- [Issue 1] → GSC kimlik doğrulaması + son 3 ay verisi
- [Issue 2] → 10 ürün için Rich Results Test
- [Issue 3] → Ürünleri treated/control olarak etiketle
```

## Kurallar

- Sadece okuma yap (Read, Glob, Grep, Bash ile `ls/grep`). Yazma/değişiklik YOK.
- `.env` dosyasını ASLA okuma — `.env.example` ve `src/gsc/` varlığından çıkarım yap.
- 4 kontrolden 4'ü de ✅ olmadan PASS yazma.
- Hiçbiri yoksa: "Faz 0'a daha başlamamışsın gibi görünüyor. `docs/ISSUES.md` > Faz 0 bölümünden başla."
