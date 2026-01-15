# xWeb Deployment Guide

This guide provides detailed instructions for deploying xWeb to various platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Platform-Specific Deployments](#platform-specific-deployments)
  - [Railway](#railway)
  - [Render](#render)
  - [Heroku](#heroku)
  - [DigitalOcean App Platform](#digitalocean-app-platform)
  - [Docker](#docker)
  - [Self-Hosted (VPS)](#self-hosted-vps)
- [Production Best Practices](#production-best-practices)
- [Security Considerations](#security-considerations)

## Prerequisites

Before deploying, ensure you have:
- Node.js 16.x or higher
- npm or yarn package manager
- Git installed and configured

## Environment Variables

Configure these environment variables for your deployment:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |

For production deployments, set `NODE_ENV=production`.

---

## Platform-Specific Deployments

### Railway

[Railway](https://railway.app) offers one-click deployment with automatic HTTPS and custom domains.

#### Quick Deploy

1. Click the "Deploy on Railway" button:
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

2. Connect your GitHub repository
3. Configure environment variables (optional)
4. Deploy!

#### Manual Deployment

1. Install the Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize a new project:
   ```bash
   railway init
   ```

4. Deploy:
   ```bash
   railway up
   ```

5. Get your deployment URL:
   ```bash
   railway domain
   ```

#### Configuration

Railway automatically detects Node.js projects. No additional configuration needed.

**Features:**
- Free tier available
- Automatic deployments from GitHub
- Built-in monitoring
- Custom domains
- Environment variable management

---

### Render

[Render](https://render.com) provides free tier hosting with automatic SSL and continuous deployment.

#### Quick Deploy

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** xweb-dashboard
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click "Create Web Service"

#### Using render.yaml

Create a `render.yaml` in your repository root:

```yaml
services:
  - type: web
    name: xweb-dashboard
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

Then deploy from Render dashboard or using render CLI.

**Features:**
- Free tier for web services
- Auto-deploy from GitHub
- Custom domains supported
- SSL certificates included
- Auto-scaling available

---

### Heroku

[Heroku](https://heroku.com) is a platform as a service with extensive add-ons ecosystem.

#### Deployment Steps

1. Install the Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create xweb-dashboard
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

5. Open your app:
   ```bash
   heroku open
   ```

#### Procfile

Create a `Procfile` in your repository root:

```
web: node server.js
```

#### Environment Variables

Set environment variables:
```bash
heroku config:set NODE_ENV=production
```

**Features:**
- Easy scaling options
- Rich add-ons marketplace
- CLI-based deployment
- Automated builds
- Custom domains

---

### DigitalOcean App Platform

[DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform) offers predictable pricing and great performance.

#### Deployment Steps

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Configure:
   - **Resource Type:** Web Service
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
   - **HTTP Port:** 3000
5. Choose a plan (starting at $5/month)
6. Review and launch

#### app.yaml Configuration

Create an `app.yaml` in your repository root:

```yaml
name: xweb-dashboard
services:
  - name: web
    github:
      repo: AmVa456/xWeb
      branch: main
      deploy_on_push: true
    build_command: npm install
    run_command: npm start
    environment_slug: node-js
    http_port: 3000
    envs:
      - key: NODE_ENV
        value: production
```

**Features:**
- Starting at $5/month
- SSD-based infrastructure
- Multiple datacenter regions
- Automatic SSL
- Built-in monitoring

---

### Docker

Containerize xWeb for deployment anywhere Docker is supported.

#### Dockerfile

Create a `Dockerfile` in your repository root:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "server.js"]
```

#### Build and Run

Build the Docker image:
```bash
docker build -t xweb-dashboard .
```

Run the container:
```bash
docker run -d -p 3000:3000 --name xweb xweb-dashboard
```

#### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  xweb:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run with Docker Compose:
```bash
docker-compose up -d
```

#### Deploy to Container Registries

**Docker Hub:**
```bash
docker tag xweb-dashboard yourusername/xweb-dashboard:latest
docker push yourusername/xweb-dashboard:latest
```

**GitHub Container Registry:**
```bash
docker tag xweb-dashboard ghcr.io/amva456/xweb:latest
docker push ghcr.io/amva456/xweb:latest
```

---

### Self-Hosted (VPS)

Deploy on your own server or VPS for full control.

#### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 16.x or higher
- Nginx (optional, for reverse proxy)
- PM2 (for process management)

#### Deployment Steps

1. **Connect to your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone the repository:**
   ```bash
   cd /var/www
   git clone https://github.com/AmVa456/xWeb.git
   cd xWeb
   ```

5. **Install dependencies:**
   ```bash
   npm install --production
   ```

6. **Start with PM2:**
   ```bash
   pm2 start server.js --name xweb
   pm2 save
   pm2 startup
   ```

#### Nginx Reverse Proxy

Create `/etc/nginx/sites-available/xweb`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/xweb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL with Let's Encrypt

Install Certbot:
```bash
sudo apt-get install certbot python3-certbot-nginx
```

Obtain SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

#### Automatic Updates

Set up a deployment script:

```bash
#!/bin/bash
cd /var/www/xWeb
git pull origin main
npm install --production
pm2 restart xweb
```

---

## Production Best Practices

### 1. Security

⚠️ **Important:** xWeb is designed for local development. For production:

- **Implement Authentication:** Add user authentication and authorization
- **Rate Limiting:** Install and configure `express-rate-limit`
  ```bash
  npm install express-rate-limit
  ```
  ```javascript
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);
  ```

- **Input Validation:** Validate all user inputs
- **HTTPS Only:** Always use HTTPS in production
- **Environment Variables:** Store sensitive data in environment variables
- **CORS Configuration:** Restrict CORS to trusted domains
- **Security Headers:** Use `helmet` middleware
  ```bash
  npm install helmet
  ```
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```

### 2. Performance

- **Enable Compression:** Use gzip compression
  ```bash
  npm install compression
  ```
  ```javascript
  const compression = require('compression');
  app.use(compression());
  ```

- **Static File Caching:** Configure proper cache headers
- **CDN:** Use a CDN for static assets
- **Database Connection Pooling:** If using a database
- **Monitoring:** Set up application monitoring (e.g., New Relic, DataDog)

### 3. Logging

Install a logging library:
```bash
npm install winston
```

Configure structured logging:
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 4. Error Handling

Implement proper error handling:
```javascript
// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### 5. Health Checks

Add a health check endpoint:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

### 6. Graceful Shutdown

Implement graceful shutdown:
```javascript
const gracefulShutdown = () => {
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### 7. Database (If Needed)

If you add database support:
- Use connection pooling
- Implement database migrations
- Regular backups
- Use read replicas for scaling

### 8. Monitoring and Alerts

Set up monitoring for:
- Server uptime
- Response times
- Error rates
- Memory usage
- CPU usage
- Disk space

---

## Security Considerations

### Terminal Command Execution

The terminal feature executes shell commands. For production:

1. **Disable or remove** the terminal feature entirely if not needed
2. **Implement strict authentication** before allowing command execution
3. **Whitelist allowed commands** instead of blacklisting
4. **Run in sandboxed environment** using containers
5. **Audit all command executions**

### File Editor

The file editor allows file system access. For production:

1. **Strict path validation** (already implemented)
2. **File size limits** (already implemented)
3. **Authentication required**
4. **Audit file operations**
5. **Backup before modifications**

### WebSocket Security

Secure WebSocket connections:

1. **Use WSS (WebSocket Secure)** in production
2. **Implement authentication** on connection
3. **Validate all messages**
4. **Rate limit WebSocket messages**

### General Security Checklist

- [ ] Authentication implemented
- [ ] Rate limiting configured
- [ ] HTTPS enabled
- [ ] Security headers added (helmet)
- [ ] Input validation on all endpoints
- [ ] CORS configured properly
- [ ] Secrets in environment variables
- [ ] Terminal feature secured/disabled
- [ ] File editor secured
- [ ] WebSocket authenticated
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain sensitive data
- [ ] Dependencies updated regularly
- [ ] Security audit performed

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Permission Denied
```bash
# Fix file permissions
chmod +x server.js
# Or run with sudo (not recommended)
sudo npm start
```

### WebSocket Connection Failed
- Ensure your reverse proxy supports WebSocket upgrades
- Check firewall rules
- Verify WSS is used over HTTPS

---

## Support

For issues and questions:
- **GitHub Issues:** [https://github.com/AmVa456/xWeb/issues](https://github.com/AmVa456/xWeb/issues)
- **Documentation:** [https://amva456.github.io/xWeb/](https://amva456.github.io/xWeb/)
- **Security:** See [SECURITY.md](SECURITY.md)

---

## License

MIT License - See [LICENSE](LICENSE) for details.
