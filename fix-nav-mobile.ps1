$pages = @('index.html','watch.html','movie-detail.html','search.html','danh-sach.html','categories.html','pricing.html','profile.html','phim-theo-quoc-gia.html','payment.html','filter.html','hanh-dong.html','login.html','register.html')

$updated = 0

foreach ($page in $pages) {
    if (-not (Test-Path $page)) { continue }
    $c = Get-Content $page -Raw -Encoding UTF8
    $orig = $c
    
    # 1. Xoa mobile search icon (nhieu bien the indent khac nhau)
    $c = $c -replace '(?s)\s*<!--\s*Mobile Search Icon\s*-->\s*<a href="search\.html"[^>]*class="lg:hidden[^"]*"[^>]*>\s*<span[^>]*>search</span>\s*</a>', ''
    
    # 2. Them ml-auto lg:ml-0 vao right-side div neu chua co
    if ($c -notmatch 'ml-auto lg:ml-0') {
        $c = $c -replace '(class="flex items-center gap-2 lg:gap-4)(")', '$1 ml-auto lg:ml-0$2'
    }
    
    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText((Resolve-Path $page), $c, [System.Text.Encoding]::UTF8)
        Write-Host "[OK] $page" -ForegroundColor Green
        $updated++
    } else {
        Write-Host "[SKIP] $page" -ForegroundColor Gray
    }
}

Write-Host "`nDone: $updated pages updated" -ForegroundColor White
