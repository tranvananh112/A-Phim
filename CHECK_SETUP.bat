@echo off
echo ========================================
echo CineStream Setup Checker
echo ========================================
echo.

echo 1. Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js
    pause
    exit /b 1
)
echo [OK] Node.js installed
echo.

echo 2. Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
echo [OK] npm installed
echo.

echo 3. Checking MongoDB...
mongod --version
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB not found or not in PATH
    echo Please install MongoDB from: https://www.mongodb.com/try/download/community
) else (
    echo [OK] MongoDB installed
)
echo.

echo 4. Checking backend dependencies...
cd backend
if not exist node_modules (
    echo [WARNING] Backend dependencies not installed
    echo Installing now...
    npm install
) else (
    echo [OK] Backend dependencies installed
)
cd ..
echo.

echo 5. Checking .env file...
if not exist backend\.env (
    echo [WARNING] .env file not found
    echo Copying from .env.example...
    copy backend\.env.example backend\.env
) else (
    echo [OK] .env file exists
)
echo.

echo ========================================
echo Setup Check Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start MongoDB: mongod
echo 2. Start Backend: cd backend ^&^& npm start
echo 3. Start Frontend: npm start
echo 4. Access Admin: http://localhost:3000/admin/dashboard.html
echo.

pause
