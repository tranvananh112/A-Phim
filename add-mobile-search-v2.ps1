$pages = @('phim-x.html', 'support.html', 'filter.html', 'hanh-dong.html', 'login.html', 'register.html')

$insertHtml = "        <!-- Mobile Search Bar - chi hien tren mobile -->`r`n        <div class=""mobile-nav-search lg:hidden"">`r`n            <form action=""search.html"" method=""GET"">`r`n                <span class=""material-icons-round msb-icon"">search</span>`r`n                <input type=""text"" name=""q"" placeholder=""Tim kiem phim..."" autocomplete=""off"">`r`n            </form>`r`n        </div>`r`n"

$patterns = @(
    '        <!-- Mobile menu content -->',
    '    <!-- Mobile Menu -->',
    '        <!-- mobile menu -->',
    '    <!-- mobile menu -->',
    '<div id="mobileMenu"',
    '    <div id="mobileMenu"',
    '        <div id="mobileMenu"'
)

$updated = 0
$notFound = 0

foreach ($page in $pages) {
    if (-not (Test-Path $page)) {
        Write-Host "[SKIP] $page" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $page -Raw -Encoding UTF8
    
    if ($content -match 'mobile-nav-search') {
        Write-Host "[EXIST] $page" -ForegroundColor Cyan
        continue
    }
    
    $found = $false
    foreach ($pat in $patterns) {
        if ($content.Contains($pat)) {
            $content = $content.Replace($pat, $insertHtml + $pat)
            [System.IO.File]::WriteAllText((Resolve-Path $page), $content, [System.Text.Encoding]::UTF8)
            Write-Host "[OK] $page (pattern: '$pat')" -ForegroundColor Green
            $updated++
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        # Try inserting before </nav>
        $navClose = '</nav>'
        if ($content.Contains($navClose)) {
            # Find last occurrence of </nav>
            $idx = $content.LastIndexOf($navClose)
            $content = $content.Substring(0, $idx) + $insertHtml + $content.Substring($idx)
            [System.IO.File]::WriteAllText((Resolve-Path $page), $content, [System.Text.Encoding]::UTF8)
            Write-Host "[OK-nav] $page (before </nav>)" -ForegroundColor Yellow
            $updated++
        } else {
            Write-Host "[NOTFOUND] $page" -ForegroundColor Red
            $notFound++
        }
    }
}

Write-Host ""
Write-Host "Updated: $updated | Not found: $notFound" -ForegroundColor White
