# add-chat-to-all-pages.ps1
# Trich xuat chat widget tu index.html va them vao cac trang khac

$rootDir = "f:\Wesite Xem Phim"

$mainPages = @(
    "movie-detail.html",
    "watch.html",
    "watch-simple.html",
    "watch-direct.html",
    "search.html",
    "categories.html",
    "danh-sach.html",
    "the-thao.html",
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

# Doc index.html de lay phan chat widget
$indexPath = Join-Path $rootDir "index.html"
$indexContent = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

# Trich xuat phan chat widget (tu comment bat dau den comment ket thuc)
$startMarker = "<!-- ====== Chat Widget A Phim ====== -->"
$endMarker = "<!-- ====== End Chat Widget ====== -->"

$startIdx = $indexContent.IndexOf($startMarker)
$endIdx   = $indexContent.IndexOf($endMarker)

if ($startIdx -lt 0 -or $endIdx -lt 0) {
    Write-Host "KHONG TIM THAY chat widget trong index.html!" -ForegroundColor Red
    exit 1
}

$chatBlock = $indexContent.Substring($startIdx, $endIdx - $startIdx + $endMarker.Length)
Write-Host "Da trich xuat chat widget ($($chatBlock.Length) ky tu)" -ForegroundColor Green

# CSS link
$cssLink = '    <link rel="stylesheet" href="css/chat-room.css">'

$added   = 0
$skipped = 0
$notFound = 0

foreach ($page in $mainPages) {
    $filePath = Join-Path $rootDir $page

    if (-not (Test-Path $filePath)) {
        Write-Host "  khong tim thay: $page" -ForegroundColor Yellow
        $notFound++
        continue
    }

    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    # Kiem tra da co chua
    if ($content.Contains("chatFab") -or $content.Contains("chatWindow")) {
        Write-Host "  da co (bo qua): $page" -ForegroundColor DarkGreen
        $skipped++
        continue
    }

    # Them CSS vao truoc </head>
    if ($content.Contains("</head>")) {
        $content = $content.Replace("</head>", $cssLink + "`r`n</head>")
    }

    # Them chat widget truoc </body>
    if ($content.Contains("</body>")) {
        $content = $content.Replace("</body>", $chatBlock + "`r`n</body>")
    }

    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  da them chat: $page" -ForegroundColor Cyan
    $added++
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor White
Write-Host "Da them: $added trang" -ForegroundColor Cyan
Write-Host "Bo qua (da co): $skipped trang" -ForegroundColor Green
Write-Host "Khong tim thay: $notFound trang" -ForegroundColor Yellow
