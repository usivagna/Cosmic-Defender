@echo off
echo Starting Cosmic Defender Game Server...
echo.
echo The game will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"

REM Try Node.js first
where node >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Using Node.js http-server...
    npx http-server -p 8000 --cors -o
    goto :end
)

REM Try Python if Node.js fails
where python >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Using Python http.server...
    python -m http.server 8000
    goto :end
)

REM Try PHP if both fail
where php >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Using PHP built-in server...
    php -S localhost:8000
    goto :end
)

REM If none available, show instructions
echo ERROR: No web server found!
echo.
echo Please install one of the following:
echo 1. Node.js (recommended): https://nodejs.org/
echo 2. Python: https://python.org/
echo 3. PHP: https://php.net/
echo.
echo Or double-click on index.html to open directly in browser
echo (Note: Some features may not work due to CORS restrictions)
echo.

:end
pause
