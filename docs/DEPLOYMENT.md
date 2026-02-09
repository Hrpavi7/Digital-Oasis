# Digital Oasis Deployment Guide

## Table of Contents
1. [Deployment Overview](#deployment-overview)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [Production Configuration](#production-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Rollback Procedures](#rollback-procedures)
8. [Security Considerations](#security-considerations)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

## Deployment Overview

### Deployment Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Content Delivery Network (CDN)             │  │
│  │  • Static assets (JS, CSS, images)                    │  │
│  │  • Global edge locations                              │  │
│  │  • Caching strategy                                   │  │
│  └─────────────────────────────┬─────────────────────────────┘  │
│                                │                             │
│  ┌─────────────────────────────┴─────────────────────────────┐  │
│  │                 Web Server / Load Balancer               │  │
│  │  • Nginx / Apache                                       │  │
│  │  • SSL termination                                      │  │
│  │  • Load balancing                                       │  │
│  │  • Rate limiting                                        │  │
│  └─────────────────────────────┬─────────────────────────────┘  │
│                                │                             │
│  ┌─────────────────────────────┴─────────────────────────────┐  │
│  │                    Application Server                     │  │
│  │  • Digital Oasis Frontend (React/Vite)                 │  │
│  │  • Built assets served from /dist                       │  │
│  │  • Environment-specific configuration                   │  │
│  └─────────────────────────────┬─────────────────────────────┘  │
│                                │                             │
│  ┌─────────────────────────────┴─────────────────────────────┐  │
│  │              Backend Integration Layer                    │  │
│  │  • Base44 API integration                                │  │
│  │  • WebSocket connections                                  │  │
│  │  • Authentication proxy                                   │  │
│  │  • Data synchronization                                   │  │
│  └─────────────────────────────┬─────────────────────────────┘  │
│                                │                             │
│  ┌─────────────────────────────┴─────────────────────────────┐  │
│  │              External Services Integration                │  │
│  │  • Base44 Platform APIs                                   │  │
│  │  • AI/ML services                                        │  │
│  │  • Analytics services                                     │  │
│  │  • Monitoring services                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] Security headers configured
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Monitoring and logging setup
- [ ] Backup procedures in place
- [ ] Rollback plan documented
- [ ] Performance benchmarks established
- [ ] Security scan completed

## Environment Setup

### Production Environment Variables
```bash
# Application Configuration
VITE_APP_NAME="Digital Oasis"
VITE_APP_VERSION="1.0.0"
VITE_ENVIRONMENT="production"
VITE_API_URL="https://api.base44.com"
VITE_WEBSOCKET_URL="wss://ws.base44.com"

# Authentication
VITE_AUTH_DOMAIN="your-auth0-domain.auth0.com"
VITE_AUTH_CLIENT_ID="your-auth0-client-id"
VITE_AUTH_AUDIENCE="https://api.base44.com"
VITE_AUTH_REDIRECT_URI="https://app.digitaloasis.com/callback"

# API Configuration
VITE_API_BASE_URL="https://api.base44.com/v1"
VITE_API_TIMEOUT=30000
VITE_API_RETRY_COUNT=3
VITE_API_RETRY_DELAY=1000

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_AI_ASSISTANT=true

# External Services
VITE_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
VITE_MIXPANEL_TOKEN="your-mixpanel-token"
VITE_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Performance
VITE_ENABLE_CODE_SPLITTING=true
VITE_ENABLE_LAZY_LOADING=true
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_PREFETCHING=true
```

### Development Environment Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.development

# Configure development variables
echo "VITE_API_URL=http://localhost:3000/api" >> .env.development
echo "VITE_ENVIRONMENT=development" >> .env.development

# Start development server
npm run dev
```

### Staging Environment Setup
```bash
# Build for staging
npm run build:staging

# Deploy to staging server
npm run deploy:staging

# Run staging tests
npm run test:staging
```

## Build Process

### Build Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'data-vendor': ['@tanstack/react-query', 'axios'],
          'utils-vendor': ['date-fns', 'lodash-es'],
        },
      },
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
  },
  
  // Optimize for production
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
```

### Build Scripts
```json
{
  "scripts": {
    "build": "vite build",
    "build:staging": "NODE_ENV=staging vite build --mode staging",
    "build:production": "NODE_ENV=production vite build --mode production",
    "build:analyze": "vite build && npx vite-bundle-analyzer dist",
    "preview": "vite preview",
    "serve": "serve -s dist -l 4173"
  }
}
```

### Build Process Steps
```bash
# 1. Clean previous build
rm -rf dist/

# 2. Run type checking
npm run type-check

# 3. Run linting
npm run lint

# 4. Run tests
npm run test:ci

# 5. Build application
npm run build:production

# 6. Verify build output
ls -la dist/
du -sh dist/

# 7. Run security audit
npm audit --production

# 8. Generate build report
npm run build:analyze
```

## Deployment Options

### Option 1: Static Hosting (Recommended)

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=dist

# Configure build settings
netlify build:settings
```

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Configure environment variables
vercel env add VITE_API_URL production
```

#### GitHub Pages Deployment
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Configure package.json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://your-username.github.io/digital-oasis"
}

# Deploy
npm run deploy
```

### Option 2: Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build:production

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (if using)
COPY ssl/ /etc/nginx/ssl/

# Expose port
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose Configuration
```yaml
version: '3.8'

services:
  digital-oasis:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_URL=https://api.base44.com
      - VITE_ENVIRONMENT=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Load balancer
  nginx-lb:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - digital-oasis
    restart: unless-stopped
```

### Option 3: Cloud Platform Deployment

#### AWS Deployment
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create S3 bucket for static hosting
aws s3 mb s3://digital-oasis-production

# Enable static website hosting
aws s3 website s3://digital-oasis-production --index-document index.html

# Deploy to S3
aws s3 sync dist/ s3://digital-oasis-production --delete

# Configure CloudFront distribution
aws cloudfront create-distribution --origin-domain-name digital-oasis-production.s3.amazonaws.com
```

#### Google Cloud Platform Deployment
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash

# Initialize gcloud
gcloud init

# Create storage bucket
gsutil mb -p your-project-id gs://digital-oasis-production

# Deploy to bucket
gsutil -m rsync -r -d dist/ gs://digital-oasis-production

# Configure website settings
gsutil web set -m index.html -e index.html gs://digital-oasis-production
```

## Production Configuration

### Nginx Configuration
```nginx
# nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
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
    client_max_body_size 16M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/rss+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/svg+xml
        image/x-icon
        text/css
        text/plain
        text/x-component;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.base44.com wss://ws.base44.com;";

    # SSL configuration (if using HTTPS)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=static:10m rate=30r/s;

    # Upstream configuration
    upstream backend {
        server api.base44.com:443;
        keepalive 32;
    }

    # HTTP server (redirect to HTTPS)
    server {
        listen 80;
        server_name app.digitaloasis.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name app.digitaloasis.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Root directory
        root /usr/share/nginx/html;
        index index.html;

        # Security
        location ~ /\. {
            deny all;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Frame-Options DENY;
            add_header X-Content-Type-Options nosniff;
            limit_req zone=static burst=50 nodelay;
        }

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass https://backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # WebSocket proxy
        location /ws/ {
            proxy_pass https://backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Main application
        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Environment-Specific Configuration

#### Production Config
```javascript
// config/production.js
export const config = {
  environment: 'production',
  api: {
    baseURL: 'https://api.base44.com/v1',
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
  },
  features: {
    analytics: true,
    errorTracking: true,
    gamification: true,
    aiAssistant: true,
    serviceWorker: true,
  },
  performance: {
    enableCodeSplitting: true,
    enableLazyLoading: true,
    enablePrefetching: true,
    enableCompression: true,
  },
  security: {
    enableCSRFProtection: true,
    enableXSSProtection: true,
    enableContentSecurityPolicy: true,
    enableHTTPS: true,
  },
  monitoring: {
    enablePerformanceTracking: true,
    enableErrorTracking: true,
    enableUserTracking: true,
  },
};
```

#### Staging Config
```javascript
// config/staging.js
export const config = {
  environment: 'staging',
  api: {
    baseURL: 'https://api-staging.base44.com/v1',
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
  },
  features: {
    analytics: true,
    errorTracking: true,
    gamification: true,
    aiAssistant: true,
    serviceWorker: false,
  },
  performance: {
    enableCodeSplitting: true,
    enableLazyLoading: true,
    enablePrefetching: false,
    enableCompression: true,
  },
  security: {
    enableCSRFProtection: true,
    enableXSSProtection: true,
    enableContentSecurityPolicy: true,
    enableHTTPS: true,
  },
  monitoring: {
    enablePerformanceTracking: true,
    enableErrorTracking: true,
    enableUserTracking: false,
  },
};
```

## Monitoring and Maintenance

### Health Checks
```javascript
// health-check.js
const healthCheck = async () => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {},
  };

  try {
    // API connectivity check
    const apiResponse = await fetch('/api/health', {
      timeout: 5000,
    });
    checks.checks.api = {
      status: apiResponse.ok ? 'healthy' : 'unhealthy',
      responseTime: apiResponse.headers.get('X-Response-Time'),
    };

    // Database connectivity check
    const dbResponse = await fetch('/api/database/health', {
      timeout: 5000,
    });
    checks.checks.database = {
      status: dbResponse.ok ? 'healthy' : 'unhealthy',
      latency: dbResponse.headers.get('X-Database-Latency'),
    };

    // Memory usage check
    checks.checks.memory = {
      status: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning',
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
    };

    // Disk space check
    const diskUsage = await getDiskUsage();
    checks.checks.disk = {
      status: diskUsage.free > 1024 * 1024 * 1024 ? 'healthy' : 'warning',
      free: diskUsage.free,
      total: diskUsage.total,
    };

    // Overall status
    const hasUnhealthy = Object.values(checks.checks).some(check => check.status === 'unhealthy');
    const hasWarnings = Object.values(checks.checks).some(check => check.status === 'warning');
    
    checks.status = hasUnhealthy ? 'unhealthy' : hasWarnings ? 'warning' : 'healthy';

  } catch (error) {
    checks.status = 'unhealthy';
    checks.error = error.message;
  }

  return checks;
};
```

### Performance Monitoring
```javascript
// performance-monitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: [],
      apiResponseTime: [],
      memoryUsage: [],
      errorCount: 0,
      userCount: 0,
    };
    
    this.thresholds = {
      pageLoadTime: 3000,
      apiResponseTime: 1000,
      memoryUsage: 500 * 1024 * 1024, // 500MB
      errorRate: 0.05, // 5%
    };
  }

  trackPageLoadTime(startTime) {
    const loadTime = performance.now() - startTime;
    this.metrics.pageLoadTime.push(loadTime);
    
    if (loadTime > this.thresholds.pageLoadTime) {
      this.sendAlert('High page load time', { loadTime });
    }
  }

  trackApiResponseTime(endpoint, startTime) {
    const responseTime = performance.now() - startTime;
    this.metrics.apiResponseTime.push({ endpoint, responseTime });
    
    if (responseTime > this.thresholds.apiResponseTime) {
      this.sendAlert('High API response time', { endpoint, responseTime });
    }
  }

  trackMemoryUsage() {
    const memoryUsage = process.memoryUsage().heapUsed;
    this.metrics.memoryUsage.push(memoryUsage);
    
    if (memoryUsage > this.thresholds.memoryUsage) {
      this.sendAlert('High memory usage', { memoryUsage });
    }
  }

  trackError(error) {
    this.metrics.errorCount++;
    
    // Send to error tracking service
    errorTracker.captureException(error);
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgPageLoadTime: this.getAverage(this.metrics.pageLoadTime),
      avgApiResponseTime: this.getAverage(this.metrics.apiResponseTime.map(m => m.responseTime)),
      currentMemoryUsage: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1],
    };
  }

  getAverage(arr) {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  sendAlert(message, data) {
    // Send alert to monitoring service
    monitoringService.sendAlert({
      message,
      data,
      timestamp: new Date().toISOString(),
      severity: 'warning',
    });
  }
}
```

### Log Management
```javascript
// logging-config.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'digital-oasis' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Log rotation
const DailyRotateFile = require('winston-daily-rotate-file');

const transport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

logger.add(transport);
```

## Rollback Procedures

### Automated Rollback
```bash
#!/bin/bash
# rollback.sh

set -e

ENVIRONMENT=$1
PREVIOUS_VERSION=$2
CURRENT_VERSION=$3

if [ -z "$ENVIRONMENT" ] || [ -z "$PREVIOUS_VERSION" ] || [ -z "$CURRENT_VERSION" ]; then
    echo "Usage: ./rollback.sh <environment> <previous_version> <current_version>"
    exit 1
fi

echo "Rolling back from $CURRENT_VERSION to $PREVIOUS_VERSION in $ENVIRONMENT..."

# Backup current deployment
echo "Creating backup of current deployment..."
tar -czf "backups/deployment-${CURRENT_VERSION}-$(date +%Y%m%d-%H%M%S).tar.gz" dist/

# Download previous version
echo "Downloading previous version..."
curl -o "releases/${PREVIOUS_VERSION}.tar.gz" "https://releases.digitaloasis.com/${PREVIOUS_VERSION}.tar.gz"

# Extract previous version
echo "Extracting previous version..."
tar -xzf "releases/${PREVIOUS_VERSION}.tar.gz" -C dist/

# Update configuration
echo "Updating configuration..."
cp "config/${ENVIRONMENT}.env" dist/.env

# Restart services
echo "Restarting services..."
systemctl restart nginx

# Verify rollback
echo "Verifying rollback..."
curl -f http://localhost/health || {
    echo "Rollback verification failed!"
    exit 1
}

echo "Rollback completed successfully!"
```

### Manual Rollback Steps
1. **Identify the issue**
   - Check monitoring dashboards
   - Review error logs
   - Assess user impact

2. **Prepare rollback**
   - Locate previous stable version
   - Verify backup availability
   - Notify stakeholders

3. **Execute rollback**
   - Stop current deployment
   - Restore previous version
   - Update configuration
   - Restart services

4. **Verify rollback**
   - Check health endpoints
   - Monitor error rates
   - Validate functionality
   - Confirm user access

5. **Document rollback**
   - Record rollback reason
   - Document timeline
   - Update runbooks
   - Schedule post-mortem

## Security Considerations

### Security Headers
```javascript
// security-headers.js
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.base44.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.base44.com wss://ws.base44.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// Apply security headers
Object.entries(securityHeaders).forEach(([key, value]) => {
  res.setHeader(key, value);
});
```

### Environment Variable Security
```bash
# Secure environment variable handling
# .env.production (never commit to version control)

# Use secure secret management
export VAULT_ADDR="https://vault.company.com"
export VAULT_TOKEN="s.XXXXXXXXXXXXXXXX"

# Retrieve secrets from vault
export VITE_API_KEY=$(vault kv get -field=api_key secret/digital-oasis)
export VITE_DATABASE_URL=$(vault kv get -field=database_url secret/digital-oasis)

# Rotate secrets regularly
vault kv rotate secret/digital-oasis
```

### SSL/TLS Configuration
```nginx
# SSL configuration for production
server {
    listen 443 ssl http2;
    server_name app.digitaloasis.com;

    # SSL certificates
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # SSL session configuration
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/chain.pem;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
}
```

## Performance Optimization

### Asset Optimization
```javascript
// webpack-optimization.js
const optimization = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
        chunks: 'all',
      },
      common: {
        name: 'common',
        minChunks: 2,
        priority: 5,
        chunks: 'all',
        reuseExistingChunk: true,
      },
    },
  },
  
  runtimeChunk: {
    name: 'runtime',
  },
  
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
        },
        format: {
          comments: false,
        },
        mangle: {
          safari10: true,
        },
      },
      extractComments: false,
    }),
    
    new CssMinimizerPlugin({
      minimizerOptions: {
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
          },
        ],
      },
    }),
  ],
};
```

### Caching Strategy
```nginx
# Caching configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    # ETags
    etag on;
    
    # Compression
    gzip_static on;
    brotli_static on;
}

# API response caching
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 302 5m;
    proxy_cache_valid 404 1m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    proxy_cache_lock on;
}
```

### CDN Configuration
```javascript
// cdn-config.js
const cdnConfig = {
  cloudflare: {
    zoneId: 'your-zone-id',
    apiToken: 'your-api-token',
    settings: {
      cacheLevel: 'cache_everything',
      browserCacheTTL: 31536000, // 1 year
      alwaysOnline: 'on',
      developmentMode: 'off',
      minify: {
        css: 'on',
        html: 'on',
        js: 'on',
      },
      rocketLoader: 'off',
      brotli: 'on',
      polish: 'lossless',
      mirage: 'on',
    },
  },
  
  awsCloudFront: {
    distributionId: 'your-distribution-id',
    settings: {
      defaultTTL: 31536000,
      maxTTL: 31536000,
      minTTL: 0,
      compress: true,
      priceClass: 'PriceClass_All',
      httpVersion: 'http2',
    },
  },
};
```

## Troubleshooting

### Common Issues and Solutions

#### Build Failures
```bash
# Issue: Build fails with memory error
# Solution: Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Issue: Build fails due to missing dependencies
# Solution: Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Issue: Build fails due to TypeScript errors
# Solution: Check TypeScript configuration
npm run type-check
```

#### Deployment Issues
```bash
# Issue: 404 errors after deployment
# Solution: Check routing configuration
# For SPA, ensure server redirects to index.html

# Issue: API calls failing
# Solution: Check CORS configuration
# Verify API endpoint URLs in environment variables

# Issue: Static assets not loading
# Solution: Check file permissions and paths
chmod -R 755 dist/
```

#### Performance Issues
```bash
# Issue: Slow page load times
# Solution: Enable compression and caching
# Check bundle size with: npm run build:analyze

# Issue: High memory usage
# Solution: Implement code splitting
# Optimize images and assets

# Issue: API response timeouts
# Solution: Increase timeout values
# Implement retry logic with exponential backoff
```

### Debugging Tools
```javascript
// debug-tools.js
const debugTools = {
  // Performance profiling
  profilePerformance: () => {
    const startTime = performance.now();
    
    // Your code here
    
    const endTime = performance.now();
    console.log(`Execution time: ${endTime - startTime}ms`);
  },
  
  // Memory usage tracking
  trackMemoryUsage: () => {
    const memoryUsage = process.memoryUsage();
    console.log('Memory usage:', {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100} MB`,
    });
  },
  
  // Bundle analysis
  analyzeBundle: () => {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    return new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
    });
  },
};
```

### Support Resources
- **Documentation**: Check project documentation and README files
- **Logs**: Review application and server logs for error details
- **Monitoring**: Use monitoring dashboards to identify issues
- **Community**: Reach out to the development team or community forums
- **Vendors**: Contact service providers (Base44, hosting platforms) for support

This deployment guide provides comprehensive instructions for deploying the Digital Oasis application to production environments. Follow the steps carefully and adapt them to your specific infrastructure requirements. Always test deployments in staging environments before promoting to production.