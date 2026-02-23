@echo off
echo ========================================
echo    KIEM TRA TOKEN VA TRANG
echo ========================================
echo.
echo Mo trang debug...
start http://localhost:3000/DEBUG_TOKEN.html
echo.
echo Trong trang debug:
echo 1. Click "Check Token" - Phai thay token
echo 2. Click "Go to Dashboard" - Vao dashboard
echo 3. Tu dashboard, click menu "Ung ho"
echo 4. Neu bi vang, quay lai DEBUG_TOKEN.html
echo 5. Click "Check Token" lai - Token con khong?
echo.
echo ========================================
pause
