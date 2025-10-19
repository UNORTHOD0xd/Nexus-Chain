@echo off
REM ============================================================================
REM NexusChain Frontend - Windows Installation Script (Improved)
REM ============================================================================
REM This script installs all frontend dependencies for the NexusChain project
REM Author: UNORTHOD0xd
REM ============================================================================
echo.
echo ============================================================================
echo   NexusChain Frontend - Windows Installation Script
echo ============================================================================
echo.

REM =========================
REM Step 1: Check Node.js
REM =========================
echo [1/5] Checking Node.js installation...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in your PATH!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: Node.js 18.x or higher
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node --version') do set NODE_VERSION=%%v
echo [OK] Node.js is installed - Version %NODE_VERSION%
echo.

REM =========================
REM Step 2: Check npm
REM =========================
echo [2/5] Checking npm installation...

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not found in your PATH!
    echo.
    echo npm should come with Node.js. Please make sure Node.js is installed and added to your PATH.
    echo Verify by running: npm --version
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('npm --version') do set NP_VERSION=%%v
echo [OK] npm is installed - Version %NP_VERSION%
echo.

REM =========================
REM Step 3: Check environment
REM =========================
echo [3/5] Checking environment configuration...
if not exist .env.local (
    if exist .env.local.example (
        echo [SETUP] Creating .env.local from template...
        copy .env.local.example .env.local >nul
        echo [OK] .env.local created. Please update with your configuration.
        echo.
        echo IMPORTANT: Edit .env.local and add:
        echo   - Backend API URL
        echo   - Contract addresses (after deployment)
        echo.
    ) else (
        echo [WARNING] .env.local.example not found!
        echo You'll need to create .env.local manually.
        echo.
    )
) else (
    echo [OK] .env.local already exists
    echo.
)

REM =========================
REM Step 4: Clean install
REM =========================
if exist node_modules (
    echo [CLEANUP] Removing existing node_modules...
    rmdir /s /q node_modules
    echo [OK] Cleanup complete
    echo.
)

if exist package-lock.json (
    echo [CLEANUP] Removing existing package-lock.json...
    del package-lock.json
    echo [OK] Cleanup complete
    echo.
)

REM =========================
REM Step 5: Install dependencies
REM =========================
echo [4/5] Installing frontend dependencies...
echo This may take several minutes. Please wait...
echo.

REM Use verbose to show progress
npm install --verbose
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo.
    echo Troubleshooting steps:
    echo 1. Make sure you have a stable internet connection
    echo 2. Try running: npm cache clean --force
    echo 3. Delete node_modules and package-lock.json, then run this script again
    echo 4. Check if you're behind a corporate proxy
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] All dependencies installed successfully!
echo.

REM =========================
REM Step 6: Verify installation
REM =========================
echo [5/5] Verifying installation...

if exist node_modules (
    echo [OK] node_modules directory created
) else (
    echo [ERROR] node_modules directory not found!
    pause
    exit /b 1
)

if exist node_modules\next (
    echo [OK] Next.js installed
) else (
    echo [ERROR] Next.js not found in node_modules!
    pause
    exit /b 1
)

if exist node_modules\react (
    echo [OK] React installed
) else (
    echo [ERROR] React not found in node_modules!
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo   Installation Complete!
echo ============================================================================
echo.
echo Next steps:
echo   1. Edit .env.local with your configuration:
echo      - NEXT_PUBLIC_API_URL=http://localhost:3000
echo      - NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
echo      - Add contract addresses after blockchain deployment
echo.
echo   2. Start the development server:
echo      npm run dev
echo.
echo   3. Open your browser to:
echo      http://localhost:3001
echo.
echo Documentation: See README.md and claude.md for more details
echo ============================================================================
echo.
pause
