@echo off
echo 🚀 AI Builders Discussion Thread Creator
echo.
echo Choose your preferred method:
echo 1. Node.js Script (Recommended for Windows)
echo 2. Bash Script (Requires Git Bash or WSL)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Running Node.js script...
    node create-aibuilders-discussions.js
) else if "%choice%"=="2" (
    echo.
    echo Running Bash script...
    bash create-aibuilders-discussions.sh
) else (
    echo Invalid choice. Please run the script again and choose 1 or 2.
)

echo.
pause