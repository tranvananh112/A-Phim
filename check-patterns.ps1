$pages = @('phim-x.html', 'partner.html', 'support.html', 'filter.html', 'hanh-dong.html', 'login.html', 'register.html')
foreach ($p in $pages) {
    if (Test-Path $p) {
        $c = Get-Content $p -Raw -Encoding UTF8
        $match = [regex]::Match($c, '(?m)(.{0,40}[Mm]obile.{0,40}[Mm]enu.{0,40})')
        if ($match.Success) {
            Write-Host "[$p] FOUND: " + $match.Value.Substring(0, [Math]::Min(80, $match.Value.Length)).Trim()
        } else {
            Write-Host "[$p] NO MOBILE MENU COMMENT - checking mobileMenu div..."
            $match2 = [regex]::Match($c, '(?m)(id="mobileMenu".{0,60})')
            if ($match2.Success) {
                Write-Host "   mobileMenu div: " + $match2.Value.Trim()
            } else {
                Write-Host "   No mobileMenu div either"
            }
        }
    } else {
        Write-Host "[$p] FILE NOT FOUND"
    }
}
