$files = @("index.html", "watch.html", "search.html", "categories.html", "phim-theo-quoc-gia.html", "pricing.html", "danh-sach.html")

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace "Gói cước", "Thể thao"
        $content = $content -replace "Gói Cước", "Thể Thao"
        $content = $content -replace "GÓI CƯỚC", "THỂ THAO"
        Set-Content $file $content -Encoding UTF8
    }
}

$jsFile = "js/mobile-menu-simple.js"
if (Test-Path $jsFile) {
    $content = Get-Content $jsFile -Raw -Encoding UTF8
    $content = $content -replace "Gói cước", "Thể thao"
    $content = $content -replace "💎", "⚽"
    Set-Content $jsFile $content -Encoding UTF8
}
