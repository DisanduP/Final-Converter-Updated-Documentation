# Version Upgrade Guide

This guide provides step-by-step instructions for upgrading between versions of the Mermaid to Draw.io Converter.

## Quick Upgrade Commands

### Using npm
```bash
# Latest version
npm update @mermaid/converter

# Specific version
npm install @mermaid/converter@3.2.1

# Check current version
npm list @mermaid/converter
```

### Using yarn
```bash
# Latest version
yarn upgrade @mermaid/converter

# Specific version
yarn add @mermaid/converter@3.2.1

# Check current version
yarn list @mermaid/converter
```

### Using Docker
```bash
# Pull latest image
docker pull mermaid/converter:latest

# Pull specific version
docker pull mermaid/converter:3.2.1

# Check current version
docker run --rm mermaid/converter:latest --version
```

## Version 3.2.1 → 3.3.0

### New Features
- **Enhanced Security**: Improved input validation and XSS protection
- **Performance Improvements**: 40% faster conversion for large diagrams
- **New Diagram Types**: Support for Sankey diagrams and packet diagrams
- **API Enhancements**: New batch conversion endpoint

### Breaking Changes
- **None** - This is a minor version upgrade

### Upgrade Steps

1. **Update package**
   ```bash
   npm update @mermaid/converter
   ```

2. **Restart services**
   ```bash
   # If running as a service
   sudo systemctl restart mermaid-converter

   # If using PM2
   pm2 restart mermaid-converter

   # If using Docker
   docker-compose down && docker-compose up -d
   ```

3. **Verify upgrade**
   ```bash
   curl -X GET "http://localhost:8080/api/v3/health" | jq .version
   ```

### New Features Usage

#### Sankey Diagrams
```javascript
// Convert Sankey diagram
const result = await converter.convert(`
sankey-beta
Source1,Target1,Value1
Source2,Target2,Value2
`, 'sankey');
```

#### Packet Diagrams
```javascript
// Convert packet diagram
const result = await converter.convert(`
packet-beta
Sender -> Receiver: Packet
Receiver -> Sender: ACK
`, 'packet');
```

#### Batch Conversion API
```javascript
// New batch endpoint
const response = await fetch('/api/v3/convert/batch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    diagrams: [
      { id: '1', mermaid: 'flowchart TD\nA --> B' },
      { id: '2', mermaid: 'sequenceDiagram\nA->>B: Hello' }
    ],
    options: {
      format: 'drawio',
      theme: 'default'
    }
  })
});
```

## Version 3.1.0 → 3.2.1

### New Features
- **WebSocket Support**: Real-time conversion updates
- **Plugin System**: Extensible architecture for custom diagram types
- **Advanced Caching**: Redis-based caching for improved performance
- **Multi-tenant Support**: Enterprise multi-tenant deployments

### Breaking Changes
- **Configuration Structure**: New configuration sections required
- **Environment Variables**: Some variable names changed

### Upgrade Steps

1. **Backup current configuration**
   ```bash
   cp config.json config.backup.json
   cp .env .env.backup
   ```

2. **Update package**
   ```bash
   npm install @mermaid/converter@3.2.1
   ```

3. **Update configuration**
   ```javascript
   // Add to config.json
   {
     "websocket": {
       "enabled": true,
       "port": 8081
     },
     "plugins": {
       "enabled": true,
       "directory": "./plugins"
     },
     "cache": {
       "redis": {
         "url": "redis://localhost:6379"
       }
     },
     "multiTenant": {
       "enabled": false
     }
   }
   ```

4. **Update environment variables**
   ```bash
   # Add to .env
   REDIS_URL=redis://localhost:6379
   WEBSOCKET_ENABLED=true
   PLUGINS_ENABLED=true
   ```

5. **Install new dependencies**
   ```bash
   npm install redis ws
   ```

6. **Update startup script**
   ```javascript
   // server.js - add WebSocket support
   const WebSocket = require('ws');
   const wss = new WebSocket.Server({ port: 8081 });

   wss.on('connection', (ws) => {
     ws.on('message', async (message) => {
       try {
         const data = JSON.parse(message);
         const result = await converter.convert(data.mermaid);
         ws.send(JSON.stringify({ result }));
       } catch (error) {
         ws.send(JSON.stringify({ error: error.message }));
       }
     });
   });
   ```

7. **Test WebSocket functionality**
   ```javascript
   // test-websocket.js
   const WebSocket = require('ws');
   const ws = new WebSocket('ws://localhost:8081');

   ws.on('open', () => {
     ws.send(JSON.stringify({
       mermaid: 'flowchart TD\nA --> B'
     }));
   });

   ws.on('message', (data) => {
     console.log('Received:', JSON.parse(data));
     ws.close();
   });
   ```

## Version 3.0.0 → 3.1.0

### New Features
- **API Authentication**: JWT-based authentication system
- **Rate Limiting**: Built-in rate limiting for API protection
- **Enhanced Logging**: Structured logging with Winston
- **Database Integration**: MongoDB support for data persistence

### Breaking Changes
- **API Endpoints**: All endpoints now require authentication
- **Response Format**: Changed response structure for better consistency
- **Configuration**: Database configuration now required

### Upgrade Steps

1. **Install new dependencies**
   ```bash
   npm install jsonwebtoken express-rate-limit winston mongodb
   ```

2. **Update configuration**
   ```javascript
   // config.js
   module.exports = {
     server: {
       port: 8080,
       jwtSecret: process.env.JWT_SECRET
     },
     database: {
       url: process.env.MONGODB_URL
     },
     rateLimit: {
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100 // limit each IP to 100 requests per windowMs
     },
     logging: {
       level: 'info',
       file: 'logs/app.log'
     }
   };
   ```

3. **Update environment variables**
   ```bash
   # Add to .env
   JWT_SECRET=your-super-secret-jwt-key
   MONGODB_URL=mongodb://localhost:27017/converter
   ```

4. **Update API middleware**
   ```javascript
   // middleware/auth.js
   const jwt = require('jsonwebtoken');
   const rateLimit = require('express-rate-limit');

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   const authenticateToken = (req, res, next) => {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];

     if (!token) {
       return res.status(401).json({ error: 'Access token required' });
     }

     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
       if (err) {
         return res.status(403).json({ error: 'Invalid token' });
       }
       req.user = user;
       next();
     });
   };

   module.exports = { authenticateToken, limiter };
   ```

5. **Update API routes**
   ```javascript
   // routes/convert.js
   const express = require('express');
   const router = express.Router();
   const { authenticateToken, limiter } = require('../middleware/auth');

   router.post('/convert', limiter, authenticateToken, async (req, res) => {
     try {
       const { mermaid, format = 'drawio' } = req.body;

       const result = await converter.convert(mermaid, format);

       // Save to database
       await Conversion.create({
         userId: req.user.id,
         input: mermaid,
         output: result,
         format: format,
         createdAt: new Date()
       });

       res.json({
         success: true,
         data: result,
         id: conversion._id
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         error: error.message
       });
     }
   });

   module.exports = router;
   ```

6. **Update client code**
   ```javascript
   // client.js
   class ConverterClient {
     constructor(apiKey) {
       this.apiKey = apiKey;
       this.baseUrl = '/api/v3';
     }

     async login(email, password) {
       const response = await fetch(`${this.baseUrl}/auth/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password })
       });

       const data = await response.json();
       this.token = data.token;
       return data;
     }

     async convert(diagram) {
       const response = await fetch(`${this.baseUrl}/convert`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${this.token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           mermaid: diagram,
           format: 'drawio'
         })
       });

       return await response.json();
     }
   }
   ```

## Version 2.x → 3.0.0

### Major Changes
- **Complete API Rewrite**: New RESTful API design
- **Authentication Required**: All endpoints now require authentication
- **Database Integration**: MongoDB required for data persistence
- **New Configuration System**: Environment-based configuration

### Breaking Changes
- **All API endpoints changed**
- **Authentication mandatory**
- **Configuration format completely different**
- **Database now required**

### Upgrade Steps

1. **Fresh Installation Recommended**
   ```bash
   # Backup important data
   mkdir backup
   cp -r diagrams backup/
   cp config.json backup/

   # Remove old installation
   rm -rf node_modules
   rm package-lock.json

   # Fresh install
   npm install @mermaid/converter@3.0.0
   ```

2. **Setup MongoDB**
   ```bash
   # Install MongoDB (Ubuntu/Debian)
   sudo apt-get install mongodb

   # Start MongoDB
   sudo systemctl start mongodb

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **New Configuration**
   ```javascript
   // config.js
   module.exports = {
     server: {
       port: process.env.PORT || 8080,
       host: process.env.HOST || '0.0.0.0'
     },
     database: {
       url: process.env.MONGODB_URL || 'mongodb://localhost:27017/converter'
     },
     security: {
       jwtSecret: process.env.JWT_SECRET,
       bcryptRounds: 12
     },
     logging: {
       level: process.env.LOG_LEVEL || 'info'
     }
   };
   ```

4. **Environment Setup**
   ```bash
   # .env
   PORT=8080
   MONGODB_URL=mongodb://localhost:27017/converter
   JWT_SECRET=your-super-secret-jwt-key-here
   LOG_LEVEL=info
   ```

5. **Database Migration Script**
   ```javascript
   // migrate-v2-to-v3.js
   const mongoose = require('mongoose');
   const fs = require('fs');

   // Connect to MongoDB
   mongoose.connect(process.env.MONGODB_URL);

   // Define schemas
   const User = mongoose.model('User', {
     email: String,
     password: String,
     createdAt: Date
   });

   const Conversion = mongoose.model('Conversion', {
     userId: mongoose.Schema.Types.ObjectId,
     input: String,
     output: String,
     format: String,
     createdAt: Date
   });

   async function migrate() {
     try {
       // Create default admin user
       const adminUser = new User({
         email: 'admin@example.com',
         password: await bcrypt.hash('admin123', 12),
         createdAt: new Date()
       });
       await adminUser.save();

       // Migrate existing diagrams if any
       const diagrams = fs.readdirSync('./diagrams');
       for (const diagram of diagrams) {
         const content = fs.readFileSync(`./diagrams/${diagram}`, 'utf8');
         const conversion = new Conversion({
           userId: adminUser._id,
           input: content,
           output: '', // Will be converted on demand
           format: 'drawio',
           createdAt: new Date()
         });
         await conversion.save();
       }

       console.log('Migration completed');
     } catch (error) {
       console.error('Migration failed:', error);
     } finally {
       mongoose.disconnect();
     }
   }

   migrate();
   ```

6. **Update Client Applications**
   ```javascript
   // Complete client rewrite needed
   const ConverterAPI = {
     baseUrl: 'http://localhost:8080/api/v3',

     async register(email, password) {
       const response = await fetch(`${this.baseUrl}/auth/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password })
       });
       return await response.json();
     },

     async login(email, password) {
       const response = await fetch(`${this.baseUrl}/auth/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password })
       });
       const data = await response.json();
       localStorage.setItem('token', data.token);
       return data;
     },

     async convert(diagram) {
       const token = localStorage.getItem('token');
       const response = await fetch(`${this.baseUrl}/convert`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           mermaid: diagram,
           format: 'drawio'
         })
       });
       return await response.json();
     }
   };
   ```

## Version 1.x → 2.x

### Major Changes
- **API Rate Limiting**: Built-in rate limiting
- **Enhanced Security**: Input validation and sanitization
- **New Response Format**: Consistent JSON responses
- **Configuration Changes**: Environment variables required

### Breaking Changes
- **Response format changed**
- **Some configuration options renamed**
- **Rate limiting may affect existing integrations**

### Upgrade Steps

1. **Update package**
   ```bash
   npm install @mermaid/converter@2.5.0
   ```

2. **Update configuration**
   ```javascript
   // config.js - v2.x format
   module.exports = {
     port: process.env.PORT || 8080,
     rateLimit: {
       windowMs: 15 * 60 * 1000,
       max: 100
     },
     security: {
       enableValidation: true,
       sanitizeInput: true
     }
   };
   ```

3. **Update API calls**
   ```javascript
   // v1.x
   app.post('/convert', (req, res) => {
     const result = converter.convert(req.body.diagram);
     res.send(result);
   });

   // v2.x
   app.post('/convert', rateLimit, validateInput, (req, res) => {
     try {
       const result = converter.convert(req.body.mermaid);
       res.json({
         success: true,
         data: result,
         timestamp: new Date()
       });
     } catch (error) {
       res.status(400).json({
         success: false,
         error: error.message
       });
     }
   });
   ```

## Automated Upgrade Script

```bash
#!/bin/bash
# upgrade.sh - Automated upgrade script

set -e

echo "Starting Mermaid Converter upgrade..."

# Backup current version
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/" 2>/dev/null || true

echo "Backup created in $BACKUP_DIR"

# Stop services
if command -v systemctl &> /dev/null; then
    sudo systemctl stop mermaid-converter || true
fi

# Update package
npm install @mermaid/converter@latest

# Run database migrations if needed
if [ -f "migrate.js" ]; then
    node migrate.js
fi

# Update configuration if needed
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=8080
JWT_SECRET=$(openssl rand -hex 32)
MONGODB_URL=mongodb://localhost:27017/converter
EOF
fi

# Restart services
if command -v systemctl &> /dev/null; then
    sudo systemctl start mermaid-converter
fi

echo "Upgrade completed successfully!"
echo "Please check the logs and test your application."
```

## Troubleshooting Upgrades

### Common Issues

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database connection failures
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Test connection
mongosh --eval "db.runCommand({ping: 1})"
```

#### Authentication failures
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### WebSocket connection issues
```bash
# Check if port 8081 is available
netstat -tlnp | grep 8081

# Test WebSocket connection
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8081');
ws.on('open', () => { console.log('WebSocket connected'); ws.close(); });
ws.on('error', (err) => console.error('WebSocket error:', err));
"
```

### Rollback Procedures

#### Quick Rollback
```bash
# Stop services
sudo systemctl stop mermaid-converter

# Restore from backup
cp -r backup-*/* .

# Reinstall previous version
npm install @mermaid/converter@2.5.0

# Restart services
sudo systemctl start mermaid-converter
```

#### Database Rollback
```javascript
// rollback.js
const mongoose = require('mongoose');

async function rollback() {
  await mongoose.connect(process.env.MONGODB_URL);

  // Remove v3.x specific collections
  await mongoose.connection.dropCollection('conversions_v3');
  await mongoose.connection.dropCollection('plugins');

  // Restore from backup if available
  // ... rollback logic

  await mongoose.disconnect();
}

rollback().catch(console.error);
```

## Version Compatibility Matrix

| Current Version | Target Version | Migration Difficulty | Breaking Changes |
|----------------|----------------|---------------------|-------------------|
| 1.x           | 2.x           | Low                | Minor API changes |
| 2.x           | 3.0.0         | High               | Major rewrite     |
| 3.0.0         | 3.1.0         | Medium             | New dependencies  |
| 3.1.0         | 3.2.1         | Low                | New features only |
| 3.2.1         | 3.3.0         | Low                | Performance improvements |

## Support

For upgrade assistance:
- **Documentation**: Check this guide and API docs
- **Community**: GitHub Discussions
- **Professional Support**: Contact enterprise support
- **Bug Reports**: GitHub Issues

Remember to always backup before upgrading and test thoroughly in a staging environment first.
