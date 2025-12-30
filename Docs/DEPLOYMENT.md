# Deployment Guide

This guide covers deploying the Mermaid to Draw.io converter in various environments.

## Deployment Options

### 1. Local Installation

For single-user or development environments:

```bash
# Install globally
npm install -g mermaid-to-drawio

# Or install locally
npm install mermaid-to-drawio
```

### 2. Server Deployment

For multi-user or web service deployment:

#### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t mermaid-converter .
docker run -p 3000:3000 mermaid-converter
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  converter:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
      - ./outputs:/app/outputs
```

### 3. Cloud Deployment

#### Heroku

```json
// package.json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "heroku-postbuild": "npx playwright install"
  }
}
```

Deploy:

```bash
heroku create your-app-name
git push heroku main
```

#### AWS EC2

```bash
# Install dependencies
sudo yum update -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install application
git clone https://github.com/yourusername/mermaid-to-drawio.git
cd mermaid-to-drawio
npm install
npx playwright install

# Configure systemd service
sudo tee /etc/systemd/system/mermaid-converter.service > /dev/null <<EOF
[Unit]
Description=Mermaid to Draw.io Converter
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/mermaid-to-drawio
ExecStart=/home/ec2-user/.nvm/versions/node/v18.*/bin/node converter.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable mermaid-converter
sudo systemctl start mermaid-converter
```

#### AWS Lambda

```javascript
// lambda/index.js
const { convert } = require('mermaid-to-drawio');

exports.handler = async (event) => {
  try {
    const input = event.body;
    const result = await convert(input);

    return {
      statusCode: 200,
      body: result,
      headers: {
        'Content-Type': 'application/xml'
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

#### Vercel

```javascript
// api/convert.js
import { convert } from 'mermaid-to-drawio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await convert(req.body);
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### Netlify Functions

```javascript
// netlify/functions/convert.js
const { convert } = require('mermaid-to-drawio');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const result = await convert(event.body);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml'
      },
      body: result
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 4. Container Orchestration

#### Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mermaid-converter
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mermaid-converter
  template:
    metadata:
      labels:
        app: mermaid-converter
    spec:
      containers:
      - name: converter
        image: your-registry/mermaid-converter:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mermaid-converter-service
spec:
  selector:
    app: mermaid-converter
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

## Environment Configuration

### Environment Variables

```bash
# Production settings
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Performance settings
MAX_CONCURRENT_CONVERSIONS=10
CONVERSION_TIMEOUT=30000

# Security settings
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Storage settings
UPLOAD_DIR=/tmp/uploads
OUTPUT_DIR=/tmp/outputs
MAX_FILE_SIZE=10MB
```

### Configuration Files

```javascript
// config/production.js
module.exports = {
  port: process.env.PORT || 3000,
  logLevel: 'info',
  cors: {
    origin: process.env.CORS_ORIGIN || false
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100
  },
  conversion: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_CONVERSIONS) || 10,
    timeout: parseInt(process.env.CONVERSION_TIMEOUT) || 30000
  },
  storage: {
    uploadDir: process.env.UPLOAD_DIR || '/tmp/uploads',
    outputDir: process.env.OUTLOAD_DIR || '/tmp/outputs',
    maxFileSize: process.env.MAX_FILE_SIZE || '10MB'
  }
};
```

## Monitoring and Logging

### Application Logging

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

### Health Checks

```javascript
// health.js
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});

router.get('/ready', async (req, res) => {
  try {
    // Check database connections, external services, etc.
    await checkDependencies();
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

module.exports = router;
```

### Metrics

```javascript
// metrics.js
const promClient = require('prom-client');

const register = new promClient.Registry();

const conversionCounter = new promClient.Counter({
  name: 'conversions_total',
  help: 'Total number of conversions',
  labelNames: ['type', 'status']
});

const conversionDuration = new promClient.Histogram({
  name: 'conversion_duration_seconds',
  help: 'Duration of conversions',
  labelNames: ['type']
});

register.registerMetric(conversionCounter);
register.registerMetric(conversionDuration);

module.exports = {
  register,
  conversionCounter,
  conversionDuration
};
```

## Security Considerations

### HTTPS Configuration

```javascript
// server.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, app).listen(443);
```

### Rate Limiting

```javascript
// middleware/rate-limit.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

module.exports = limiter;
```

### Input Validation

```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateConversion = [
  body('mermaid')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Mermaid code must be between 1 and 10000 characters')
    .matches(/^[a-zA-Z0-9\s\{\}\(\)\[\]\|\-\>\<\=\+\*\/\,\.\:\;\'\"]+$/)
    .withMessage('Invalid characters in mermaid code'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateConversion };
```

## Performance Optimization

### Caching

```javascript
// cache.js
const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600 // 10 minutes
});

const getCachedResult = (key) => {
  return cache.get(key);
};

const setCachedResult = (key, value) => {
  cache.set(key, value);
};

module.exports = { getCachedResult, setCachedResult };
```

### Load Balancing

```nginx
# nginx.conf
upstream converter_backend {
    server converter1:3000;
    server converter2:3000;
    server converter3:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://converter_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Backup and Recovery

### Data Backup

```bash
# backup.sh
#!/bin/bash

BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup application data
cp -r /app/uploads $BACKUP_DIR/
cp -r /app/outputs $BACKUP_DIR/

# Backup configuration
cp /app/.env $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
```

### Disaster Recovery

```bash
# restore.sh
#!/bin/bash

BACKUP_FILE=$1

# Extract backup
tar -xzf $BACKUP_FILE

# Restore data
cp -r backup/uploads /app/
cp -r backup/outputs /app/

# Restore configuration
cp backup/.env /app/

# Restart services
docker-compose restart
```

## Scaling

### Horizontal Scaling

```javascript
// cluster.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process
  require('./server');
}
```

### Auto-scaling

```yaml
# k8s-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mermaid-converter-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mermaid-converter
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Maintenance

### Update Strategy

```bash
# update.sh
#!/bin/bash

# Create backup
./backup.sh

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations if any
npm run migrate

# Build application
npm run build

# Restart services
docker-compose down
docker-compose up -d

# Run health checks
curl -f http://localhost:3000/health
```

### Log Rotation

```bash
# logrotate.conf
/var/log/mermaid-converter/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload mermaid-converter
    endscript
}
```

## Troubleshooting Deployment

### Common Issues

#### Port Conflicts
```bash
# Check what's using the port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Memory Issues
```bash
# Monitor memory usage
docker stats

# Increase memory limits
docker run --memory=1g --memory-swap=2g your-image
```

#### Network Issues
```bash
# Test connectivity
curl -v http://localhost:3000/health

# Check firewall
sudo ufw status
sudo ufw allow 3000
```

### Monitoring Commands

```bash
# Check service status
systemctl status mermaid-converter

# View logs
journalctl -u mermaid-converter -f

# Check resource usage
top -p $(pgrep node)

# Test API endpoints
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: text/plain" \
  -d "graph TD; A-->B;"
```
