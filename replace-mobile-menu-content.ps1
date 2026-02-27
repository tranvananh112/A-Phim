# Replace mobile menu content in all files

$files = @(
    "movie-detail.html",
    "search.html", 
    "pricing.html",
    "profile.html",
    "watch.html",
    "support.html",
    "phim-viet-nam.html"
)

$newContent = '            <!-- Content will be injected by mobile-menu-simple.js -->'

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        
        $lines = Get-Content $file -Encoding UTF8
        $output = @()
        $inMobileMenu = $false
        $menuStartLine = -1
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            
            # Detect mobile menu start
            if ($line -match 'id="mobileMenu"') {
                $inMobileMenu = $true
                $menuStartLine = $i
                $output += $line
                $output += $newContent
                continue
            }
            
            # Skip content until we find the closing div of mobile menu
            if ($inMobileMenu) {
                # Check if this is the closing </div> for mobile menu container
                if ($line -match '^\s*</div>\s*$' -and $menuStartLine -ge 0) {
                    # Check if next line is </nav> or another closing tag
                    if ($i + 1 -lt $lines.Count -and $lines[$i + 1] -match '</nav>') {
                        $output += $line
                        $inMobileMenu = $false
                        continue
                    }
                }
                continue
            }
            
            $output += $line
        }
        
        $output | Set-Content $file -Encoding UTF8
        Write-Host "  OK Updated $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
