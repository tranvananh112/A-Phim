$pages = @('index.html','watch.html','movie-detail.html','search.html','danh-sach.html','categories.html','phim-theo-quoc-gia.html','payment.html')

$inlineHtml = "`r`n            <!-- Mobile Inline Search (chi hien tren mobile) -->`r`n            <form action=""search.html"" method=""GET"" class=""mobile-inline-search"">`r`n                <span class=""material-icons-round mobile-inline-search-icon"">search</span>`r`n                <input type=""text"" name=""q"" placeholder=""Tim kiem phim..."" autocomplete=""off"" class=""mobile-inline-search-input"">`r`n            </form>`r`n"

$updated = 0
foreach ($page in $pages) {
    if (-not (Test-Path $page)) { continue }
    $c = Get-Content $page -Raw -Encoding UTF8
    $orig = $c

    # Skip neu da co inline search roi
    if ($c -match 'mobile-inline-search') {
        Write-Host "[EXIST] $page" -ForegroundColor Cyan
        continue
    }

    # 1. Xoa mobile-nav-search row
    $c = $c -replace '(?s)\s*<!-- Mobile Search Bar[^>]*-->\s*<div class="mobile-nav-search[^"]*">\s*<form[^>]*>\s*<span[^>]*>search</span>\s*<input[^>]*>\s*</form>\s*</div>', ''

    # 2. Chen inline search truoc <!-- Right Side (cac bien the indent)
    $patterns = @(
        "`r`n            <!-- Right Side: Search, Login, Mobile Menu -->",
        "`r`n                <!-- Right Side: Search, Login, Mobile Menu -->",
        "`r`n        <!-- Right Side: Search, Login, Mobile Menu -->"
    )
    $inserted = $false
    foreach ($pat in $patterns) {
        if ($c.Contains($pat)) {
            $c = $c.Replace($pat, $inlineHtml + $pat)
            $inserted = $true
            break
        }
    }

    if (-not $inserted) {
        Write-Host "[NOTFOUND] $page" -ForegroundColor Red
        if ($c -ne $orig) { [System.IO.File]::WriteAllText((Resolve-Path $page), $c, [System.Text.Encoding]::UTF8) }
        continue
    }

    [System.IO.File]::WriteAllText((Resolve-Path $page), $c, [System.Text.Encoding]::UTF8)
    Write-Host "[OK] $page" -ForegroundColor Green
    $updated++
}
Write-Host "`nDone: $updated pages" -ForegroundColor White
