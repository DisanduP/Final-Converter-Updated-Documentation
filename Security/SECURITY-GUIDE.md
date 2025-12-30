# Security Guide

This guide covers security considerations, best practices, and vulnerability management for the Mermaid to Draw.io Converter.

## Security Overview

The Mermaid to Draw.io Converter processes user-provided Mermaid diagram code and converts it to Draw.io format using browser automation. This involves several security considerations:

- **Input Validation**: Ensuring safe processing of user input
- **Browser Security**: Managing headless browser instances securely
- **API Security**: Protecting API endpoints and authentication
- **Data Protection**: Handling sensitive diagram content
- **Infrastructure Security**: Securing deployment environments

## Input Validation & Sanitization

### Mermaid Code Validation

```javascript
// Secure input validation
class SecureDiagramValidator {
  constructor() {
    this.maxSize = 1024 * 1024; // 1MB limit
    this.allowedChars = /^[a-zA-Z0-9\s\[\]\(\)\{\}\-\>\|\+\=\*\.\,\'\"\#\!\?\:\;\&\^\%\$\@\~\`]*$/;
    this.forbiddenPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
  }

  validate(input) {
    // Size check
    if (input.length > this.maxSize) {
      throw new Error('Input size exceeds maximum allowed limit');
    }

    // Character validation
    if (!this.allowedChars.test(input)) {
      throw new Error('Input contains invalid characters');
    }

    // Pattern check
    for (const pattern of this.forbiddenPatterns) {
      if (pattern.test(input)) {
        throw new Error('Input contains potentially malicious content');
      }
    }

    return true;
  }

  sanitize(input) {
    // Remove potentially dangerous content
    let sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:[^\'\"\s]*/gi, '')
      .replace(/on\w+\s*=\s*[^\'\"\s]*/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '');

    return sanitized;
  }
}
```

### File Upload Security

```javascript
// Secure file upload handling
const multer = require('multer');
const fileType = require('file-type');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/octet-stream'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }

    // Check file extension
    const allowedExtensions = ['.mmd', '.mermaid', '.txt', '.md'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      return cb(new Error('Invalid file extension'), false);
    }

    cb(null, true);
  }
});

// Usage in Express route
app.post('/upload', upload.single('diagram'), async (req, res) => {
  try {
    const fileContent = req.file.buffer.toString('utf8');
    const validator = new SecureDiagramValidator();

    // Validate content
    validator.validate(fileContent);

    // Process diagram
    const result = await converter.convert(fileContent);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## API Security

### Authentication & Authorization

```javascript
// JWT-based authentication
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET;
    this.saltRounds = 12;
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      this.secretKey,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

// API middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based authorization
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage
app.post('/convert', authenticate, authorize(['user', 'admin']), async (req, res) => {
  // Conversion logic
});
```

### Rate Limiting

```javascript
// Rate limiting implementation
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, maxRequests, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: maxRequests,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// API rate limits
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts'
);

const apiLimiter = createRateLimit(
  60 * 1000, // 1 minute
  100, // 100 requests
  'Too many API requests'
);

const conversionLimiter = createRateLimit(
  60 * 1000, // 1 minute
  50, // 50 conversions
  'Too many conversion requests'
);

// Apply rate limits
app.use('/auth/login', authLimiter);
app.use('/api', apiLimiter);
app.use('/convert', conversionLimiter);
```

### API Key Management

```javascript
// Secure API key management
class ApiKeyManager {
  constructor(redis) {
    this.redis = redis;
    this.keyPrefix = 'api_key:';
    this.usagePrefix = 'api_usage:';
  }

  async generateKey(userId, permissions = ['convert']) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const hashedKey = await bcrypt.hash(apiKey, 10);

    // Store hashed key
    await this.redis.set(`${this.keyPrefix}${hashedKey}`, JSON.stringify({
      userId,
      permissions,
      createdAt: Date.now(),
      active: true
    }));

    return apiKey;
  }

  async validateKey(apiKey) {
    const hashedKey = await bcrypt.hash(apiKey, 10);
    const keyData = await this.redis.get(`${this.keyPrefix}${hashedKey}`);

    if (!keyData) {
      return null;
    }

    const data = JSON.parse(keyData);

    if (!data.active) {
      return null;
    }

    // Track usage
    await this.trackUsage(data.userId);

    return data;
  }

  async revokeKey(apiKey) {
    const hashedKey = await bcrypt.hash(apiKey, 10);
    await this.redis.del(`${this.keyPrefix}${hashedKey}`);
  }

  async trackUsage(userId) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${this.usagePrefix}${userId}:${today}`;

    await this.redis.incr(key);
    await this.redis.expire(key, 86400 * 30); // 30 days
  }

  async getUsage(userId, days = 30) {
    const usage = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const key = `${this.usagePrefix}${userId}:${dateStr}`;

      usage[dateStr] = parseInt(await this.redis.get(key) || '0');
    }

    return usage;
  }
}
```

## Browser Security

### Sandboxed Browser Execution

```javascript
// Secure browser configuration
const puppeteer = require('puppeteer');

class SecureBrowserManager {
  constructor() {
    this.browser = null;
    this.maxPages = 10;
    this.activePages = 0;
  }

  async launchBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Important for security
        '--disable-gpu',
        '--disable-web-security', // Controlled environment
        '--disable-features=VizDisplayCompositor'
      ],
      timeout: 10000,
      ignoreHTTPSErrors: false,
      ignoreDefaultArgs: ['--disable-extensions']
    });

    return this.browser;
  }

  async createSecurePage() {
    if (this.activePages >= this.maxPages) {
      throw new Error('Maximum concurrent pages exceeded');
    }

    const page = await this.browser.newPage();
    this.activePages++;

    // Security settings
    await page.setJavaScriptEnabled(true);
    await page.setBypassCSP(false);

    // Resource restrictions
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      const url = request.url();

      // Block external resources
      if (resourceType === 'image' || resourceType === 'media' ||
          resourceType === 'font' || resourceType === 'stylesheet') {
        if (!url.startsWith('data:') && !url.includes('localhost')) {
          request.abort();
          return;
        }
      }

      // Block external scripts
      if (resourceType === 'script' && !url.includes('localhost')) {
        request.abort();
        return;
      }

      request.continue();
    });

    // Timeout protection
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    return page;
  }

  async closePage(page) {
    if (page && !page.isClosed()) {
      await page.close();
      this.activePages--;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.activePages = 0;
    }
  }
}
```

### Content Security Policy

```javascript
// CSP headers for web interface
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
```

## Data Protection

### Encryption at Rest

```javascript
// Data encryption utilities
const crypto = require('crypto');

class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }

  generateKey() {
    return crypto.randomBytes(this.keyLength);
  }

  encrypt(text, key) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData, key) {
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Database encryption
class EncryptedDatabase {
  constructor(db, encryptionKey) {
    this.db = db;
    this.encryption = new DataEncryption();
    this.key = encryptionKey;
  }

  async saveDiagram(userId, diagramData) {
    const encrypted = this.encryption.encrypt(
      JSON.stringify(diagramData),
      this.key
    );

    await this.db.diagrams.insert({
      userId,
      encryptedData: encrypted.encrypted,
      iv: encrypted.iv,
      tag: encrypted.tag,
      createdAt: new Date()
    });
  }

  async getDiagram(diagramId) {
    const record = await this.db.diagrams.findOne({ _id: diagramId });

    const decrypted = this.encryption.decrypt({
      encrypted: record.encryptedData,
      iv: record.iv,
      tag: record.tag
    }, this.key);

    return JSON.parse(decrypted);
  }
}
```

### Secure Logging

```javascript
// Secure logging implementation
const winston = require('winston');

class SecureLogger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'mermaid-converter' },
      transports: [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5
        })
      ]
    });

    // Add console logging in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }

  // Sanitize log data to prevent sensitive information leakage
  sanitizeLogData(data) {
    const sensitiveFields = ['password', 'apiKey', 'token', 'secret'];

    const sanitize = (obj) => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      const sanitized = Array.isArray(obj) ? [] : {};

      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(value);
        }
      }

      return sanitized;
    };

    return sanitize(data);
  }

  info(message, meta = {}) {
    this.logger.info(message, this.sanitizeLogData(meta));
  }

  error(message, error = null, meta = {}) {
    const logData = { ...meta };
    if (error) {
      logData.error = {
        message: error.message,
        stack: error.stack
      };
    }
    this.logger.error(message, this.sanitizeLogData(logData));
  }

  warn(message, meta = {}) {
    this.logger.warn(message, this.sanitizeLogData(meta));
  }
}
```

## Infrastructure Security

### Docker Security

```dockerfile
# Secure Dockerfile
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=nextjs:nodejs package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=nextjs:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown -R nextjs:nodejs logs

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### Kubernetes Security

```yaml
# Secure Kubernetes deployment
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
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
      containers:
      - name: converter
        image: mermaid-converter:latest
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 100m
            memory: 128Mi
        env:
        - name: NODE_ENV
          value: "production"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: converter-secrets
              key: jwt-secret
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: tmp
        emptyDir: {}
      - name: logs
        emptyDir: {}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: converter-network-policy
spec:
  podSelector:
    matchLabels:
      app: mermaid-converter
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: converter-frontend
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: converter-db
    ports:
    - protocol: TCP
      port: 5432
  - to: []
    ports:
    - protocol: TCP
      port: 443  # HTTPS only
```

## Vulnerability Management

### Dependency Scanning

```bash
# NPM audit and dependency checking
npm audit --audit-level high
npm audit fix

# Use Snyk for vulnerability scanning
npx snyk test
npx snyk monitor

# Check for outdated dependencies
npm outdated
npm update --save
```

### Security Headers Check

```javascript
// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  next();
};

app.use(securityHeaders);
```

### Security Monitoring

```javascript
// Security event monitoring
class SecurityMonitor {
  constructor(logger, alertService) {
    this.logger = logger;
    this.alertService = alertService;
    this.suspiciousPatterns = [
      /<script/i,
      /union.*select/i,
      /\.\./,  // Directory traversal
      /eval\(/i,
      /exec\(/i
    ];
  }

  monitorRequest(req) {
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');
    const requestData = JSON.stringify(req.body);

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(requestData)) {
        this.logger.warn('Suspicious request detected', {
          ip: clientIP,
          userAgent,
          pattern: pattern.source,
          endpoint: req.path
        });

        this.alertService.sendAlert({
          type: 'suspicious_request',
          ip: clientIP,
          pattern: pattern.source,
          endpoint: req.path
        });

        return true;
      }
    }

    return false;
  }

  monitorConversion(input, output, duration) {
    // Monitor conversion performance
    if (duration > 30000) { // 30 seconds
      this.logger.warn('Slow conversion detected', {
        inputSize: input.length,
        outputSize: output.length,
        duration
      });
    }

    // Monitor output size (potential DoS)
    if (output.length > 10 * 1024 * 1024) { // 10MB
      this.logger.warn('Large output detected', {
        inputSize: input.length,
        outputSize: output.length
      });

      this.alertService.sendAlert({
        type: 'large_output',
        inputSize: input.length,
        outputSize: output.length
      });
    }
  }
}
```

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor logs for suspicious activity
   - Set up alerts for security events
   - Regular security scans

2. **Assessment**
   - Determine scope of incident
   - Identify affected systems/data
   - Assess potential impact

3. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Implement temporary security measures

4. **Recovery**
   - Restore from clean backups
   - Patch vulnerabilities
   - Update security measures

5. **Lessons Learned**
   - Document incident details
   - Update security procedures
   - Improve monitoring/alerting

### Vulnerability Disclosure

```markdown
# Vulnerability Disclosure Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in the Mermaid to Draw.io Converter, please help us by reporting it responsibly.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:
- security@mermaid-converter.com

### What to Include

When reporting a vulnerability, please include:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any suggested fixes or mitigations

### Our Commitment

- We will acknowledge receipt of your report within 48 hours
- We will provide regular updates on our progress
- We will credit you (if desired) once the issue is resolved
- We will not take legal action against security researchers

### Scope

This policy applies to:
- The Mermaid to Draw.io Converter core application
- Official APIs and SDKs
- Official documentation and websites

### Safe Harbor

We consider security research conducted in accordance with this policy to be authorized, and we will not initiate legal action against researchers who follow these guidelines.
```

## Compliance

### GDPR Compliance

```javascript
// GDPR-compliant data handling
class GDPRCompliantStorage {
  constructor(db) {
    this.db = db;
  }

  async storeUserData(userId, data, consentGiven = false) {
    if (!consentGiven) {
      throw new Error('User consent required for data storage');
    }

    const encryptedData = await this.encryptData(data);

    await this.db.userData.insert({
      userId,
      data: encryptedData,
      consentGiven: true,
      consentDate: new Date(),
      dataRetention: 2555, // Days (7 years for GDPR)
      createdAt: new Date()
    });
  }

  async deleteUserData(userId) {
    // GDPR right to erasure
    await this.db.userData.deleteMany({ userId });
    await this.db.conversions.deleteMany({ userId });
    await this.db.logs.deleteMany({ userId });

    this.logger.info('User data deleted', { userId });
  }

  async exportUserData(userId) {
    // GDPR right to data portability
    const userData = await this.db.userData.find({ userId });
    const conversions = await this.db.conversions.find({ userId });

    return {
      userData: await this.decryptData(userData),
      conversions,
      exportDate: new Date()
    };
  }

  async anonymizeOldData() {
    const sevenYearsAgo = new Date();
    sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

    // Anonymize data older than retention period
    await this.db.conversions.updateMany(
      { createdAt: { $lt: sevenYearsAgo } },
      {
        $set: { userId: 'anonymized' },
        $unset: { userEmail: 1, userIP: 1 }
      }
    );
  }
}
```

### SOC 2 Compliance

```javascript
// SOC 2 audit logging
class SOC2AuditLogger {
  constructor(db, encryption) {
    this.db = db;
    this.encryption = encryption;
  }

  async logSecurityEvent(eventType, details, userId = null) {
    const auditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType,
      details: await this.encryption.encrypt(JSON.stringify(details)),
      userId,
      sourceIP: this.getClientIP(),
      userAgent: this.getUserAgent(),
      sessionId: this.getSessionId()
    };

    await this.db.auditLog.insert(auditEntry);

    // Log to external SIEM if configured
    if (process.env.SIEM_ENDPOINT) {
      await this.sendToSIEM(auditEntry);
    }
  }

  async getAuditTrail(userId, startDate, endDate) {
    return await this.db.auditLog.find({
      userId,
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ timestamp: -1 });
  }

  async detectAnomalies() {
    // Implement anomaly detection logic
    const recentLogs = await this.db.auditLog.find({
      timestamp: { $gte: new Date(Date.now() - 3600000) } // Last hour
    });

    // Check for suspicious patterns
    const failedLogins = recentLogs.filter(log =>
      log.eventType === 'login_failed'
    );

    // Group by IP
    const loginAttempts = {};
    failedLogins.forEach(log => {
      loginAttempts[log.sourceIP] = (loginAttempts[log.sourceIP] || 0) + 1;
    });

    // Alert on brute force attempts
    for (const [ip, attempts] of Object.entries(loginAttempts)) {
      if (attempts > 10) {
        await this.alertService.sendAlert({
          type: 'brute_force_detected',
          ip,
          attempts,
          timeWindow: '1_hour'
        });
      }
    }
  }
}
```

## Best Practices Summary

### Development Security
- Input validation and sanitization
- Secure coding practices
- Regular dependency updates
- Code reviews with security focus

### Infrastructure Security
- Least privilege access
- Network segmentation
- Regular security patching
- Monitoring and alerting

### Operational Security
- Secure configuration management
- Incident response procedures
- Regular security assessments
- Employee security training

### Compliance Security
- GDPR and privacy regulations
- Industry-specific requirements
- Audit logging and monitoring
- Data encryption and protection

This security guide provides a comprehensive framework for securing the Mermaid to Draw.io Converter. Regular reviews and updates are essential to maintain security posture.
