---
description: "Staged değişikliği okur, Türkçe Conventional Commits mesajı önerir. Commit'i SEN atmazsın — kullanıcı onaylayıp çalıştırır."
---

# /commit

`git status` ve `git diff --staged` çıktısını oku. Aşağıdaki kurallara göre commit
mesajı **öner**. Sen commit atmazsın, push etmezsin — sadece öneriyi sunarsın.

## Mesaj formatı (Conventional Commits)

```
<tip>(<kapsam>): <konu, küçük harf, ≤50 karakter, imperative>

<gövde — neden bu değişikliği yaptın. 72 karakter sarmalı. Opsiyonel.>

<varsa: Refs #issue-no>
```

## Tipler

| Tip | Ne zaman |
|-----|----------|
| `feat` | Yeni özellik |
| `fix` | Bug düzeltme |
| `refactor` | Davranış değişmeden kod yeniden düzenleme |
| `perf` | Performans iyileştirme |
| `docs` | Sadece dokümantasyon |
| `test` | Sadece test |
| `chore` | Build, config, bağımlılık güncellemesi |
| `style` | Format, noktalama (kod davranışını etkilemez) |

## Kapsam örnekleri (proje-spesifik)

`ideasoft` · `gsc` · `generate` · `qc` · `schema` · `panel` · `db` · `pipeline` · `claude`

## Dil ve üslup

- **Türkçe** yaz.
- Konu satırı imperative (emir kipi) olsun: "ekle", "düzelt", "kaldır", "güncelle".
- Boş laf yok: "küçük değişiklikler", "iyileştirmeler" gibi cümleler yazma — somut ol.
- Gövdede **NE** değil **NEDEN** anlatılır (diff zaten NE'yi gösteriyor).

## Kurallar (YAPMA)

- `git commit` komutunu **SEN ÇALIŞTIRMA**. Sadece komutu öneri olarak yaz.
- `--no-verify`, `--amend`, `--force` öneri verme.
- `.env`, secret veya anahtar staged'da varsa: önce dur, kullanıcıyı uyar, commit önerme.
- Staged'da birbirinden bağımsız değişiklikler varsa: "bu commit'i ikiye böl, şöyle dağıt" diye öner.

## Çıktı formatı

```
Önerilen commit mesajı:
─────────────────────────────
<tip>(<kapsam>): <konu>

<gövde varsa>
─────────────────────────────

Çalıştırmak için (sen onayla):
git commit -m "<konu>" -m "<gövde>"
```

Eğer hiçbir şey staged değilse:
```
Staged değişiklik yok. Önce dosyaları ekle:
git add <dosya>
```