# ============================================================================
# NexusChain Frontend - Windows Installation Script (PowerShell)
# ============================================================================
# This script installs all frontend dependencies for the NexusChain project
# Author: UNORTHOD0xd
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  NexusChain Frontend - Windows Installation Script" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check command existence
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Check if Node.js is installed
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Recommended version: Node.js 18.x or higher" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Node.js is installed" -ForegroundColor Green
$nodeVersion = node --version
Write-Host "Version: $nodeVersion" -ForegroundColor Gray
Write-Host ""

# Check if npm is installed
Write-Host "[2/5] Checking npm installation..." -ForegroundColor Yellow
if (-not (Test-Command "npm")) {
    Write-Host "[ERROR] npm is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "npm should come with Node.js. Please reinstall Node.js." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] npm is installed" -ForegroundColor Green
$npmVersion = npm --version
Write-Host "Version: $npmVersion" -ForegroundColor Gray
Write-Host ""

# Check if .env.local exists, if not create from example
Write-Host "[3/5] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.local.example") {
        Write-Host "[SETUP] Creating .env.local from template..." -ForegroundColor Yellow
        Copy-Item ".env.local.example" ".env.local"
        Write-Host "[OK] .env.local created. Please update with your configuration." -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Edit .env.local and add:" -ForegroundColor Yellow
        Write-Host "  - Backend API URL" -ForegroundColor Gray
        Write-Host "  - Contract addresses (after deployment)" -ForegroundColor Gray
        Write-Host ""
    }
    else {
        Write-Host "[WARNING] .env.local.example not found!" -ForegroundColor Yellow
        Write-Host "You'll need to create .env.local manually." -ForegroundColor Yellow
        Write-Host ""
    }
}
else {
    Write-Host "[OK] .env.local already exists" -ForegroundColor Green
    Write-Host ""
}

# Clean install - remove existing node_modules if any
if (Test-Path "node_modules") {
    Write-Host "[CLEANUP] Removing existing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "[OK] Cleanup complete" -ForegroundColor Green
    Write-Host ""
}

if (Test-Path "package-lock.json") {
    Write-Host "[CLEANUP] Removing existing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Force "package-lock.json"
    Write-Host "[OK] Cleanup complete" -ForegroundColor Green
    Write-Host ""
}

# Install dependencies
Write-Host "[4/5] Installing frontend dependencies..." -ForegroundColor Yellow
Write-Host "This may take several minutes. Please wait..." -ForegroundColor Gray
Write-Host ""

try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
}
catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to install dependencies!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure you have a stable internet connection" -ForegroundColor Gray
    Write-Host "2. Try running: npm cache clean --force" -ForegroundColor Gray
    Write-Host "3. Delete node_modules and package-lock.json, then run this script again" -ForegroundColor Gray
    Write-Host "4. Check if you're behind a corporate proxy" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[OK] All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Verify installation
Write-Host "[5/5] Verifying installation..." -ForegroundColor Yellow

$verificationFailed = $false

if (Test-Path "node_modules") {
    Write-Host "[OK] node_modules directory created" -ForegroundColor Green
}
else {
    Write-Host "[ERROR] node_modules directory not found!" -ForegroundColor Red
    $verificationFailed = $true
}

if (Test-Path "node_modules\next") {
    Write-Host "[OK] Next.js installed" -ForegroundColor Green
}
else {
    Write-Host "[ERROR] Next.js not found in node_modules!" -ForegroundColor Red
    $verificationFailed = $true
}

if (Test-Path "node_modules\react") {
    Write-Host "[OK] React installed" -ForegroundColor Green
}
else {
    Write-Host "[ERROR] React not found in node_modules!" -ForegroundColor Red
    $verificationFailed = $true
}

if ($verificationFailed) {
    Write-Host ""
    Write-Host "[ERROR] Installation verification failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Edit .env.local with your configuration:" -ForegroundColor Gray
Write-Host "     - NEXT_PUBLIC_API_URL=http://localhost:3000" -ForegroundColor Gray
Write-Host "     - NEXT_PUBLIC_SOCKET_URL=http://localhost:3000" -ForegroundColor Gray
Write-Host "     - Add contract addresses after blockchain deployment" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Start the development server:" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Open your browser to:" -ForegroundColor Gray
Write-Host "     http://localhost:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation: See README.md and claude.md for more details" -ForegroundColor Gray
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
