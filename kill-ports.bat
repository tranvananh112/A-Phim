@echo off
echo Killing processes on ports 3000 and 5001...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a on port 3000
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Killing process %%a on port 5001
    taskkill /F /PID %%a 2>nul
)

echo Done!
timeout /t 2
