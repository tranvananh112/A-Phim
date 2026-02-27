# Update all HTML files with simple mobile menu

$files = @(
    "movie-detail.html",
    "search.html", 
    "pricing.html",
    "profile.html",
    "watch.html",
    "support.html",
    "phim-viet-nam.html"
)

$scriptTag = '<script src="js/mobile-menu-simple.js"></script>'

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Add mobile-menu-simple.js script if not exists
        if ($content -notmatch 'mobile-menu-simple') {
            $content = $content -replace '</body>', "    $scriptTag`r`n</body>"
            Write-Host "  - Added mobile-menu-simple.js script" -ForegroundColor Green
            Set-Content $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  OK Updated $file" -ForegroundColor Cyan
        } else {
            Write-Host "  - Already has mobile-menu-simple.js" -ForegroundColor Gray
        }
    } else {
        Write-Host "  X File not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
