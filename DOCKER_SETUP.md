# Docker Setup for NexusChain

## One-Command Setup

The entire NexusChain application (frontend + backend) can now be run locally with a single Docker command!

### Quick Start

```bash
# From the project root directory
docker-compose up -d --build
```

Or use the convenience script:

```bash
./start.sh
```

### What Gets Started

- **Backend API Server** - Running on `http://localhost:3000`
  - Express.js REST API
  - WebSocket server for real-time updates
  - Prisma ORM connected to Supabase PostgreSQL
  - Health check endpoint: `http://localhost:3000/health`

- **Frontend Next.js App** - Running on `http://localhost:3001`
  - React-based UI with Tailwind CSS
  - MetaMask integration
  - Real-time map tracking
  - QR code generation and scanning

### Useful Commands

```bash
# Start services (detached mode)
docker-compose up -d --build

# View logs (follow mode)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Check service status
docker-compose ps

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend
```

### Troubleshooting

**Containers won't start:**
```bash
# Check if ports are already in use
lsof -i :3000
lsof -i :3001

# Clean up and rebuild
docker-compose down
docker-compose up -d --build
```

**Database connection issues:**
- Verify your `.env` file has correct `DATABASE_URL` and `DIRECT_URL`
- Ensure Supabase database is accessible

**View detailed container logs:**
```bash
docker logs nexuschain-backend
docker logs nexuschain-frontend
```

### Environment Variables

The application uses environment variables from the `.env` file in the project root. This file is already configured with:

- Database credentials (Supabase)
- JWT secret for authentication
- Blockchain contract addresses (Sepolia testnet)
- API URLs and configuration

### Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │◄────────┤   Backend       │
│   Next.js       │         │   Express.js    │
│   Port 3001     │         │   Port 3000     │
└─────────────────┘         └────────┬────────┘
                                     │
                            ┌────────┴────────┐
                            │   PostgreSQL    │
                            │   (Supabase)    │
                            └─────────────────┘
                                     │
                            ┌────────┴────────┐
                            │   Ethereum      │
                            │   Sepolia       │
                            └─────────────────┘
```

### Health Checks

Both containers include health checks:

- **Backend**: Checks `/health` endpoint every 30s
- **Frontend**: Checks root endpoint every 30s

The frontend container waits for the backend to be healthy before starting.

### What's Configured

The Docker setup includes:

1. **Multi-stage builds** for optimized image sizes
2. **Non-root users** for security
3. **Health checks** for reliability
4. **Volume mounts** for persistent logs
5. **Network isolation** with bridge networking
6. **OpenSSL** pre-installed for Prisma compatibility
7. **Prisma binary targets** configured for Alpine Linux

### Production Notes

This Docker setup is production-ready and includes:

- Optimized Node.js 18 Alpine base images
- Prisma Client generated with correct binary targets
- Environment variable injection
- Health monitoring
- Log persistence
- Graceful shutdown handling

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).
