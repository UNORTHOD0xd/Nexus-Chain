# Docker Deployment Guide

This guide covers running NexusChain with Docker and Docker Compose.

## 🐳 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Environment variables configured

## 🚀 Quick Start with Docker Compose

### 1. Prepare Environment Variables

Create `.env` file in the project root:

```bash
# Copy from template
cp .env.production.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

**Required variables:**
```env
DATABASE_URL="your_supabase_pooler_url"
DIRECT_URL="your_supabase_direct_url"
JWT_SECRET="your_production_jwt_secret"
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
PRODUCT_REGISTRY_ADDRESS="0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2"
PAYMENT_ESCROW_ADDRESS="0x416133e08B0cC8804bf5A00f0e3569D4A378EB63"
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

**Services will be available at:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Backend Health Check: http://localhost:3000/health

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Stop Services

```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove, and delete volumes
docker-compose down -v
```

---

## 📦 Individual Container Builds

### Backend Only

```bash
cd backend

# Build
docker build -t nexuschain-backend .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e JWT_SECRET="your_jwt_secret" \
  -e FRONTEND_URL="http://localhost:3001" \
  nexuschain-backend
```

### Frontend Only

```bash
cd frontend

# Build
docker build -t nexuschain-frontend .

# Run
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL="http://localhost:3000" \
  -e NEXT_PUBLIC_SOCKET_URL="ws://localhost:3000" \
  nexuschain-frontend
```

---

## 🔧 Development with Docker

For local development with hot reload, use regular `npm run dev` instead of Docker.

**Docker is recommended for:**
- Production deployments
- Staging environments
- Testing production builds locally
- CI/CD pipelines

**Use npm scripts for:**
- Local development
- Rapid iteration
- Debugging

---

## 🏥 Health Checks

Both containers have built-in health checks:

```bash
# Check backend health
curl http://localhost:3000/health

# Check frontend
curl http://localhost:3001

# Docker health status
docker ps  # Shows health status in STATUS column
```

---

## 📊 Monitoring Containers

### View Resource Usage

```bash
# Real-time stats
docker stats

# Container info
docker ps
docker inspect nexuschain-backend
docker inspect nexuschain-frontend
```

### Access Container Shell

```bash
# Backend
docker exec -it nexuschain-backend sh

# Frontend
docker exec -it nexuschain-frontend sh
```

### View Application Logs

```bash
# Backend logs (from Winston)
docker exec nexuschain-backend cat logs/combined.log
docker exec nexuschain-backend cat logs/error.log

# Container logs
docker logs nexuschain-backend
docker logs nexuschain-frontend
```

---

## 🔐 Production Deployment

### 1. Build for Production

```bash
# Build optimized images
docker-compose -f docker-compose.yml build --no-cache

# Tag for registry
docker tag nexuschain-backend:latest your-registry/nexuschain-backend:v1.0.0
docker tag nexuschain-frontend:latest your-registry/nexuschain-frontend:v1.0.0

# Push to registry
docker push your-registry/nexuschain-backend:v1.0.0
docker push your-registry/nexuschain-frontend:v1.0.0
```

### 2. Deploy to Server

**Using Docker Compose on VPS:**

```bash
# SSH into server
ssh user@your-server.com

# Clone repo or copy docker-compose.yml
git clone your-repo.git
cd your-repo

# Set environment variables
nano .env

# Deploy
docker-compose up -d

# Verify
docker ps
curl https://your-domain.com/health
```

**Using Cloud Platforms:**

- **AWS ECS**: Use task definitions with Docker images
- **Google Cloud Run**: Deploy containers directly
- **Azure Container Instances**: Use container groups
- **Railway**: Connect GitHub repo with Dockerfile
- **Render**: Auto-deploy from GitHub with Dockerfile

### 3. Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v
docker system prune -a
```

### Database connection errors

- Verify `DATABASE_URL` and `DIRECT_URL` in `.env`
- Check Supabase IP whitelist
- Ensure Prisma client is generated (`npx prisma generate`)

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change port in docker-compose.yml
```

### Out of disk space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## 📝 Docker Compose Configuration

### Services

| Service | Container | Port | Health Check |
|---------|-----------|------|--------------|
| backend | nexuschain-backend | 3000 | `/health` endpoint |
| frontend | nexuschain-frontend | 3001 | Root `/` endpoint |

### Volumes

- `./backend/logs:/app/logs` - Backend application logs

### Networks

- `nexuschain-network` - Bridge network for inter-container communication

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker-compose build

      - name: Push to registry
        run: |
          docker tag nexuschain-backend ${{ secrets.REGISTRY }}/backend:latest
          docker push ${{ secrets.REGISTRY }}/backend:latest
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Node.js Best Practices in Docker](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Last Updated:** 2025-10-19
**Maintainer:** UNORTHOD0xd
