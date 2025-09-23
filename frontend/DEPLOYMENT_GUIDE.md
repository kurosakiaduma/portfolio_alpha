# Portfolio Frontend Deployment Guide

This guide covers dockerizing the Astro frontend and deploying it to production with Nginx reverse proxy and SSL.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Docker Setup](#docker-setup)
- [Nginx Configuration](#nginx-configuration)
- [SSL Setup](#ssl-setup)
- [Deployment Steps](#deployment-steps)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker and Docker Compose installed on production server
- Domain name configured to point to your server
- Git installed on production server
- Nginx installed on production server
- Certbot for SSL certificates (Let's Encrypt)

## Docker Setup

### 1. Create Dockerfile

Create a `Dockerfile` in the frontend root directory:

```dockerfile
# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Create Docker Compose File

Create `docker-compose.yml` in the frontend root directory:

```yaml
version: '3.8'

services:
  portfolio-frontend:
    build: .
    container_name: portfolio-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    networks:
      - portfolio-network
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/var/log/nginx

networks:
  portfolio-network:
    driver: bridge

volumes:
  logs:
```

### 3. Create Nginx Configuration for Container

Create `nginx.conf` in the frontend root directory:

```nginx
user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Handle client-side routing (SPA)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files $uri =404;
        }

        # Cache HTML files for a shorter time
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public";
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 4. Create .dockerignore

Create `.dockerignore` to optimize build:

```
node_modules
.git
.gitignore
README.md
DEPLOYMENT_GUIDE.md
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
dist
.astro
```

## Nginx Configuration (Host System)

### Main Nginx Configuration

Create `/etc/nginx/sites-available/portfolio` on your production server:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name taduma.me www.taduma.me;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    server_name taduma.me www.taduma.me;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/taduma.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/taduma.me/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/portfolio_access.log;
    error_log /var/log/nginx/portfolio_error.log;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Future API routes (placeholder for backend)
    location /api/ {
        # This will be configured later for your backend
        return 503 "API not yet available";
        add_header Content-Type text/plain;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
    }
}
```

## SSL Setup

### 1. Install Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# Obtain SSL certificate for taduma.me
sudo certbot --nginx -d taduma.me -d www.taduma.me
```

### 3. Auto-renewal Setup

```bash
# Add to crontab
sudo crontab -e

# Add this line for auto-renewal (runs twice daily)
0 12 * * * /usr/bin/certbot renew --quiet
```

## Deployment Steps

### 1. On Production Server

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio.git
cd portfolio/frontend

# Create environment file if needed
touch .env.production

# Build and start with Docker Compose
docker-compose up -d --build

# Check if container is running
docker-compose ps
docker-compose logs portfolio-frontend
```

### 2. Configure Nginx

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Enable nginx to start on boot
sudo systemctl enable nginx
```

### 3. Verify Deployment

```bash
# Check if the application is accessible
curl http://localhost:3000

# Check SSL certificate
curl -I https://taduma.me

# Monitor logs
tail -f /var/log/nginx/portfolio_access.log
docker-compose logs -f portfolio-frontend
```

## Production Environment Variables

Create `.env.production` in the frontend directory:

```env
NODE_ENV=production
ASTRO_TELEMETRY_DISABLED=1
```

## Maintenance Scripts

### Update Script (`update.sh`)

```bash
#!/bin/bash
set -e

echo "Updating Portfolio Frontend..."

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose up -d --build

# Clean up unused images
docker image prune -f

echo "Update complete!"
```

### Backup Script (`backup.sh`)

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups/portfolio"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf "$BACKUP_DIR/portfolio_app_$DATE.tar.gz" .

# Backup nginx logs
tar -czf "$BACKUP_DIR/portfolio_logs_$DATE.tar.gz" logs/

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_DIR/portfolio_app_$DATE.tar.gz"
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   docker-compose logs portfolio-frontend
   docker-compose down && docker-compose up -d
   ```

2. **Nginx 502 Bad Gateway**
   ```bash
   # Check if container is running
   docker-compose ps
   
   # Check nginx configuration
   sudo nginx -t
   
   # Restart nginx
   sudo systemctl restart nginx
   ```

3. **SSL certificate issues**
   ```bash
   # Renew certificate manually
   sudo certbot renew --force-renewal -d taduma.me
   
   # Check certificate expiry
   sudo certbot certificates
   ```

4. **Build failures**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose up -d --build --force-recreate
   ```

### Monitoring Commands

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs -f portfolio-frontend

# Check resource usage
docker stats portfolio-frontend

# Check nginx access logs
tail -f /var/log/nginx/portfolio_access.log

# Check nginx error logs
tail -f /var/log/nginx/portfolio_error.log
```

### Performance Optimization

1. **Enable HTTP/2 and compression** (already configured in nginx)
2. **Use CDN** for static assets if needed
3. **Monitor response times** with tools like New Relic or DataDog
4. **Set up log rotation**:

```bash
# Add to /etc/logrotate.d/portfolio
/var/log/nginx/portfolio*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        systemctl reload nginx
    endscript
}
```

## Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled
- [ ] Firewall configured (only ports 80, 443, and SSH open)
- [ ] Regular security updates scheduled
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented

## Next Steps (Backend Integration)

When ready to add the backend:

1. Update `docker-compose.yml` to include backend service
2. Modify nginx configuration to proxy `/api/*` to backend
3. Set up database service if needed
4. Configure environment variables for backend communication

---

**Note**: This guide is configured for the domain `taduma.me`. All SSL certificates and Nginx configurations are set up for this domain.
