---
applies_to: ["src/**"]
---

# API ve Dış Çağrı Kuralları

> `src/**` altında çalışırken devreye girer. Kurallar self-scope: dış API çağrısı
> yapmayan dosyalar için doğal olarak no-op olur, sadece geçerli olduğu yerde uygulanır.

## 1. Token / kimlik bilgisi güvenliği

- **Hiçbir token, API key veya secret koda gömülmez.** Yalnızca `process.env.X` üzerinden.
- Test mock'larında bile sabit yazma — fake değer kullan (`"test-token"`).
- Token'ı **URL'de** değil **Authorization header**'da gönder.
- `console.log(token)`, `console.log(headers)`, `console.log(process.env.X)` YAPMA — log sızıntısı.
- Hata mesajlarını dışarı dönerken (API response, log) token'ı maskele (`****`).

## 2. Hız sınırlama (rate limit)

- Yığın çağrı varsa **`p-limit` ile sınırlı paralel**. `Promise.all([fetch, fetch, ...])` doğrudan yazılmaz.
  ```ts
  import pLimit from "p-limit";
  const limit = pLimit(3);
  const results = await Promise.all(urls.map((u) => limit(() => fetch(u))));
  ```
- IdeaSoft yazma çağrılarında `pLimit(3)` makul başlangıç. Düşür, hiç artırma.
- GSC için Google API'nin günlük/dakikalık kotasına uy (quota error → sleep).

## 3. Retry + exponential backoff

- Geçici hata (5xx, 429, network) → en fazla **3 deneme**, exponential backoff + jitter.
- 4xx (401, 403, 404, 422) → retry **etme**, anlam yok; loglat ve dur.
- 4. denemede de başarısızsa hata fırlat, sessiz geçme.
  ```ts
  for (let i = 0; i < 3; i++) {
    try { return await call(); }
    catch (e) {
      if (!isRetryable(e)) throw e;
      await sleep(2 ** i * 200 + Math.random() * 100);
    }
  }
  throw new Error("retries exhausted");
  ```

## 4. `Retry-After` zorunlu

- HTTP cevabında `Retry-After` header'ı varsa **mutlaka uy**. Görmezden gelme.
- Saniye değeri verilmişse ona kadar bekle; HTTP tarihi verilmişse o tarihe kadar bekle.

## 5. Runtime şema doğrulama

- Dış API cevabının yapısına TypeScript tipiyle güvenmek **yetmez** — API sessizce değişebilir.
- Cevabı `zod` (veya benzeri) ile runtime parse et:
  ```ts
  const ProductResp = z.object({ id: z.number(), description: z.string() });
  const data = ProductResp.parse(await res.json());
  ```
- Parse hatası = sessiz değil, sert düşmeli. Telemetriye yaz.

## 6. Test edilebilirlik

- API istemcisi mümkün olduğunca pure: input (URL, body) → output (parsed response).
- Yan etkileri (DB yazma, log, dosya) çağıran tarafa bırak. Mock'lamak kolay olsun.

## 7. YAPMA

- TLS bypass YOK: `httpsAgent: new https.Agent({ rejectUnauthorized: false })` yasak.
- 5xx hatayı "deneyince yine olur" diye sessiz yutma — telemetriye yaz.
- Üretim ortamından canlı API'ye karşı test KOŞMA. Önce staging/sandbox.
- Hassas alanı (token, e-posta, GSM) `console.log` veya hata mesajına KOYMA.
