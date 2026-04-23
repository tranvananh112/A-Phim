$pages = @(
    'index.html',
    'watch.html',
    'movie-detail.html',
    'search.html',
    'danh-sach.html',
    'categories.html',
    'pricing.html',
    'profile.html',
    'phim-x.html',
    'phim-theo-quoc-gia.html',
    'partner.html',
    'support.html',
    'payment.html',
    'filter.html',
    'hanh-dong.html',
    'login.html',
    'register.html'
)

$insertHtml = "        <!-- Mobile Search Bar - chi hien tren mobile -->`r`n        <div class=""mobile-nav-search lg:hidden"">`r`n            <form action=""search.html"" method=""GET"">`r`n                <span class=""material-icons-round msb-icon"">search</span>`r`n                <input type=""text"" name=""q"" placeholder=""Tim kiem phim..."" autocomplete=""off"">`r`n            </form>`r`n        </div>`r`n"

$pattern = "        <!-- Mobile Menu -->"
$patternAlt = "    <!-- Mobile Menu -->"

$updated = 0
$skipped = 0
$notFound = 0

foreach ($page in $pages) {
    if (-not (Test-Path $page)) {
        Write-Host "[SKIP] $page - file khong ton tai" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    $content = Get-Content $page -Raw -Encoding UTF8
    
    if ($content -match 'mobile-nav-search') {
        Write-Host "[EXIST] $page - da co mobile-nav-search" -ForegroundColor Cyan
        $skipped++
        continue
    }
    
    if ($content.Contains($pattern)) {
        $content = $content.Replace($pattern, $insertHtml + $pattern)
        [System.IO.File]::WriteAllText((Resolve-Path $page), $content, [System.Text.Encoding]::UTF8)
        Write-Host "[OK] $page" -ForegroundColor Green
        $updated++
    }
    elseif ($content.Contains($patternAlt)) {
        $content = $content.Replace($patternAlt, $insertHtml + $patternAlt)
        [System.IO.File]::WriteAllText((Resolve-Path $page), $content, [System.Text.Encoding]::UTF8)
        Write-Host "[OK-alt] $page" -ForegroundColor Green
        $updated++
    }
    else {
        Write-Host "[NOTFOUND] $page - khong tim thay pattern" -ForegroundColor Red
        $notFound++
    }
}

Write-Host ""
Write-Host "=== KET QUA ===" -ForegroundColor White
Write-Host "Da cap nhat: $updated trang" -ForegroundColor Green
Write-Host "Bo qua: $skipped trang" -ForegroundColor Cyan
Write-Host "Khong tim thay: $notFound trang" -ForegroundColor Red
