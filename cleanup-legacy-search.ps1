$pages = @('index.html','watch.html','movie-detail.html','search.html','danh-sach.html','categories.html','phim-theo-quoc-gia.html','payment.html', 'filter.html', 'hanh-dong.html')
$updated = 0
foreach ($p in $pages) {
    if (-not (Test-Path $p)) { continue }
    $c = Get-Content $p -Raw -Encoding UTF8
    $orig = $c
    $c = $c -replace '(?s)\s*<!-- Mobile Search Bar[^>]*-->\s*<div class="mobile-nav-search[^>]*>.*?</div>', ''
    
    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText((Resolve-Path $p), $c, [System.Text.Encoding]::UTF8)
        Write-Host "[CLEANED] $p" -ForegroundColor Green
        $updated++
    }
}
Write-Host "Done: $updated pages" -ForegroundColor White
