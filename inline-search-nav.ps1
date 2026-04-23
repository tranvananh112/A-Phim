$pages = @('index.html','watch.html','movie-detail.html','search.html','danh-sach.html','categories.html','pricing.html','profile.html','phim-theo-quoc-gia.html','payment.html','filter.html','hanh-dong.html','login.html','register.html')

# HTML moi: inline search form (chi hien tren mobile, nam trong nav flex row)
$inlineHtml = "                <!-- Mobile Inline Search (chi hien tren mobile) -->`r`n                <form action=""search.html"" method=""GET"" class=""mobile-inline-search"">`r`n                    <span class=""material-icons-round mobile-inline-search-icon"">search</span>`r`n                    <input type=""text"" name=""q"" placeholder=""Tim kiem phim..."" autocomplete=""off"" class=""mobile-inline-search-input"">`r`n                </form>"

$updated = 0
foreach ($page in $pages) {
    if (-not (Test-Path $page)) { continue }
    $c = Get-Content $page -Raw -Encoding UTF8
    $orig = $c
    
    # 1. Xoa mobile-nav-search div (row duoi nav)
    $c = $c -replace '(?s)\r?\n\s*<!-- Mobile Search Bar[^>]*-->\r?\n\s*<div class=""mobile-nav-search[^""]*"">\r?\n.*?</div>', ''
    $c = $c -replace "(?s)\r?\n\s*<!-- Mobile Search Bar[^>]*-->\r?\n\s*<div class='mobile-nav-search[^']*'>\r?\n.*?</div>", ''

    # 2. Neu da co mobile-inline-search roi thi bo qua buoc chen
    if ($c -match 'mobile-inline-search') {
        if ($c -ne $orig) {
            [System.IO.File]::WriteAllText((Resolve-Path $page), $c, [System.Text.Encoding]::UTF8)
            Write-Host "[CLEANUP] $page" -ForegroundColor Cyan
            $updated++
        }
        continue
    }
    
    # 3. Chen inline search truoc <!-- Desktop Menu
    $marker1 = "                <!-- Desktop Menu with Modern Pill Container -->"
    $marker2 = "            <!-- Desktop Menu with Modern Pill Container -->"
    $marker3 = "        <!-- Desktop Menu with Modern Pill Container -->"

    if ($c.Contains($marker1)) {
        $c = $c.Replace($marker1, $inlineHtml + "`r`n`r`n" + $marker1)
        Write-Host "[OK] $page (marker1)" -ForegroundColor Green
        $updated++
    } elseif ($c.Contains($marker2)) {
        $c = $c.Replace($marker2, $inlineHtml + "`r`n`r`n" + $marker2)
        Write-Host "[OK] $page (marker2)" -ForegroundColor Green
        $updated++
    } elseif ($c.Contains($marker3)) {
        $c = $c.Replace($marker3, $inlineHtml + "`r`n`r`n" + $marker3)
        Write-Host "[OK] $page (marker3)" -ForegroundColor Green
        $updated++
    } else {
        Write-Host "[NOTFOUND] $page - khong co Desktop Menu marker" -ForegroundColor Red
        if ($c -ne $orig) {
            [System.IO.File]::WriteAllText((Resolve-Path $page), $c, [System.Text.Encoding]::UTF8)
        }
        continue
    }
    
    [System.IO.File]::WriteAllText((Resolve-Path $page), $c, [System.Text.Encoding]::UTF8)
}

Write-Host "`nDone: $updated pages" -ForegroundColor White
