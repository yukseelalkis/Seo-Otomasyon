# ============================================================
# SEO-Otomasyon Proje Yeniden Yapilandirma Scripti
# ============================================================
# Bu script mevcut dosyalari src/backend/ altina tasir
# ve yol referanslarini gunceller.
#
# KULLANIM: PowerShell'de proje ana dizininde calistirin:
#   cd C:\Users\Monster\Desktop\mavikalem\otomasyon\Seo-Otomasyon
#   powershell -ExecutionPolicy Bypass -File restructure.ps1
# ============================================================

$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "=== SEO-Otomasyon Yeniden Yapilandirma ===" -ForegroundColor Cyan
Write-Host ""

# 1. Hedef klasorleri olustur
Write-Host "[1/5] Klasorler olusturuluyor..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "src\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "src\frontend" -Force | Out-Null
Write-Host "  [OK] src\backend ve src\frontend olusturuldu" -ForegroundColor Green

# 2. Mevcut klasorleri src/backend/ altina tasi
Write-Host "[2/5] Dosyalar tasiniyor..." -ForegroundColor Yellow
$folders = @("config", "generators", "helpers", "lib", "scripts")
foreach ($folder in $folders) {
    $source = "src\$folder"
    $dest = "src\backend\$folder"
    if (Test-Path $source) {
        if (Test-Path $dest) {
            Remove-Item -Recurse -Force $dest
        }
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] $source -> $dest" -ForegroundColor Green
    } else {
        Write-Host "  [ATLA] $source bulunamadi (zaten tasinmis olabilir)" -ForegroundColor Yellow
    }
}

# 3. index.js dosyasini tasi (eger zaten backend'de varsa eski olanini sil)
if (Test-Path "src\index.js") {
    if (Test-Path "src\backend\index.js") {
        # Daha once olusturulmus yeni index.js var, eski olanini sil
        Remove-Item "src\index.js" -Force
        Write-Host "  [OK] src\index.js silindi (src\backend\index.js zaten mevcut)" -ForegroundColor Green
    } else {
        Move-Item -Path "src\index.js" -Destination "src\backend\index.js" -Force
        Write-Host "  [OK] src\index.js -> src\backend\index.js" -ForegroundColor Green
    }
}

# 4. Yol duzeltmeleri: scripts/ icindeki __dirname referanslari
#    Eski: path.join(__dirname, "..", "..", "data", ...)   (src/scripts -> root)
#    Yeni: path.join(__dirname, "..", "..", "..", "data", ...) (src/backend/scripts -> root)
Write-Host "[3/5] Yol referanslari duzeltiliyor..." -ForegroundColor Yellow

$scriptFiles = @(
    "src\backend\scripts\analyze-catalog.js",
    "src\backend\scripts\collect-features.js",
    "src\backend\scripts\excel-to-json.js",
    "src\backend\scripts\edding_json_formater.js",
    "src\backend\scripts\normalizeEddingProducts.js"
)

foreach ($file in $scriptFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        # __dirname, "..", "..", "data"  ->  __dirname, "..", "..", "..", "data"
        $updated = $content -replace '(__dirname,\s*"\.\."\s*,\s*"\.\."\s*,\s*"data")', '__dirname, "..", "..", "..", "data"'
        # path.join(__dirname, '../../data  ->  path.join(__dirname, '../../../data
        $updated = $updated -replace "(__dirname,\s*'\.\.\/\.\.\/data)", "__dirname, '../../../data"
        if ($content -ne $updated) {
            Set-Content -Path $file -Value $updated -Encoding UTF8 -NoNewline
            Write-Host "  [OK] $file yollari guncellendi" -ForegroundColor Green
        } else {
            Write-Host "  [--] $file degisiklik gerekmedi" -ForegroundColor Gray
        }
    }
}

# 5. Dogrulama
Write-Host "[4/5] Dogrulama yapiliyor..." -ForegroundColor Yellow
$expectedDirs = @("src\backend\config", "src\backend\generators", "src\backend\lib", "src\backend\scripts", "src\frontend")
$allOk = $true
foreach ($dir in $expectedDirs) {
    if (Test-Path $dir) {
        Write-Host "  [OK] $dir mevcut" -ForegroundColor Green
    } else {
        Write-Host "  [HATA] $dir bulunamadi!" -ForegroundColor Red
        $allOk = $false
    }
}

if (Test-Path "src\backend\index.js") {
    Write-Host "  [OK] src\backend\index.js mevcut" -ForegroundColor Green
} else {
    Write-Host "  [HATA] src\backend\index.js bulunamadi!" -ForegroundColor Red
    $allOk = $false
}

# 6. Temizlik
Write-Host "[5/5] Temizlik ve sonuc..." -ForegroundColor Yellow

# Eski bos klasorleri kontrol et
$oldFolders = @("src\config", "src\generators", "src\helpers", "src\lib", "src\scripts")
foreach ($folder in $oldFolders) {
    if (Test-Path $folder) {
        Write-Host "  [UYARI] $folder hala mevcut - silinmedi" -ForegroundColor Yellow
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "=== BASARILI! Tum dosyalar tasindi. ===" -ForegroundColor Green
} else {
    Write-Host "=== UYARI: Bazi dosyalar eksik. Kontrol edin. ===" -ForegroundColor Red
}

Write-Host ""
Write-Host "Yeni yapi:" -ForegroundColor Cyan
Write-Host "  src/backend/   -> Mevcut kodlar (config, generators, helpers, lib, scripts, index.js)"
Write-Host "  src/frontend/  -> Arayuz dosyalari (index.html, style.css, app.js)"
Write-Host "  src/main.js    -> Electron giris noktasi"
Write-Host "  src/preload.js -> IPC koprusu"
Write-Host ""
