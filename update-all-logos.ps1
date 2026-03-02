# Script to update all logos in HTML files to use favicon.png

$files = @(
    "categories.html",
    "danh-sach.html",
    "filter.html",
    "phim-viet-nam.html",
    "profile.html",
    "pricing.html",
    "payment.html",
    "login.html",
    "register.html",
    "navigation.html",
    "nav-component.html"
)

$oldPattern = @'
                <div
                    class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                    <span class="material-icons-round text-black text-2xl">play_arrow</span>
                </div>
                <span class="text-2xl font-bold tracking-tight">
                    <span class="text-white">A</span> <span class="text-primary">Phim</span>
                </span>
'@

$newPattern = @'
                <div
                    class="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center bg-black/50 group-hover:bg-primary transition-colors duration-300 overflow-hidden">
                    <img src="/favicon.png" alt="A Phim Logo"
                        class="w-6 h-6 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <div class="flex flex-col leading-none">
                    <span class="text-2xl font-bold text-white tracking-wide">A Phim</span>
                    <span class="text-[10px] text-primary uppercase tracking-widest">Cinema</span>
                </div>
'@

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Updating $file..."
        $content = Get-Content $file -Raw
        $content = $content -replace [regex]::Escape($oldPattern), $newPattern
        Set-Content $file $content -NoNewline
        Write-Host "✓ Updated $file"
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! Updated logos in all files." -ForegroundColor Green
