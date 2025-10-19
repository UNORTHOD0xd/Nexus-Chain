# Production Deployment Guide

Complete guide for deploying NexusChain to production.

## 🎯 Deployment Options

NexusChain can be deployed to various platforms:

| Platform | Backend | Frontend | Difficulty | Cost |
|----------|---------|----------|------------|------|
| **Vercel + Railway** | Railway | Vercel | ⭐ Easy | ~$10/mo |
| **Render** | Render | Render | ⭐ Easy | ~$15/mo |
| **AWS** | ECS/EC2 | S3+CloudFront | ⭐⭐⭐ Advanced | ~$20-50/mo |
| **Docker + VPS** | Docker | Docker | ⭐⭐ Moderate | ~$5-10/mo |

---

## 🚀 Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

**Easiest deployment with automatic CI/CD from GitHub.**

### Prerequisites
- GitHub account with NexusChain repo
- Vercel account (free)
- Railway account (free tier available)
- Supabase database (already setup)

### Step 1: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app/)**

2. **New Project → Deploy from GitHub**
   - Select your NexusChain repository
   - Choose `backend` directory

3. **Add Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=your_supabase_pooler_url
   DIRECT_URL=your_supabase_direct_url
   JWT_SECRET=your_production_jwt_secret
   FRONTEND_URL=https://your-app.vercel.app
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   PRODUCT_REGISTRY_ADDRESS=0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2
   PAYMENT_ESCROW_ADDRESS=0x416133e08B0cC8804bf5A00f0e3569D4A378EB63
   CHAIN_ID=11155111
   LOG_LEVEL=info
   ```

4. **Configure Build**
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `node src/server.js`

5. **Deploy**
   - Railway will auto-deploy
   - Copy your Railway URL (e.g., `https://nexuschain-backend.up.railway.app`)

6. **Run Database Migrations**
   ```bash
   # In Railway's terminal or locally with production DATABASE_URL
   npx prisma migrate deploy
   npm run db:seed  # Optional: seed demo data
   ```

### Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com/)**

2. **Import Git Repository**
   - Select your NexusChain repository

3. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://nexuschain-backend.up.railway.app
   NEXT_PUBLIC_SOCKET_URL=wss://nexuschain-backend.up.railway.app
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2
   NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0x416133e08B0cC8804bf5A00f0e3569D4A378EB63
   ```

5. **Deploy**
   - Vercel will auto-build and deploy
   - Your app will be live at `https://your-app.vercel.app`

6. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy backend

### Step 3: Configure Custom Domain (Optional)

**On Vercel:**
1. Project Settings → Domains
2. Add your domain (e.g., `nexuschain.app`)
3. Update DNS records as instructed

**On Railway:**
1. Project Settings → Domains
2. Add subdomain (e.g., `api.nexuschain.app`)
3. Update DNS CNAME record

**Update Environment Variables:**
- Railway: `FRONTEND_URL=https://nexuschain.app`
- Vercel: `NEXT_PUBLIC_API_URL=https://api.nexuschain.app`

---

## 🚀 Option 2: Render (Full Stack)

**Single platform for both frontend and backend.**

### Step 1: Create Render Account

1. Go to [Render.com](https://render.com/)
2. Connect your GitHub account

### Step 2: Deploy Backend (Web Service)

1. **New → Web Service**
2. Select NexusChain repository
3. Configure:
   ```
   Name: nexuschain-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Build Command: npm install && npx prisma generate
   Start Command: node src/server.js
   ```

4. **Environment Variables** (same as Railway above)

5. **Create Service**
   - Render will deploy automatically
   - Copy service URL

### Step 3: Deploy Frontend (Static Site)

1. **New → Static Site**
2. Select NexusChain repository
3. Configure:
   ```
   Name: nexuschain-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: .next
   ```

4. **Environment Variables** (same as Vercel above)

5. **Create Static Site**

### Step 4: Run Migrations

```bash
# Connect to Render backend shell
npm run prisma:migrate
npm run db:seed
```

---

## 🚀 Option 3: AWS (Production Grade)

**Most scalable but complex setup.**

### Architecture
- **Backend**: ECS Fargate (Docker containers)
- **Frontend**: S3 + CloudFront
- **Database**: Supabase (already setup)
- **Load Balancer**: Application Load Balancer

### Prerequisites
- AWS Account
- AWS CLI installed
- Docker installed

### Step 1: Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repositories
aws ecr create-repository --repository-name nexuschain-backend
aws ecr create-repository --repository-name nexuschain-frontend

# Build and push backend
cd backend
docker build -t nexuschain-backend .
docker tag nexuschain-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/nexuschain-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/nexuschain-backend:latest

# Build and push frontend
cd ../frontend
docker build -t nexuschain-frontend .
docker tag nexuschain-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/nexuschain-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/nexuschain-frontend:latest
```

### Step 2: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name nexuschain-cluster

# Create task definitions (see AWS docs)
# Create services
# Configure load balancer
```

### Step 3: Deploy Frontend to S3

```bash
cd frontend
npm run build

# Upload to S3
aws s3 sync .next/static s3://nexuschain-frontend/static
aws s3 sync public s3://nexuschain-frontend/public

# Configure CloudFront distribution
```

**Full AWS guide**: See [AWS ECS Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/)

---

## 🚀 Option 4: Docker Compose on VPS

**Full control, low cost.**

### Step 1: Get a VPS

Providers:
- DigitalOcean: $6/month droplet
- Linode: $5/month VPS
- Vultr: $6/month VPS
- Hetzner: €4/month

### Step 2: Setup Server

```bash
# SSH into your server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin

# Clone repository
git clone https://github.com/yourusername/Nexus-Chain.git
cd Nexus-Chain
```

### Step 3: Configure Environment

```bash
# Create .env file
cp .env.production.example .env
nano .env

# Add your production values
```

### Step 4: Deploy

```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f

# Run migrations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed
```

### Step 5: Setup Nginx (Reverse Proxy)

```bash
# Install Nginx
apt install nginx

# Configure
nano /etc/nginx/sites-available/nexuschain
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

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

```bash
# Enable site
ln -s /etc/nginx/sites-available/nexuschain /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL with Let's Encrypt
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## 📊 Post-Deployment Checklist

### Immediate Actions

- [ ] Verify health endpoints
  - [ ] Backend: `https://api.yourdomain.com/health`
  - [ ] Frontend: `https://yourdomain.com`
- [ ] Test user registration and login
- [ ] Test product registration
- [ ] Test checkpoint addition
- [ ] Test QR code verification
- [ ] Test MetaMask connection
- [ ] Check WebSocket real-time updates

### Security

- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Rotate JWT_SECRET (different from dev)
- [ ] Enable database connection pooling
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable DDoS protection (Cloudflare)

### Monitoring

- [ ] Set up UptimeRobot for uptime monitoring
- [ ] Configure Sentry for error tracking
- [ ] Set up log aggregation (LogDNA, Papertrail)
- [ ] Enable database backups (daily)
- [ ] Set up alerts (email/Slack/Discord)

### Performance

- [ ] Enable CDN (Cloudflare, Vercel Edge)
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Monitor response times

---

## 🐛 Troubleshooting

### Backend won't start
- Check environment variables are set
- Verify database connection
- Check logs: `docker-compose logs backend`

### Frontend shows 500 error
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Inspect browser console for errors

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check Supabase IP whitelist
- Ensure migrations have run

### WebSocket not connecting
- Check `NEXT_PUBLIC_SOCKET_URL` uses `wss://` (not `ws://`) in production
- Verify proxy/load balancer supports WebSocket upgrades

---

## 📞 Support

- GitHub Issues: https://github.com/UNORTHOD0xd/Nexus-Chain/issues
- Documentation: See README.md
- Community: [Your Discord/Slack]

---

**Last Updated:** 2025-10-19
**Maintainer:** UNORTHOD0xd
