# NX Monorepo with CI/CD for VPS Deployment

A modern, production-ready monorepo setup using NX, featuring a Node.js/Express backend, Next.js frontend, Docker containerization, and automated CI/CD pipeline for VPS deployment.

## 🏗️ Project Structure

```
nx-mono-repo-deployment-test/
├── apps/
│   ├── api/                    # Backend API (Node.js/Express)
│   │   ├── src/
│   │   │   ├── controllers/    # API controllers
│   │   │   ├── routes/         # API routes
│   │   │   └── main.js         # Entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                    # Frontend (Next.js/React)
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── pages/          # Next.js pages
│       │   └── styles/         # CSS modules
│       ├── Dockerfile
│       └── package.json
│
├── libs/
│   └── shared/                 # Shared utilities and types
│       └── src/
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│       ├── ci.yml              # Continuous Integration
│       ├── cd-dev.yml          # Dev deployment (auto)
│       ├── cd-qa.yml           # QA deployment (auto)
│       ├── cd-staging.yml      # Staging deployment (auto)
│       ├── cd-prod.yml         # Production deployment (manual)
│       └── pr-check.yml        # Pull Request checks
│
├── docker/
│   └── nginx/                  # Nginx configuration
│       └── nginx.conf
│
├── scripts/                    # Deployment scripts
│   ├── deploy.sh               # Main deployment script
│   ├── setup-vps.sh            # VPS initial setup
│   ├── backup.sh               # Backup script
│   ├── rollback.sh             # Rollback script
│   ├── logs.sh                 # View logs
│   └── status.sh               # Check service status
│
├── docker-compose.yml          # Docker Compose configuration
├── nx.json                     # NX configuration
└── package.json                # Root package.json
```

## ✨ Features

- 🏗️ **Monorepo Architecture**: NX-powered monorepo for efficient code sharing
- ⚡ **Modern Stack**: TypeScript + Node.js/Express backend + Next.js/React frontend
- 💎 **Full TypeScript**: 100% TypeScript with strict type checking
- 🐳 **Dockerized**: Containerized applications for consistent deployment
- 🔄 **CI/CD**: Automated testing and deployment with GitHub Actions
- 🚀 **VPS Ready**: Production-ready scripts for VPS deployment
- 🔒 **Nginx Reverse Proxy**: Load balancing and SSL termination
- 📊 **Health Checks**: Built-in health monitoring
- 🔄 **Auto Deployment**: Push to main branch triggers deployment
- 📦 **Shared Libraries**: Common utilities and types across apps

## 🌍 Live Environments

The application is deployed across multiple environments with automated CI/CD pipelines:

### Development Environment
- **API**: https://dev-api.pasindusampath.com
- **Web**: https://dev-web.pasindusampath.com
- **Status**: ✅ Auto-deploy on `develop`/`dev` branch
- **Health Check**: https://dev-api.pasindusampath.com/health

### QA Environment
- **API**: https://qa-api.pasindusampath.com
- **Web**: https://qa-web.pasindusampath.com
- **Status**: ✅ Auto-deploy on `qa` branch
- **Health Check**: https://qa-api.pasindusampath.com/health

### Staging Environment
- **API**: https://staging-api.pasindusampath.com
- **Web**: https://staging-web.pasindusampath.com
- **Status**: ✅ Auto-deploy on `staging` branch
- **Health Check**: https://staging-api.pasindusampath.com/health

### Production Environment
- **API**: https://prod-api.pasindusampath.com
- **Web**: https://prod-web.pasindusampath.com
- **Status**: ⚠️ Manual deployment only (main branch)
- **Health Check**: https://prod-api.pasindusampath.com/health


## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- Yarn 4.x (via Corepack)
- Docker and Docker Compose (for deployment)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nx-mono-repo-deployment-test
   ```

2. **Install dependencies**
   ```bash
   # Enable Corepack for Yarn
   corepack enable
   
   # Install all workspace dependencies
   yarn install
   ```

3. **Start the API (in one terminal)**
   ```bash
   yarn api:dev
   ```
   API will run on http://localhost:3000

4. **Start the Web app (in another terminal)**
   ```bash
   yarn web:dev
   ```
   Web app will run on http://localhost:3001

5. **Access the application**
   - Frontend: http://localhost:3001
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## 🐳 Docker Deployment

### Local Docker Testing

```bash
# Build all images
yarn docker:build

# Start all services
yarn docker:up

# View logs
yarn docker:logs

# Stop all services
yarn docker:down
```

Access the application at http://localhost (through Nginx reverse proxy)

## 🌐 VPS Deployment

### Initial VPS Setup

1. **SSH into your VPS**
   ```bash
   ssh your-username@your-vps-ip
   ```

2. **Run the setup script**
   ```bash
   curl -O https://raw.githubusercontent.com/your-repo/main/scripts/setup-vps.sh
   chmod +x setup-vps.sh
   ./setup-vps.sh
   ```

3. **Clone your repository**
   ```bash
   cd /opt/nx-mono-repo
   git clone <your-repo-url> .
   ```

4. **Configure GitHub Secrets**
   
   Go to your GitHub repository → Settings → Secrets and add:
   - `VPS_HOST`: Your VPS IP address or domain
   - `VPS_USERNAME`: SSH username
   - `VPS_SSH_KEY`: Your SSH private key
   - `VPS_PORT`: SSH port (default: 22)
   - `DOCKER_USERNAME`: (Optional) Docker Hub username
   - `DOCKER_PASSWORD`: (Optional) Docker Hub password

### Manual Deployment

```bash
cd /opt/nx-mono-repo
./scripts/deploy.sh
```

### Automated Deployment

Every push to the `main` branch triggers automatic deployment via GitHub Actions.

## 📜 Available Scripts

### Root Level

```bash
npm run api:dev          # Start API in development mode
npm run api:start        # Start API in production mode
npm run web:dev          # Start web app in development mode
npm run web:build        # Build web app for production
npm run web:start        # Start web app in production mode
npm run install:all      # Install all dependencies
npm run docker:build     # Build Docker images
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run docker:logs      # View Docker logs
npm run deploy           # Deploy to VPS
npm run status           # Check service status
npm run logs             # View application logs
```

### Deployment Scripts

```bash
./scripts/deploy.sh      # Deploy application
./scripts/setup-vps.sh   # Initial VPS setup
./scripts/backup.sh      # Create backup
./scripts/rollback.sh    # Rollback to previous version
./scripts/logs.sh        # View logs (api, web, nginx, or all)
./scripts/status.sh      # Check service status and health
```

## 🔧 Configuration

### Environment Variables

**API (apps/api/.env)**
```env
NODE_ENV=production
PORT=3000
```

**Web (apps/web/.env.local)**
```env
API_URL=http://localhost:3000
```

**Production (VPS)**
Update `docker-compose.yml` with production environment variables.

### Nginx Configuration

Edit `docker/nginx/nginx.conf` to:
- Add SSL certificates
- Configure custom domains
- Adjust rate limiting
- Add custom headers

### SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Place certificates in `docker/nginx/ssl/`
3. Uncomment HTTPS server block in `nginx.conf`
4. Update docker-compose.yml to mount SSL volumes

## 🔄 CI/CD Pipeline

### Workflow Overview

1. **CI (Continuous Integration)**
   - Runs on every push and pull request
   - Lints code
   - Builds applications
   - Runs tests

2. **CD (Continuous Deployment)**
   - Runs on push to `main` branch
   - Builds Docker images
   - Deploys to VPS
   - Runs health checks

3. **PR Checks**
   - Validates code formatting
   - Checks for linting errors
   - Comments on PR with status

### Customizing Workflows

Edit files in `.github/workflows/` to customize:
- Deployment triggers
- Build steps
- Test commands
- Deployment targets

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check all services
./scripts/status.sh

# Check API health
curl http://your-vps-ip/health

# Check web health
curl http://your-vps-ip/
```

### Viewing Logs

```bash
# All services
./scripts/logs.sh all

# Specific service
./scripts/logs.sh api
./scripts/logs.sh web
./scripts/logs.sh nginx
```

### Backups

```bash
# Create backup
./scripts/backup.sh

# Backups are stored in /opt/backups/nx-mono-repo/
# Last 7 backups are retained automatically
```

### Rollback

```bash
./scripts/rollback.sh
# Enter the commit hash to rollback to
```

## 🏗️ Architecture

### Application Flow

```
Internet → Nginx (Port 80/443)
           ├─→ /api/* → API Service (Port 3000)
           ├─→ /health → API Health Check
           └─→ /* → Web Service (Port 3001)
```

### Docker Services

- **api**: Node.js/Express backend
- **web**: Next.js frontend
- **nginx**: Reverse proxy and load balancer

## 🛡️ Security

- ✅ Helmet.js for API security headers
- ✅ CORS configured
- ✅ Rate limiting via Nginx
- ✅ Non-root Docker containers
- ✅ Environment variable management
- ✅ UFW firewall configuration
- 🔄 SSL/TLS ready (configure certificates)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Wait for CI checks to pass
5. Get approval and merge

## 📝 License

MIT

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check which process is using the port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Docker Issues

```bash
# Remove all containers and start fresh
docker-compose down -v
docker system prune -a
docker-compose up -d
```

### Deployment Failures

```bash
# Check logs
./scripts/logs.sh all

# Check service status
./scripts/status.sh

# Rollback to previous version
./scripts/rollback.sh
```

## 📚 Additional Resources

- [NX Documentation](https://nx.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com)
- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🎯 Roadmap

- [ ] Add database support (PostgreSQL/MongoDB)
- [ ] Implement authentication and authorization
- [ ] Add comprehensive test suites
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Add logging aggregation (ELK Stack)
- [ ] Implement caching layer (Redis)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Set up automated backups
- [ ] Implement blue-green deployment

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using NX Monorepo**

