# 🎯 Nexus-Chain Local Demo Instructions

## 📱 Demo URLs for Judges

**Your Local Network IP:** `10.10.1.145`

### Access URLs:
- **Frontend (Main Demo):** http://10.10.1.145:3001
- **Backend API:** http://10.10.1.145:3000
- **Backend Health Check:** http://10.10.1.145:3000/health

### Localhost URLs (for you):
- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:3000

---

## ✅ Pre-Demo Checklist

Before showing to judges:

1. **Verify Services Are Running:**
   ```bash
   docker-compose ps
   ```
   Both services should show "Up" status

2. **Check Backend Health:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"healthy"}`

3. **Test Frontend:**
   - Open: http://localhost:3001
   - Should load the Nexus-Chain homepage

4. **Verify Judges Can Access:**
   - Make sure judges' devices are on the same WiFi network
   - Share the URL: **http://10.10.1.145:3001**

---

## 🎬 Demo Flow

### 1. **Homepage & Introduction** (30 seconds)
- Show the landing page
- Explain: "Nexus-Chain is a blockchain-based supply chain tracking platform"

### 2. **User Registration** (1 minute)
- Click "Register" or "Sign Up"
- Create a manufacturer account
- Show different user roles: Manufacturer, Logistics, Retailer, Consumer

### 3. **Product Registration** (2 minutes)
- Login as manufacturer
- Register a new product
- Show blockchain transaction submission
- Display generated QR code

### 4. **Supply Chain Tracking** (2 minutes)
- Add checkpoints with GPS coordinates
- Show real-time temperature monitoring
- Demonstrate WebSocket live updates

### 5. **Consumer Verification** (1 minute)
- Switch to consumer view
- Scan/enter QR code
- Show complete product journey
- Verify authenticity on blockchain

### 6. **Key Features to Highlight** (1 minute)
- ✅ Immutable blockchain records (Ethereum Sepolia)
- ✅ Real-time GPS tracking with Leaflet maps
- ✅ Temperature monitoring for cold chain
- ✅ QR code generation and scanning
- ✅ MetaMask wallet integration
- ✅ Role-based access control
- ✅ Smart contract automation

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Stop Docker services
docker-compose down

# Restart
docker-compose up -d
```

### Judges Can't Access
1. Verify they're on the same WiFi network
2. Check your firewall settings
3. Confirm your IP hasn't changed:
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

### Database Connection Errors
- Services should auto-connect to Supabase
- Check logs: `docker-compose logs backend`
- Verify internet connection

---

## 🔄 Useful Commands

```bash
# View running containers
docker-compose ps

# View logs (live)
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Start services
docker-compose up -d

# Rebuild and restart
docker-compose up -d --build

# Access backend container shell
docker exec -it nexuschain-backend sh

# Access frontend container shell
docker exec -it nexuschain-frontend sh
```

---

## 📊 Technical Stack to Mention

**Blockchain:**
- Solidity smart contracts on Ethereum Sepolia
- Foundry development framework
- Ethers.js for Web3 integration

**Backend:**
- Node.js with Express
- PostgreSQL via Supabase
- Prisma ORM
- Socket.io for real-time updates
- JWT authentication

**Frontend:**
- Next.js 14 with React 18
- Tailwind CSS
- Leaflet for mapping
- QR code generation/scanning
- MetaMask integration

**DevOps:**
- Docker & Docker Compose
- Multi-stage builds
- Health checks
- CI/CD with GitHub Actions

---

## 🎯 Key Selling Points

1. **Transparency:** Immutable blockchain records prevent fraud
2. **Real-Time:** Live GPS and temperature tracking
3. **Trust:** Consumers can verify product authenticity
4. **Automation:** Smart contracts handle payments automatically
5. **Scalability:** Containerized microservices architecture
6. **Security:** Role-based access control and JWT auth

---

## 📞 Emergency Contacts

If something breaks:
- Stop demo gracefully
- Show the comprehensive test suite (30 passing tests)
- Highlight the documentation (README, DEPLOYMENT.md, etc.)
- Walk through the codebase architecture

---

**Good luck with your demo! 🚀**

Demo Date: October 19, 2025
Deployment: Local Docker Compose
Network: 10.10.1.145
