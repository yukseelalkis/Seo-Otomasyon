# CLAUDE.local.md — Kişisel Override

> Bu dosya `.gitignore`'da. Sadece **senin** makinendeki Claude Code oturumu için
> ek talimatlar. Ekip kuralları `CLAUDE.md`'ye, kişisel tercihlerin buraya.
>
> Bu dosya git'e gitmez — istediğini yaz, kimse görmez.

## Test mağazası

- Üretim mağazam: <https://www.mavikalem.tr>
- IdeaSoft panel: <https://panel.mavikalem.tr> (girdi alanlarında üretip test ediyorum)
- Önce kategori: **Kırtasiye / Anaokul** (en stabil veri burada)

## Model tercihi

- Toplu üretim için: `claude-sonnet-4-6` veya `claude-haiku-4-5` (hız + maliyet)
- Zor kategoriler için: `claude-opus-4-7` (Kuromi-tipi karakter karışıklığı olan IP'li ürünler)
- Karar: Faz 1'de sadece Sonnet kullan, Opus'a Faz 2'de geç.

## Kimlik / git

- GitHub: `yukseelalkis`
- Commit imza adı: `Yüksel Alkış`
- Branch konvansiyonu: `faz-<n>/<konu>` → `faz-0/gsc-baglanti`, `faz-1/ideasoft-write`

## Çalışma tercihleri

- Dil: Türkçe (terse.md zaten zorluyor).
- Yorum stili: niye, neyi değil. Kodun ne yaptığı diff'ten görünüyor.
- Yeni dosya açmadan önce mevcut dosyada yer var mı kontrol et — gereksiz parçalama yok.

## Uyarılar

- Üretim mağazasında otomatik yazma denemesi YAPMA. Önce dry-run, sonra elle 5 ürün, sonra hat.
- `data/` altında `.csv` yedeği almadan toplu işlem başlatma.

## Hatırlatma

Cursor `.cursor/plans/` altında eski planlar var — yenisini açarken eski plan dosyalarını referans olarak oku, ama uygulama planını `CLAUDE.md` ve `.claude/`'den al.
