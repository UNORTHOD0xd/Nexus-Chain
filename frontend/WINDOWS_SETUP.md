# Windows Setup Guide - NexusChain Frontend

This guide will help you set up the NexusChain frontend on Windows after cloning the repository.

## Prerequisites

Before running the installation script, make sure you have:

1. **Node.js** (version 18.x or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - The installer will also include npm (Node Package Manager)

2. **Git** (to clone the repository)
   - Download from: https://git-scm.com/download/win

## Installation Methods

You have two options for installation:

### Option 1: Using Batch Script (Recommended for beginners)

1. Open the `frontend` folder in File Explorer
2. Double-click `install-windows.bat`
3. Follow the on-screen instructions
4. The script will automatically:
   - Check Node.js and npm installation
   - Create `.env.local` from the example file
   - Install all dependencies
   - Verify the installation

### Option 2: Using PowerShell Script (Recommended for advanced users)

1. Right-click on `install-windows.ps1`
2. Select "Run with PowerShell"

   **Note:** If you get an execution policy error, run PowerShell as Administrator and execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Follow the on-screen instructions

### Option 3: Manual Installation

If you prefer to install manually or the scripts don't work:

1. Open Command Prompt or PowerShell
2. Navigate to the frontend directory:
   ```cmd
   cd path\to\Nexus-Chain\frontend
   ```
3. Copy the environment file:
   ```cmd
   copy .env.local.example .env.local
   ```
4. Install dependencies:
   ```cmd
   npm install
   ```

## Post-Installation Configuration

After installation, you need to configure your environment variables:

1. Open `.env.local` in a text editor (Notepad, VS Code, etc.)
2. Update the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=<contract_address_after_deployment>
   NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=<contract_address_after_deployment>
   ```
3. Save the file

**Note:** Contract addresses will be available after the blockchain contracts are deployed.

## Running the Development Server

After successful installation:

1. Open Command Prompt or PowerShell
2. Navigate to the frontend directory:
   ```cmd
   cd path\to\Nexus-Chain\frontend
   ```
3. Start the development server:
   ```cmd
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

## Troubleshooting

### Node.js Not Found
- Make sure Node.js is installed
- Restart your terminal/command prompt after installing Node.js
- Check installation: `node --version`

### Permission Errors
- Run the script as Administrator (right-click → "Run as Administrator")
- Close any other applications that might be using the project files

### Network/Download Errors
- Check your internet connection
- If behind a corporate proxy, configure npm:
  ```cmd
  npm config set proxy http://proxy.company.com:8080
  npm config set https-proxy http://proxy.company.com:8080
  ```
- Clear npm cache:
  ```cmd
  npm cache clean --force
  ```

### Installation Fails
1. Delete `node_modules` folder and `package-lock.json`
2. Run the installation script again
3. Or try manual installation (Option 3 above)

### Port 3001 Already in Use
- Change the port in `package.json`:
  ```json
  "dev": "next dev -p 3002"
  ```

## Verifying Installation

After installation, verify these folders/files exist:

- ✅ `node_modules/` - Contains all dependencies
- ✅ `node_modules/next/` - Next.js framework
- ✅ `node_modules/react/` - React library
- ✅ `.env.local` - Environment configuration
- ✅ `package-lock.json` - Dependency lock file

## Additional Resources

- **Project Documentation**: See `../claude.md` for comprehensive project details
- **Main README**: See `../README.md` for overall project setup
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev/

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error messages carefully
3. Check the project's GitHub Issues page
4. Ask your team lead for assistance

## Dependencies Installed

The installation script will install:

- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Ethers.js** - Blockchain interaction
- **Socket.io-client** - Real-time updates
- **Leaflet** - Interactive maps
- **Lucide React** - Icons
- **Axios** - HTTP client
- **QRCode** - QR code generation

Total: ~433 packages (including dependencies)

---

**Happy coding! 🚀**
