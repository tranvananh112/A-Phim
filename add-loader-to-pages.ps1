# List of pages to add loader (excluding index.html)
$pages = @(
    'watch.html',
    'categories.html',
    'phim-theo-quoc-gia.html',
    'danh-sach.html',
    'movie-detail.html',
    'profile.html',
    'pricing.html',
    'register.html',
    'phim-x.html'
)

Write-Host "Pages to update: $($pages.Count)"
$pages | ForEach-Object { Write-Host "  - $_" }
