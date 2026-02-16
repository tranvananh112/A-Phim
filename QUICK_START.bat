@echo off
title CineStream Quick Start
color 0A

:menu
cls
echo ========================================
echo    CINESTREAM - QUICK START MENU
echo ========================================
echo.
echo 1. Check Setup (Node, MongoDB, Dependencies)
echo 2. Install Dependencies
echo 3. Start All Services (MongoDB + Backend + Frontend)
echo 4. Start Backend Only
echo 5. Start Frontend Only
echo 6. Stop All Services
echo 7. Test API Connection
echo 8. Create Admin User
echo 9. Open Admin Panel
echo 0. Exit
echo.
echo ========================================
set /p choice="Select option (0-9): "

if "%choice%"=="1" goto check
if "%choice%"=="2" goto install
if "%choice%"=="3" goto startall
if "%choice%"=="4" goto backend
if "%choice%"=="5" goto frontend
if "%choice%"=="6" goto stopall
if "%choice%"=="7" goto test
if "%choice%"=="8" goto createadmin
if "%choice%"=="9" goto openadmin
if "%choice%"=="0" goto end
goto menu

:check
cls
echo Checking setup...
call CHECK_SETUP.bat
pause
goto menu

:install
cls
echo Installing dependencies...
echo.
echo [1/2] Installing backend dependencies...
cd backend
call npm install
cd ..
echo.
echo [2/2] Installing frontend dependencies...
call npm install
echo.
echo [OK] All dependencies installed!
pause
goto menu

:startall
cls
echo Starting all services...
call START_ALL.bat
goto menu

:backend
cls
echo Starting backend only...
start "Backend API - Port 5000" cmd /k "cd backend && npm start"
echo Backend starting at http://localhost:5000
pause
goto menu

:frontend
cls
echo Starting frontend only...
start "Frontend - Port 3000" cmd /k "npm start"
echo Frontend starting at http://localhost:3000
pause
goto menu

:stopall
cls
call STOP_ALL.bat
goto menu

:test
cls
echo Opening API test page...
start http://localhost:3000/admin/test-api.html
echo.
echo If page doesn't load, make sure services are running (Option 3)
pause
goto menu

:createadmin
cls
echo Creating admin user...
cd backend
call node scripts/createAdmin.js
cd ..
echo.
echo Admin credentials:
echo Email: admin@cinestream.vn
echo Password: admin123
echo.
pause
goto menu

:openadmin
cls
echo Opening admin panel...
start http://localhost:3000/admin/dashboard.html
echo.
echo If page doesn't load, make sure services are running (Option 3)
pause
goto menu

:end
cls
echo.
echo Thank you for using CineStream!
echo.
timeout /t 2 > nul
exit
