$pages = @('search.html','danh-sach.html','categories.html','phim-theo-quoc-gia.html','filter.html','hanh-dong.html')
$updated = 0
foreach ($p in $pages) {
    if (-not (Test-Path $p)) { continue }
    $c = Get-Content $p -Raw -Encoding UTF8
    $orig = $c
    
    $c = $c.Replace('bg-black/95 backdrop-blur-md border-b border-white/10', 'bg-transparent backdrop-blur-sm border-b border-white/5')
    
    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText((Resolve-Path $p), $c, [System.Text.Encoding]::UTF8)
        Write-Host "[OK] $p" -ForegroundColor Green
        $updated++
    }
}
Write-Host "Done: $updated pages" -ForegroundColor White
