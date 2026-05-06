$rootDir = "F:\Wesite Xem Phim"

$targetFiles = @(
    "index.html", "login.html", "register.html", "payment.html",
    "pricing.html", "profile.html", "watch.html", "movie-detail.html",
    "search.html", "filter.html", "categories.html", "danh-sach.html",
    "hanh-dong.html", "phim-x.html", "phim-theo-quoc-gia.html",
    "support.html", "partner.html"
)

$scriptTag = '    <script src="js/anti-devtools.js"></script>'
$successCount = 0
$skipCount = 0

foreach ($file in $targetFiles) {
    $filePath = Join-Path $rootDir $file
    if (-not (Test-Path $filePath)) {
        Write-Host "  [SKIP] $file" -ForegroundColor Yellow
        $skipCount++
        continue
    }
    $content = Get-Content $filePath -Raw -Encoding UTF8
    if ($content -match "anti-devtools\.js") {
        Write-Host "  [EXIST] $file" -ForegroundColor Cyan
        $skipCount++
        continue
    }
    $newContent = $content -replace "</head>", "$scriptTag`n</head>"
    Set-Content $filePath -Value $newContent -Encoding UTF8 -NoNewline
    Write-Host "  [ADDED] $file" -ForegroundColor Green
    $successCount++
}

Write-Host ""
Write-Host "Done! Added: $successCount | Skipped: $skipCount" -ForegroundColor Magenta
