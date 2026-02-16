@echo off
echo ========================================
echo Stopping CineStream Services
echo ========================================
echo.

echo Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js processes stopped
) else (
    echo [INFO] No Node.js processes found
)

echo.
echo Stopping MongoDB...
taskkill /F /IM mongod.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB stopped
) else (
    echo [INFO] MongoDB not running or managed as service
)

echo.
echo ========================================
echo All services stopped!
echo ========================================
echo.
pause
