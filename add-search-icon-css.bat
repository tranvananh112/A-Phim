@echo off
echo Adding search icon CSS to all pages...

REM Add to watch.html
powershell -Command "(Get-Content watch.html) -replace '<link rel=\"stylesheet\" href=\"css/dropdown-blue.css\">', '<link rel=\"stylesheet\" href=\"css/dropdown-blue.css\">`n    <link rel=\"stylesheet\" href=\"css/search-icon-desktop.css\">' | Set-Content watch.html"

REM Add to search.html  
powershell -Command "(Get-Content search.html) -replace '<link rel=\"stylesheet\" href=\"css/dropdown-blue.css\">', '<link rel=\"stylesheet\" href=\"css/dropdown-blue.css\">`n    <link rel=\"stylesheet\" href=\"css/search-icon-desktop.css\">' | Set-Content search.html"

REM Add to profile.html
powershell -Command "(Get-Content profile.html) -replace '<link rel=\"stylesheet\" href=\"css/dropdown-blue.css\">', '<link rel=\"stylesheet\" href=\"css/dropdown-blue.css\">`n    <link rel=\"stylesheet\" href=\"css/search-icon-desktop.css\">' | Set-Content profile.html"

echo Done!
pause
