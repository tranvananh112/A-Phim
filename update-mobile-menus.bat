@echo off
echo Updating mobile menus in all HTML files...
echo.
echo Files to update:
echo - danh-sach.html
echo - phim-viet-nam.html  
echo - movie-detail.html
echo - search.html
echo - pricing.html
echo - profile.html
echo - watch.html
echo - support.html
echo.
echo Please add this script tag before closing body tag in each file:
echo ^<script src="js/mobile-menu-simple.js"^>^</script^>
echo.
echo And replace mobile menu content with:
echo ^<!-- Content will be injected by mobile-menu-simple.js --^>
echo.
pause
