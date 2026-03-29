# apply-tawk-guard.ps1
$rootDir = "f:\Wesite Xem Phim"
$guardCss = @"
    <style id="aphim-tawk-hide-guard">
        /* A Phim: Decisive Tawk.to Hide Guard - Prevent FOUC on Mobile/Desktop */
        #tawk-widget-layer, [id^="tawk-"], [class^="tawk-"], [class*=" tawk-"], [id*="tawkchat"], iframe[title*="chat widget" i], iframe[src*="tawk.to"], .tawk-min-container, .tawk-button {
            display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important;
            width: 0 !important; height: 0 !important; z-index: -9999 !important; position: fixed !important; left: -9999px !important;
        }
    </style>
"@

$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    if ($file.FullName -match "admin") { continue } # Skip admin for now unless requested
    
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Check if already has guard
    if ($content -match "aphim-tawk-hide-guard") {
        Write-Host "Skipping $($file.Name): Guard already exists" -ForegroundColor Gray
        continue
    }
    
    if ($content -match "<head>") {
        $newContent = $content -replace "<head>", "<head>`r`n$guardCss"
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Updated $($file.Name): Added Tawk Guard" -ForegroundColor Green
    } else {
        Write-Host "Skipping $($file.Name): No <head> tag found" -ForegroundColor Yellow
    }
}
