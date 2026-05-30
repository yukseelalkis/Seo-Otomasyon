---
applies_to: ["src/**"]
---

# Veritabanı Kuralları

> `src/**` altında çalışırken devreye girer. Kurallar self-scope: DB'ye dokunmayan
> dosyalar için doğal olarak no-op olur. Aşağıdaki yasaklar `.claude/settings.json`
> deny + `block-dangerous-bash.sh` ile bash seviyesinde de zorlanır.

## 1. Yıkıcı işlemler yasak

| Yasak | Yerine |
|-------|--------|
| `DROP DATABASE/TABLE/SCHEMA` | Migration ile şema değiştir |
| `TRUNCATE <tablo>` | Yapma. Veri silmek gerekiyorsa soft delete |
| `DELETE FROM <tablo>` (WHERE'siz) | Yapma. WHERE her zaman zorunlu |
| `supabase db reset` | Yapma. Üretim verisi kaybolur |
| Doğrudan üretim DB'sine bağlanıp deneme | Önce staging |

## 2. Soft delete

- Veri silmek için `is_deleted boolean` veya `deleted_at timestamp` kolonu kullan.
- Listeleme sorgularında `WHERE is_deleted = false` (veya `WHERE deleted_at IS NULL`) **zorunlu**.
- Fiziksel silme yalnızca KVKK/GDPR talebi gibi yasal sebeplerle, ayrı bir admin script üzerinden.

## 3. Migration tek yönlü ileri

- Yeni migration yaz; "geri al" mevcut olsa bile **kullanma**.
- Bozukluk varsa: yeni bir migration ile düzelt (örn. `005_revert_004.sql`).
- Migration adlandırma: `<sıra>_<özet>.sql` → `001_init.sql`, `002_add_keyword_table.sql`.
- Migration dosyası bir kez commit'lendiyse **değiştirilmez**. Üzerine yeni migration yaz.

## 4. SQL yazımı

- Ham string concat **YOK**:
  ```ts
  // ❌ Yasak — SQL injection
  db.exec(`SELECT * FROM products WHERE id = ${userId}`);

  // ✅ Prepared statement / parametre bağlama
  db.prepare("SELECT * FROM products WHERE id = ?").get(userId);
  ```
- Migrations **dışında** `CREATE TABLE` çağırma. Runtime kod tablo açmaz.
- Toplu insert için transaction kullan; tek tek insert yapıp DB'yi yorma.

## 5. Hassas alan şifreleme

Hassas tutulanlar **plain text yasak**:

| Alan | Saklama |
|------|---------|
| API token, refresh token | Şifreli (örn. `node:crypto` AES-256-GCM, anahtar `process.env`'de) |
| Kullanıcı e-postası | Hash (gerekirse lookup için ayrı `email_hash` kolonu) veya şifreli |
| GSM numarası | Şifreli |
| Şifre | **Asla**. Bcrypt/argon2 hash |
| Kredi kartı | Asla saklama. PCI uyumlu servise devret |

- Şifreleme/hash anahtarı `process.env`'de — koda gömme.
- `bcrypt` veya `argon2` kullan; SHA256 şifre için yetmez.

## 6. Migration ve şema dokümanı

- Ana veri modeli `docs/ARCHITECTURE.md` § "Veri modeli" bölümündedir.
- Yeni tablo/kolon eklemeden **önce** o dosyayı güncelle, sonra migration yaz.
- Şema değiştiğinde `docs/ARCHITECTURE.md` ile migration tutarlı olmalı.

## 7. YAPMA

- DB'ye yazan kodu test yazmadan commit'leme.
- Production DB'sine üretim ortamı dışından erişip yazma.
- `console.log(row)` ile bir bütün satırı log'a basma — hassas alan sızabilir.
- ORM/query builder'da `raw()` kaçırma — `?` ile parametrik kullan.
