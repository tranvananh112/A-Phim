@echo off
echo ========================================
echo   CineStream - Starting with MongoDB
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/3] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo MongoDB is not running! Starting MongoDB...
    net start MongoDB
    timeout /t 3 >nul
) else (
    echo MongoDB is already running!
)
echo.

REM Start Backend Server
echo [2/3] Starting Backend Server (MongoDB)...
start "CineStream Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 >nul
echo Backend started at http://localhost:5000
echo.

REM Start Frontend Server
echo [3/3] Starting Frontend Server...
start "CineStream Frontend" cmd /k "npm start"
timeout /t 3 >nul
echo Frontend started at http://localhost:3000
echo.

echo ========================================
echo   All services started successfully!
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend:    http://localhost:3000
echo Admin Panel: http://localhost:3000/admin/login.html
echo.
echo Admin Login:
echo   Email:    admin@cinestream.vn
echo   Password: admin123
echo.
echo Press any key to open browser...
pause >nul

REM Open browser
start http://localhost:3000
start http://localhost:3000/admin/login.html

echo.
echo Services are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
