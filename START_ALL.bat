@echo off
echo ========================================
echo Starting CineStream - Full Stack
echo ========================================
echo.

echo This will open 3 windows:
echo 1. MongoDB Server
echo 2. Backend API (Port 5000)
echo 3. Frontend Web (Port 3000)
echo.
echo Press any key to continue...
pause > nul

echo.
echo [1/3] Starting MongoDB...
start "MongoDB Server" cmd /k "mongod || echo MongoDB failed to start. Make sure it's installed and configured correctly. && pause"

timeout /t 3 > nul

echo [2/3] Starting Backend API...
start "Backend API - Port 5000" cmd /k "cd backend && npm start"

timeout /t 5 > nul

echo [3/3] Starting Frontend...
start "Frontend - Port 3000" cmd /k "npm start"

timeout /t 3 > nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 > nul

start http://localhost:3000
start http://localhost:3000/admin/test-api.html

echo.
echo Services running:
echo - MongoDB: localhost:27017
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo - Admin: http://localhost:3000/admin/dashboard.html
echo.
echo Press any key to exit (services will keep running)...
pause > nul
