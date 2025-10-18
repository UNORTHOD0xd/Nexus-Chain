@echo off
REM ============================================================================
REM NexusChain Frontend - Windows Installation Script
REM ============================================================================
REM This script installs all frontend dependencies for the NexusChain project
REM Author: UNORTHOD0xd
REM ============================================================================

echo.
echo ============================================================================
echo   NexusChain Frontend - Windows Installation Script
echo ============================================================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: Node.js 18.x or higher
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if npm is installed
echo [2/5] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    echo.
    echo npm should come with Node.js. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)

echo [OK] npm is installed
npm --version
echo.

REM Check if .env.local exists, if not create from example
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

REM Clean install - remove existing node_modules if any
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

REM Install dependencies
echo [4/5] Installing frontend dependencies...
echo This may take several minutes. Please wait...
echo.

npm install

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

REM Verify installation
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
