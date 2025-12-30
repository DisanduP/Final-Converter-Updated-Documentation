# Data Migration Guide

This guide covers migrating data between different storage systems and database formats when upgrading the Mermaid to Draw.io Converter.

## Database Migration

### MongoDB to PostgreSQL

#### Migration Script

```javascript
// mongodb-to-postgres.js
const MongoClient = require('mongodb').MongoClient;
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

class MongoToPostgresMigrator {
  constructor(mongoUrl, postgresUrl) {
    this.mongoUrl = mongoUrl;
    this.postgresUrl = postgresUrl;
  }

  async migrate() {
    const mongoClient = await MongoClient.connect(this.mongoUrl);
    const postgresPool = new Pool({ connectionString: this.postgresUrl });

    try {
      console.log('Starting MongoDB to PostgreSQL migration...');

      // Create PostgreSQL tables
      await this.createTables(postgresPool);

      // Migrate users
      await this.migrateUsers(mongoClient, postgresPool);

      // Migrate conversions
      await this.migrateConversions(mongoClient, postgresPool);

      // Migrate settings
      await this.migrateSettings(mongoClient, postgresPool);

      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      await mongoClient.close();
      await postgresPool.end();
    }
  }

  async createTables(pool) {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS conversions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        input_content TEXT NOT NULL,
        output_content TEXT,
        format VARCHAR(50) DEFAULT 'drawio',
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, setting_key)
      )`,

      `CREATE INDEX idx_conversions_user_id ON conversions(user_id)`,
      `CREATE INDEX idx_conversions_created_at ON conversions(created_at)`,
      `CREATE INDEX idx_user_settings_user_id ON user_settings(user_id)`
    ];

    for (const query of queries) {
      await pool.query(query);
    }
  }

  async migrateUsers(mongoClient, postgresPool) {
    console.log('Migrating users...');
    const users = await mongoClient.db().collection('users').find().toArray();

    for (const user of users) {
      // Hash password if not already hashed
      let passwordHash = user.password;
      if (!user.password.startsWith('$2b$')) {
        passwordHash = await bcrypt.hash(user.password, 12);
      }

      await postgresPool.query(
        'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, $3)',
        [user.email, passwordHash, user.createdAt || new Date()]
      );
    }

    console.log(`Migrated ${users.length} users`);
  }

  async migrateConversions(mongoClient, postgresPool) {
    console.log('Migrating conversions...');
    const conversions = await mongoClient.db().collection('conversions').find().toArray();

    // Get user ID mapping
    const userMapping = await this.getUserMapping(postgresPool);

    for (const conversion of conversions) {
      const userId = userMapping.get(conversion.userId?.toString());

      await postgresPool.query(
        `INSERT INTO conversions (user_id, input_content, output_content, format, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          conversion.input,
          conversion.output,
          conversion.format || 'drawio',
          conversion.createdAt || new Date()
        ]
      );
    }

    console.log(`Migrated ${conversions.length} conversions`);
  }

  async migrateSettings(mongoClient, postgresPool) {
    console.log('Migrating settings...');
    const settings = await mongoClient.db().collection('settings').find().toArray();

    const userMapping = await this.getUserMapping(postgresPool);

    for (const setting of settings) {
      const userId = userMapping.get(setting.userId?.toString());

      await postgresPool.query(
        'INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES ($1, $2, $3)',
        [userId, setting.key, JSON.stringify(setting.value)]
      );
    }

    console.log(`Migrated ${settings.length} settings`);
  }

  async getUserMapping(postgresPool) {
    const result = await postgresPool.query('SELECT id, email FROM users');
    const mapping = new Map();

    // This is a simplified mapping - in practice you'd need to map by email or other unique identifier
    result.rows.forEach(row => {
      // Assuming emails are unique, we can map by email
      mapping.set(row.email, row.id);
    });

    return mapping;
  }
}

// Usage
const migrator = new MongoToPostgresMigrator(
  'mongodb://localhost:27017/converter',
  'postgresql://user:password@localhost:5432/converter'
);

migrator.migrate().catch(console.error);
```

#### Verification Script

```javascript
// verify-migration.js
const { Pool } = require('pg');
const MongoClient = require('mongodb').MongoClient;

class MigrationVerifier {
  constructor(mongoUrl, postgresUrl) {
    this.mongoUrl = mongoUrl;
    this.postgresUrl = postgresUrl;
  }

  async verify() {
    const mongoClient = await MongoClient.connect(this.mongoUrl);
    const postgresPool = new Pool({ connectionString: this.postgresUrl });

    try {
      console.log('Verifying migration...');

      // Compare user counts
      const mongoUsers = await mongoClient.db().collection('users').countDocuments();
      const postgresUsers = (await postgresPool.query('SELECT COUNT(*) FROM users')).rows[0].count;

      console.log(`Users: MongoDB=${mongoUsers}, PostgreSQL=${postgresUsers}`);

      // Compare conversion counts
      const mongoConversions = await mongoClient.db().collection('conversions').countDocuments();
      const postgresConversions = (await postgresPool.query('SELECT COUNT(*) FROM conversions')).rows[0].count;

      console.log(`Conversions: MongoDB=${mongoConversions}, PostgreSQL=${postgresConversions}`);

      // Check data integrity
      await this.verifyDataIntegrity(mongoClient, postgresPool);

      console.log('Verification completed!');
    } finally {
      await mongoClient.close();
      await postgresPool.end();
    }
  }

  async verifyDataIntegrity(mongoClient, postgresPool) {
    // Sample some records to verify data integrity
    const sampleUsers = await mongoClient.db().collection('users').find().limit(5).toArray();
    const sampleConversions = await mongoClient.db().collection('conversions').find().limit(5).toArray();

    console.log('Sample data verification:');
    console.log('Users:', sampleUsers.length > 0 ? 'Present' : 'Missing');
    console.log('Conversions:', sampleConversions.length > 0 ? 'Present' : 'Missing');
  }
}
```

### MySQL to PostgreSQL

```javascript
// mysql-to-postgres.js
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

class MySQLToPostgresMigrator {
  constructor(mysqlConfig, postgresUrl) {
    this.mysqlConfig = mysqlConfig;
    this.postgresUrl = postgresUrl;
  }

  async migrate() {
    const mysqlConn = await mysql.createConnection(this.mysqlConfig);
    const postgresPool = new Pool({ connectionString: this.postgresUrl });

    try {
      console.log('Starting MySQL to PostgreSQL migration...');

      // Migrate users
      await this.migrateUsers(mysqlConn, postgresPool);

      // Migrate conversions
      await this.migrateConversions(mysqlConn, postgresPool);

      console.log('Migration completed!');
    } finally {
      await mysqlConn.end();
      await postgresPool.end();
    }
  }

  async migrateUsers(mysqlConn, postgresPool) {
    const [users] = await mysqlConn.execute('SELECT * FROM users');

    for (const user of users) {
      await postgresPool.query(
        'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, $3)',
        [user.email, user.password_hash, user.created_at]
      );
    }

    console.log(`Migrated ${users.length} users`);
  }

  async migrateConversions(mysqlConn, postgresPool) {
    const [conversions] = await mysqlConn.execute('SELECT * FROM conversions');

    for (const conversion of conversions) {
      await postgresPool.query(
        `INSERT INTO conversions (user_id, input_content, output_content, format, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          conversion.user_id,
          conversion.input_content,
          conversion.output_content,
          conversion.format,
          conversion.created_at
        ]
      );
    }

    console.log(`Migrated ${conversions.length} conversions`);
  }
}
```

## File System Migration

### Local Files to Cloud Storage

#### AWS S3 Migration

```javascript
// local-to-s3.js
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class LocalToS3Migrator {
  constructor(bucketName, awsConfig = {}) {
    AWS.config.update(awsConfig);
    this.s3 = new AWS.S3();
    this.bucketName = bucketName;
  }

  async migrateDirectory(localDir, s3Prefix = '') {
    console.log(`Migrating ${localDir} to S3...`);

    const files = await this.getAllFiles(localDir);

    for (const file of files) {
      const relativePath = path.relative(localDir, file);
      const s3Key = path.join(s3Prefix, relativePath).replace(/\\/g, '/');

      await this.uploadFile(file, s3Key);
      console.log(`Uploaded: ${s3Key}`);
    }

    console.log(`Migration completed: ${files.length} files uploaded`);
  }

  async getAllFiles(dirPath) {
    const files = [];

    async function traverse(currentPath) {
      const items = await readdir(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          await traverse(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }

    await traverse(dirPath);
    return files;
  }

  async uploadFile(localPath, s3Key) {
    const fileContent = fs.readFileSync(localPath);

    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: this.getContentType(localPath),
      Metadata: {
        migratedAt: new Date().toISOString(),
        originalPath: localPath
      }
    };

    return this.s3.upload(params).promise();
  }

  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.mmd': 'text/plain',
      '.drawio': 'application/xml',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };

    return types[ext] || 'application/octet-stream';
  }
}

// Usage
const migrator = new LocalToS3Migrator('my-converter-bucket', {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

migrator.migrateDirectory('./diagrams', 'migrated/').catch(console.error);
```

#### Google Cloud Storage Migration

```javascript
// local-to-gcs.js
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

class LocalToGCSMigrator {
  constructor(bucketName, keyFilename) {
    this.storage = new Storage({ keyFilename });
    this.bucket = this.storage.bucket(bucketName);
  }

  async migrateDirectory(localDir, gcsPrefix = '') {
    console.log(`Migrating ${localDir} to GCS...`);

    const files = await this.getAllFiles(localDir);

    for (const file of files) {
      const relativePath = path.relative(localDir, file);
      const gcsPath = path.join(gcsPrefix, relativePath).replace(/\\/g, '/');

      await this.uploadFile(file, gcsPath);
      console.log(`Uploaded: ${gcsPath}`);
    }

    console.log(`Migration completed: ${files.length} files uploaded`);
  }

  async getAllFiles(dirPath) {
    const files = [];

    async function traverse(currentPath) {
      const items = await fs.promises.readdir(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stats = await fs.promises.stat(fullPath);

        if (stats.isDirectory()) {
          await traverse(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }

    await traverse(dirPath);
    return files;
  }

  async uploadFile(localPath, gcsPath) {
    const options = {
      destination: gcsPath,
      metadata: {
        contentType: this.getContentType(localPath),
        metadata: {
          migratedAt: new Date().toISOString(),
          originalPath: localPath
        }
      }
    };

    await this.bucket.upload(localPath, options);
  }

  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.mmd': 'text/plain',
      '.drawio': 'application/xml',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };

    return types[ext] || 'application/octet-stream';
  }
}
```

### Cloud to Cloud Migration

#### S3 to Google Cloud Storage

```javascript
// s3-to-gcs.js
const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');

class S3ToGCSMigrator {
  constructor(s3Bucket, gcsBucket, awsConfig = {}, keyFilename) {
    AWS.config.update(awsConfig);
    this.s3 = new AWS.S3();
    this.s3Bucket = s3Bucket;

    this.storage = new Storage({ keyFilename });
    this.gcsBucket = this.storage.bucket(gcsBucket);
  }

  async migrateAllObjects(prefix = '') {
    console.log('Starting S3 to GCS migration...');

    const objects = await this.listS3Objects(prefix);
    let migrated = 0;

    for (const obj of objects) {
      try {
        await this.migrateObject(obj.Key);
        migrated++;
        console.log(`Migrated: ${obj.Key}`);
      } catch (error) {
        console.error(`Failed to migrate ${obj.Key}:`, error);
      }
    }

    console.log(`Migration completed: ${migrated} objects migrated`);
  }

  async listS3Objects(prefix) {
    const params = {
      Bucket: this.s3Bucket,
      Prefix: prefix
    };

    const objects = [];
    let continuationToken;

    do {
      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      const response = await this.s3.listObjectsV2(params).promise();
      objects.push(...response.Contents);
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }

  async migrateObject(s3Key) {
    // Download from S3
    const s3Object = await this.s3.getObject({
      Bucket: this.s3Bucket,
      Key: s3Key
    }).promise();

    // Upload to GCS
    const file = this.gcsBucket.file(s3Key);
    await file.save(s3Object.Body, {
      metadata: {
        contentType: s3Object.ContentType,
        metadata: {
          migratedFrom: 'AWS S3',
          migratedAt: new Date().toISOString(),
          originalEtag: s3Object.ETag
        }
      }
    });
  }
}
```

## Configuration Migration

### Environment Variables Migration

```bash
#!/bin/bash
# migrate-config.sh

# Old configuration file
OLD_CONFIG="config.old.json"
NEW_CONFIG="config.json"

# Environment file
ENV_FILE=".env"

echo "Migrating configuration..."

# Read old config
if [ -f "$OLD_CONFIG" ]; then
    # Extract values and create new format
    PORT=$(jq -r '.port // 3000' "$OLD_CONFIG")
    DB_URL=$(jq -r '.database.url // "mongodb://localhost:27017/converter"' "$OLD_CONFIG")
    JWT_SECRET=$(jq -r '.jwtSecret // "default-secret"' "$OLD_CONFIG")

    # Create new config
    cat > "$NEW_CONFIG" << EOF
{
  "server": {
    "port": $PORT,
    "host": "0.0.0.0"
  },
  "database": {
    "url": "$DB_URL"
  },
  "security": {
    "jwtSecret": "$JWT_SECRET"
  }
}
EOF

    echo "Configuration migrated to $NEW_CONFIG"
else
    echo "Old config file not found: $OLD_CONFIG"
fi

# Create .env file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" << EOF
PORT=$PORT
DATABASE_URL=$DB_URL
JWT_SECRET=$JWT_SECRET
EOF
    echo "Environment file created: $ENV_FILE"
fi

echo "Configuration migration completed!"
```

### Docker Configuration Migration

```yaml
# docker-compose.old.yml (v1.x)
version: '3.8'
services:
  converter:
    image: mermaid/converter:1.0
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGODB_URL=mongodb://mongo:27017/converter
    depends_on:
      - mongo

  mongo:
    image: mongo:4.4
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:

# docker-compose.new.yml (v3.x)
version: '3.8'
services:
  converter:
    image: mermaid/converter:3.0
    ports:
      - "8080:8080"
    environment:
      - SERVER_PORT=8080
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/converter
      - JWT_SECRET=your-secret-key
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=converter
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
```

## API Data Migration

### REST API to GraphQL

```javascript
// rest-to-graphql-migration.js
const axios = require('axios');

class RESTToGraphQLMigrator {
  constructor(restUrl, graphqlUrl) {
    this.restUrl = restUrl;
    this.graphqlUrl = graphqlUrl;
  }

  async migrateUsers() {
    console.log('Migrating users via API...');

    // Get users from REST API
    const restResponse = await axios.get(`${this.restUrl}/users`);
    const users = restResponse.data;

    // Migrate to GraphQL
    for (const user of users) {
      const graphqlMutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
          }
        }
      `;

      await axios.post(this.graphqlUrl, {
        query: graphqlMutation,
        variables: {
          input: {
            email: user.email,
            password: user.password
          }
        }
      });
    }

    console.log(`Migrated ${users.length} users`);
  }

  async migrateConversions() {
    // Similar pattern for conversions
    const restResponse = await axios.get(`${this.restUrl}/conversions`);
    const conversions = restResponse.data;

    for (const conversion of conversions) {
      const graphqlMutation = `
        mutation CreateConversion($input: CreateConversionInput!) {
          createConversion(input: $input) {
            id
          }
        }
      `;

      await axios.post(this.graphqlUrl, {
        query: graphqlMutation,
        variables: {
          input: {
            inputContent: conversion.input,
            outputContent: conversion.output,
            format: conversion.format
          }
        }
      });
    }

    console.log(`Migrated ${conversions.length} conversions`);
  }
}
```

## Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="converter-backup-$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "Creating backup: $BACKUP_NAME"

# Database backup
if command -v pg_dump &> /dev/null; then
    echo "Backing up PostgreSQL database..."
    pg_dump -h localhost -U postgres converter > "$BACKUP_DIR/$BACKUP_NAME-db.sql"
elif command -v mongodump &> /dev/null; then
    echo "Backing up MongoDB database..."
    mongodump --db converter --out "$BACKUP_DIR/$BACKUP_NAME-db"
fi

# File system backup
echo "Backing up files..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME-files.tar.gz" \
    ./uploads \
    ./config.json \
    ./.env \
    ./logs

# Configuration backup
echo "Backing up configuration..."
cp config.json "$BACKUP_DIR/$BACKUP_NAME-config.json"
cp .env "$BACKUP_DIR/$BACKUP_NAME-env"

echo "Backup completed: $BACKUP_DIR/$BACKUP_NAME"
echo "Total size: $(du -sh "$BACKUP_DIR" | cut -f1)"
```

### Recovery Script

```bash
#!/bin/bash
# restore.sh

BACKUP_NAME="$1"

if [ -z "$BACKUP_NAME" ]; then
    echo "Usage: $0 <backup-name>"
    echo "Available backups:"
    ls -la ./backups/
    exit 1
fi

BACKUP_DIR="./backups"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

if [ ! -d "$BACKUP_PATH" ]; then
    echo "Backup not found: $BACKUP_PATH"
    exit 1
fi

echo "Restoring from backup: $BACKUP_NAME"

# Stop services
sudo systemctl stop mermaid-converter

# Restore database
if [ -f "$BACKUP_PATH-db.sql" ]; then
    echo "Restoring PostgreSQL database..."
    psql -h localhost -U postgres converter < "$BACKUP_PATH-db.sql"
elif [ -d "$BACKUP_PATH-db" ]; then
    echo "Restoring MongoDB database..."
    mongorestore "$BACKUP_PATH-db"
fi

# Restore files
if [ -f "$BACKUP_PATH-files.tar.gz" ]; then
    echo "Restoring files..."
    tar -xzf "$BACKUP_PATH-files.tar.gz" -C /
fi

# Restore configuration
if [ -f "$BACKUP_PATH-config.json" ]; then
    cp "$BACKUP_PATH-config.json" ./config.json
fi

if [ -f "$BACKUP_PATH-env" ]; then
    cp "$BACKUP_PATH-env" ./.env
fi

# Restart services
sudo systemctl start mermaid-converter

echo "Restore completed!"
```

## Migration Validation

### Data Integrity Checks

```javascript
// integrity-check.js
const crypto = require('crypto');
const fs = require('fs');
const { Pool } = require('pg');

class DataIntegrityChecker {
  constructor(postgresUrl) {
    this.pool = new Pool({ connectionString: postgresUrl });
  }

  async checkUserIntegrity() {
    console.log('Checking user data integrity...');

    const result = await this.pool.query('SELECT id, email, password_hash FROM users');
    const issues = [];

    for (const user of result.rows) {
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        issues.push({ id: user.id, issue: 'Invalid email format' });
      }

      // Check password hash
      if (!user.password_hash.startsWith('$2b$')) {
        issues.push({ id: user.id, issue: 'Invalid password hash' });
      }
    }

    return issues;
  }

  async checkConversionIntegrity() {
    console.log('Checking conversion data integrity...');

    const result = await this.pool.query('SELECT id, input_content, output_content FROM conversions');
    const issues = [];

    for (const conversion of result.rows) {
      // Check input content
      if (!conversion.input_content || conversion.input_content.trim().length === 0) {
        issues.push({ id: conversion.id, issue: 'Empty input content' });
      }

      // Check output content
      if (!conversion.output_content || conversion.output_content.trim().length === 0) {
        issues.push({ id: conversion.id, issue: 'Empty output content' });
      }
    }

    return issues;
  }

  async generateReport() {
    const userIssues = await this.checkUserIntegrity();
    const conversionIssues = await this.checkConversionIntegrity();

    const report = {
      timestamp: new Date().toISOString(),
      users: {
        total: (await this.pool.query('SELECT COUNT(*) FROM users')).rows[0].count,
        issues: userIssues.length,
        issueDetails: userIssues
      },
      conversions: {
        total: (await this.pool.query('SELECT COUNT(*) FROM conversions')).rows[0].count,
        issues: conversionIssues.length,
        issueDetails: conversionIssues
      }
    };

    // Save report
    fs.writeFileSync('migration-integrity-report.json', JSON.stringify(report, null, 2));

    console.log('Integrity report generated: migration-integrity-report.json');
    return report;
  }

  async close() {
    await this.pool.end();
  }
}

// Usage
const checker = new DataIntegrityChecker('postgresql://user:password@localhost:5432/converter');
checker.generateReport().then(() => checker.close()).catch(console.error);
```

## Performance Considerations

### Migration Performance Tips

1. **Batch Processing**: Process data in batches to avoid memory issues
2. **Parallel Processing**: Use multiple workers for large migrations
3. **Indexing**: Create indexes before bulk inserts
4. **Connection Pooling**: Use connection pools for database operations
5. **Progress Tracking**: Monitor progress and performance metrics

### Performance Monitoring

```javascript
// migration-monitor.js
const { PerformanceObserver, performance } = require('perf_hooks');

class MigrationMonitor {
  constructor() {
    this.metrics = {
      startTime: null,
      endTime: null,
      recordsProcessed: 0,
      errors: 0,
      performanceMarks: []
    };

    this.setupPerformanceObserver();
  }

  start() {
    this.metrics.startTime = performance.now();
    performance.mark('migration-start');
  }

  end() {
    this.metrics.endTime = performance.now();
    performance.mark('migration-end');
    performance.measure('total-migration-time', 'migration-start', 'migration-end');
  }

  recordProgress(count) {
    this.metrics.recordsProcessed += count;
    performance.mark(`progress-${this.metrics.recordsProcessed}`);
  }

  recordError() {
    this.metrics.errors++;
  }

  getStats() {
    const duration = this.metrics.endTime - this.metrics.startTime;
    const recordsPerSecond = this.metrics.recordsProcessed / (duration / 1000);

    return {
      duration: `${(duration / 1000).toFixed(2)}s`,
      recordsProcessed: this.metrics.recordsProcessed,
      recordsPerSecond: recordsPerSecond.toFixed(2),
      errors: this.metrics.errors,
      successRate: `${((this.metrics.recordsProcessed - this.metrics.errors) / this.metrics.recordsProcessed * 100).toFixed(1)}%`
    };
  }

  setupPerformanceObserver() {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.performanceMarks.push({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration
        });
      }
    });

    obs.observe({ entryTypes: ['measure', 'mark'] });
  }

  generateReport() {
    const stats = this.getStats();
    const report = {
      ...stats,
      performanceMarks: this.metrics.performanceMarks,
      timestamp: new Date().toISOString()
    };

    console.log('Migration Performance Report:');
    console.log(`Duration: ${stats.duration}`);
    console.log(`Records Processed: ${stats.recordsProcessed}`);
    console.log(`Records/Second: ${stats.recordsPerSecond}`);
    console.log(`Success Rate: ${stats.successRate}`);

    return report;
  }
}

module.exports = MigrationMonitor;
```

This comprehensive data migration guide provides all the tools and scripts needed to migrate between different storage systems, databases, and configurations while maintaining data integrity and performance.
