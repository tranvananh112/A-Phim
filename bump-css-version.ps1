$pages = @(
    'index.html',
    'watch.html',
    'movie-detail.html',
    'search.html',
    'danh-sach.html',
    'categories.html',
    'pricing.html',
    'profile.html',
    'phim-theo-quoc-gia.html',
    'payment.html',
    'filter.html',
    'hanh-dong.html',
    'login.html',
    'register.html'
)

# Bump css version from v5 to v6 for mobile-viewport-fix.css
$oldRef = 'mobile-viewport-fix.css?v=5'
$newRef = 'mobile-viewport-fix.css?v=6'

$bumped = 0
foreach ($page in $pages) {
    if (-not (Test-Path $page)) { continue }
    $content = Get-Content $page -Raw -Encoding UTF8
    if ($content.Contains($oldRef)) {
        $content = $content.Replace($oldRef, $newRef)
        [System.IO.File]::WriteAllText((Resolve-Path $page), $content, [System.Text.Encoding]::UTF8)
        Write-Host "[BUMP] $page" -ForegroundColor Green
        $bumped++
    } else {
        Write-Host "[SKIP] $page (no v5 ref)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Bumped CSS version: $bumped pages" -ForegroundColor White
