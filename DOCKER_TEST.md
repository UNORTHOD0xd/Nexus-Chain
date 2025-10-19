# Docker Local Testing Guide

Since Docker commands need to be run in PowerShell or Command Prompt (not Git Bash), follow these steps:

## 🐳 Prerequisites

1. **Docker Desktop** must be installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure it's running (check system tray)

2. **Environment file** is already created at `.env`

## 🚀 Testing Steps

### Step 1: Open PowerShell or Command Prompt

```powershell
# Navigate to project directory
cd C:\Users\davon\Documents\Nexus-Chain
```

### Step 2: Verify Docker is Running

```powershell
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Expected output:
# Docker version 24.x.x
# Docker Compose version v2.x.x
```

### Step 3: Build Docker Images

```powershell
# Build all images (this will take 5-10 minutes first time)
docker compose build

# Or build without cache (slower but ensures fresh build)
docker compose build --no-cache
```

**Expected output:**
```
[+] Building frontend...
[+] Building backend...
✓ frontend built successfully
✓ backend built successfully
```

### Step 4: Start Containers

```powershell
# Start all services
docker compose up

# Or run in background (detached mode)
docker compose up -d
```

**Expected output:**
```
[+] Running 3/3
✓ Network nexuschain-network  Created
✓ Container nexuschain-backend   Started
✓ Container nexuschain-frontend  Started
```

### Step 5: Verify Containers are Running

```powershell
# Check running containers
docker compose ps

# Expected output:
# NAME                    STATUS              PORTS
# nexuschain-backend      Up (healthy)        0.0.0.0:3000->3000/tcp
# nexuschain-frontend     Up (healthy)        0.0.0.0:3001->3001/tcp
```

### Step 6: Check Health Status

Wait 30-60 seconds for containers to fully start, then:

```powershell
# Check backend health
curl http://localhost:3000/health

# Expected output:
# {"status":"healthy","timestamp":"2025-10-19T...","environment":"production"}

# Check frontend (open in browser)
start http://localhost:3001
```

### Step 7: View Logs

```powershell
# View all logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View frontend logs only
docker compose logs -f frontend
```

### Step 8: Test the Application

Open browser to `http://localhost:3001` and test:

1. **Homepage loads** ✓
2. **Login page** (`/login`) ✓
3. **Signup page** (`/signup`) ✓
4. **Try demo login:**
   - Email: `manufacturer@nexuschain.com`
   - Password: `demo1234`
5. **Dashboard loads** after login ✓
6. **Register product page** works ✓
7. **MetaMask connection** works ✓

### Step 9: Test Backend API

```powershell
# Health check
curl http://localhost:3000/health

# Get all products (requires auth token - login first)
curl http://localhost:3000/api/products

# Verify products endpoint returns 401 (auth required)
# This is expected - shows auth is working!
```

### Step 10: Check Database Connection

```powershell
# Enter backend container
docker compose exec backend sh

# Inside container, check Prisma connection
npx prisma db pull

# Exit container
exit
```

---

## 🛑 Stopping Containers

```powershell
# Stop containers (keeps data)
docker compose stop

# Stop and remove containers (keeps images)
docker compose down

# Stop, remove containers, images, and volumes (full cleanup)
docker compose down -v --rmi all
```

---

## 🐛 Troubleshooting

### Port Already in Use

If you see `port 3000 is already allocated`:

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

### Container Won't Start

```powershell
# Check logs for errors
docker compose logs backend
docker compose logs frontend

# Rebuild specific service
docker compose build --no-cache backend
```

### Database Connection Error

```powershell
# Check environment variables
docker compose config

# Verify DATABASE_URL is correct in .env file
type .env
```

### Out of Disk Space

```powershell
# Clean up Docker
docker system prune -a

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a
```

---

## ✅ Success Checklist

After testing, verify:

- [ ] Both containers start successfully
- [ ] Health checks pass (healthy status)
- [ ] Frontend loads at http://localhost:3001
- [ ] Backend API responds at http://localhost:3000/health
- [ ] Can login with demo credentials
- [ ] Dashboard loads after login
- [ ] No errors in Docker logs
- [ ] Database connection works
- [ ] WebSocket connection established

---

## 📊 Expected Performance

**First Build:**
- Time: 5-10 minutes
- Backend image: ~500MB
- Frontend image: ~200MB

**Startup Time:**
- Backend: 10-15 seconds
- Frontend: 20-30 seconds
- Health check ready: 30-40 seconds

**Resource Usage:**
- CPU: 10-20% during startup, 2-5% idle
- Memory: Backend ~200MB, Frontend ~150MB
- Disk: ~1GB total

---

## 🎯 Next Steps After Successful Test

1. ✅ Docker setup verified working
2. ✅ All components integrated properly
3. ✅ Ready for production deployment

**Proceed to:**
- [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- [MVP_CHECKLIST.md](./MVP_CHECKLIST.md) for deployment checklist

---

**Note:** If you encounter issues, check:
1. Docker Desktop is running
2. .env file has correct values
3. Ports 3000 and 3001 are not in use
4. You have internet connection (for npm packages)

