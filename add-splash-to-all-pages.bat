@echo off
echo ========================================
echo Adding Splash Loader to All HTML Pages
echo ========================================
echo.

REM List of main HTML pages to add splash loader
set pages=movie-detail.html watch.html search.html danh-sach.html phim-viet-nam.html categories.html filter.html pricing.html support.html profile.html login.html register.html payment.html

echo Adding splash loader to main pages...
echo.

for %%f in (%pages%) do (
    if exist %%f (
        echo Processing: %%f
        REM The actual addition will be done manually or with a more sophisticated script
        REM For now, just list the files
    ) else (
        echo File not found: %%f
    )
)

echo.
echo ========================================
echo Done! Please manually add these lines to each page's ^<head^> section:
echo.
echo ^<link rel="stylesheet" href="css/splash-loader.css"^>
echo ^<script src="js/splash-loader.js"^>^</script^>
echo.
echo Place them right after the ^<title^> tag for best results.
echo ========================================
pause
