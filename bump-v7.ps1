$pages = @('index.html','watch.html','movie-detail.html','search.html','danh-sach.html','categories.html','pricing.html','phim-theo-quoc-gia.html','payment.html')
$bumped = 0
foreach ($p in $pages) {
    if (-not (Test-Path $p)) { continue }
    $c = Get-Content $p -Raw -Encoding UTF8
    if ($c.Contains('mobile-viewport-fix.css?v=6')) {
        $c = $c.Replace('mobile-viewport-fix.css?v=6', 'mobile-viewport-fix.css?v=7')
        [System.IO.File]::WriteAllText((Resolve-Path $p), $c, [System.Text.Encoding]::UTF8)
        Write-Host "[BUMP] $p" -ForegroundColor Green
        $bumped++
    }
}
Write-Host "Bumped: $bumped pages" -ForegroundColor White
