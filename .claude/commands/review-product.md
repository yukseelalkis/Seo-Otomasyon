---
description: "Bir ürün açıklamasını (dosya, URL veya yapıştırılmış HTML) kalite kapısından geçirir. urun-aciklama-incelemecisi subagent'ını çağırır, PASS / RETRY / MANUEL raporu döner."
---

# /review-product

Kullanıcı bir ürün açıklamasını verir. Sen içeriği topla, `urun-aciklama-incelemecisi`
subagent'ına yalıtık şekilde gönder, raporu kullanıcıya yansıt.

## Girdi tipleri (üçü de desteklenir)

| Girdi | Nasıl topla |
|-------|-------------|
| **Dosya yolu** (örn. `src/output/products/3083302.html`) | `cat <path>` ile oku |
| **URL** (örn. `https://www.mavikalem.tr/urun/...`) | `WebFetch` ile getir |
| **Yapıştırılmış HTML** | Kullanıcının mesajından doğrudan al |

Eğer kullanıcı sadece "şu ürünü incele" gibi belirsiz bir şey yazmışsa: hangi girdi tipini kastettiğini sor, tahmin etme.

## Akış

1. **Topla:** Yukarıdaki tipe göre ürünün HTML'i + (varsa) JSON-LD schema'sı + meta description'ını topla.
2. **Hazırla:** Topladığın bütünü tek bir blok olarak `urun-aciklama-incelemecisi` subagent'ına gönder. Kendi context'inde değerlendirsin.
3. **Yansıt:** Subagent'ın PASS / RETRY / MANUEL raporunu **olduğu gibi** kullanıcıya göster — sen üzerine yorum ekleme.
4. **Yönlendir:**
   - Rapor **PASS** ise: "Yayına hazır. IdeaSoft API ile geri yazma akışına gönderebilirsin."
   - Rapor **RETRY** ise: "Subagent'ın düzeltme önerilerini uygula, tekrar `/review-product` çalıştır."
   - Rapor **MANUEL** ise: "Kritik bir hata var (örn. yanlış karakter/marka). Açıklamayı sıfırdan üret, otomatik retry yetmez."

## Kullanım örnekleri

```
/review-product src/output/products/3083302.html
/review-product https://www.mavikalem.tr/urun/mopak-5701-parmak-boyasi-evali-6li
/review-product <buraya HTML yapıştır>
```

## Kurallar

- Komut **yalnızca okur** — IdeaSoft'a yazma, dosya değiştirme YOK.
- `urun-aciklama-incelemecisi` subagent'ı tanımlı değilse (henüz yazılmadıysa): kullanıcıyı uyar, "`.claude/agents/urun-aciklama-incelemecisi.md` oluşturulmamış" de.
- URL fetch yaparken yalnızca kullanıcının verdiği domain'e git, başka URL'leri takip etme.
