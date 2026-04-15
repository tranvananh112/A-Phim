# fix-chat-icons.ps1
# Fix Material Icons FOIT + Tawk.to flash tren moi trang co chat widget
# Chay bang: powershell -ExecutionPolicy Bypass -File fix-chat-icons.ps1

param(
    [string]$RootDir = "f:\Wesite Xem Phim"
)

# Cac trang co chat widget A Phim
$pages = @(
    "index.html",
    "movie-detail.html",
    "watch.html",
    "watch-simple.html",
    "watch-direct.html",
    "search.html",
    "categories.html",
    "danh-sach.html",
    "login.html",
    "register.html",
    "profile.html",
    "support.html",
    "filter.html",
    "hanh-dong.html",
    "phim-theo-quoc-gia.html",
    "phim-x.html",
    "phim-x-watch.html",
    "payment.html",
    "pricing.html"
)

# Tag can chen vao dau <head> (sau <meta charset>)
$guardTag = '    <script src="js/chat-init-guard.js"></script>'

# Icon link day du (co ca 3 variant)
$fullIconLink = '    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined|Material+Icons+Round|Material+Icons" rel="stylesheet">'

$stats = @{ Fixed = 0; Skipped = 0; NotFound = 0; Error = 0 }

foreach ($page in $pages) {
    $filePath = Join-Path $RootDir $page

    if (-not (Test-Path $filePath)) {
        Write-Host "  [SKIP] Khong tim thay: $page" -ForegroundColor Yellow
        $stats.NotFound++
        continue
    }

    try {
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        $original = $content
        $changed = $false

        # ── BUOC 1: Them chat-init-guard.js neu chua co ─────────────
        if (-not $content.Contains('chat-init-guard.js')) {
            # Chen vao sau <head>
            if ($content -match '<head[^>]*>') {
                $content = $content -replace '(<head[^>]*>)', "`$1`r`n$guardTag"
                $changed = $true
                Write-Host "  [ADD GUARD] $page" -ForegroundColor Cyan
            }
        }

        # ── BUOC 2: Fix Material Icons link ────────────────────────
        # Kiem tra xem co phai ban day du (chua ca 3) chua
        $hasFullIcons = ($content -match 'Material\+Icons\+Outlined') -and 
                        ($content -match 'Material\+Icons\+Round') -and 
                        ($content -match 'Material\+Icons(?!\+)')

        if (-not $hasFullIcons) {
            # Xoa tat ca cac link Material Icons hien co de thay bang link full
            # Regex nay tim cac the <link> co chua googleapis.com/icon?family=Material
            $iconRegex = '(?s)\s*<link\s+href="https://fonts\.googleapis\.com/icon\?family=Material[^"]*"\s+rel="stylesheet"\s*/?>'
            if ($content -match $iconRegex) {
                $content = [regex]::Replace($content, $iconRegex, "")
                # Them link full vao truoc </head>
                $content = $content -replace '</head>', "$fullIconLink`r`n</head>"
                $changed = $true
                Write-Host "  [FIX ICONS] Updated to full icons: $page" -ForegroundColor Magenta
            } else {
                # Neu k tim thay regex tren (co the do format khac), thu tim kieu co ban hon
                $anyIconSearch = 'fonts.googleapis.com/icon?family=Material'
                if ($content.Contains($anyIconSearch)) {
                     # Truong hop k match regex nhung co chua string
                     Write-Host "  [CHECK] Co icon nhung k match regex: $page" -ForegroundColor Gray
                } else {
                     # Khong co link icon nao -> Them moi
                     $content = $content -replace '</head>', "$fullIconLink`r`n</head>"
                     $changed = $true
                     Write-Host "  [ADD ICONS] New full icons: $page" -ForegroundColor Magenta
                }
            }
        }

        # ── BUOC 3: Fix Tawk.to - dam bao co onLoad=hideWidget ──────
        $hasTawk = $content -match 'embed\.tawk\.to'
        $hasHideWidget = $content -match 'Tawk_API\.onLoad\s*=\s*function.*hideWidget'

        if ($hasTawk -and -not $hasHideWidget) {
            # Xoa script Tawk cu
            $content = [regex]::Replace(
                $content,
                '(?s)<!--\s*Tawk\.to[^>]*-->\s*<script[^>]*>.*?embed\.tawk\.to.*?</script>',
                '',
                [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
            )
            # Them script Tawk moi co onLoad truoc </body>
            $newTawk = @'

    <!-- Tawk.to (Ho tro) - widget mac dinh bi an, mo qua tab Ho tro -->
    <script type="text/javascript">
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        Tawk_API.onLoad = function() { Tawk_API.hideWidget(); };
        (function(){
            var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/69c7d8abf493031c356334cf/1jkqaco0t';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1, s0);
        })();
    </script>
'@
            # Xoa marker cu neu co
            $content = $content -replace '<!-- ====== End Chat Widget ====== -->', ''
            $content = $content -replace '</body>', ($newTawk + "`r`n    <!-- ====== End Chat Widget ====== -->`r`n</body>")
            $changed = $true
            Write-Host "  [FIX TAWK] $page" -ForegroundColor Yellow
        }

        # Luu file
        if ($changed) {
            [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
            $stats.Fixed++
        } else {
            $stats.Skipped++
        }

    } catch {
        Write-Host "  [ERROR] $page : $_" -ForegroundColor Red
        $stats.Error++
    }
}

Write-Host ""
Write-Host "════════════════════════════════════" -ForegroundColor White
Write-Host "  HOAN TAT - A Phim Chat Fix" -ForegroundColor White
Write-Host "════════════════════════════════════" -ForegroundColor White
Write-Host "  Da sua     : $($stats.Fixed) trang" -ForegroundColor Cyan
Write-Host "  Da bo qua  : $($stats.Skipped) trang" -ForegroundColor Green
Write-Host "  Khong thay : $($stats.NotFound) trang" -ForegroundColor Yellow
Write-Host "  Loi        : $($stats.Error) trang" -ForegroundColor Red
Write-Host "════════════════════════════════════" -ForegroundColor White
