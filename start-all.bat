@echo off
echo ========================================
echo   Starting CineStream Website
echo ========================================
echo.

echo [1/2] Starting Frontend Server...
start "CineStream Frontend" cmd /k "npm start"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Proxy Server...
start "CineStream Proxy" cmd /k "cd backend && node simple-proxy.js"
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo   All servers started!
echo ========================================
echo.
echo   Frontend: http://localhost:3000
echo   Proxy:    http://localhost:5001
echo.
echo   Press any key to open browser...
pause > nul

start http://localhost:3000

echo.
echo   Servers are running in separate windows.
echo   Close those windows to stop the servers.
echo.
pause
