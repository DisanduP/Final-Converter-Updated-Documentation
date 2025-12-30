# Migration Guide

This guide helps you migrate to the Mermaid to Draw.io Converter from other tools and upgrade between versions.

## Version Migration

### Migrating from v1.x to v2.x

#### Breaking Changes

**API Changes:**
- Authentication now required for all endpoints
- Rate limiting implemented (100 requests/minute free tier)
- Response format changed for batch operations

**Configuration Changes:**
- Environment variables renamed for consistency
- Default ports changed (3000 → 8080)
- Database configuration now required

#### Migration Steps

1. **Backup your data**
   ```bash
   # Backup existing configurations
   cp config.json config.backup.json
   cp .env .env.backup
   ```

2. **Update dependencies**
   ```bash
   # Update to latest version
   npm update @mermaid/converter@latest

   # Or install specific version
   npm install @mermaid/converter@2.0.0
   ```

3. **Update configuration**
   ```javascript
   // config.js - v1.x
   module.exports = {
     port: 3000,
     database: {
       url: 'mongodb://localhost:27017/converter'
     }
   };

   // config.js - v2.x
   module.exports = {
     server: {
       port: 8080,
       host: '0.0.0.0'
     },
     database: {
       url: process.env.DATABASE_URL,
       ssl: true
     },
     security: {
       jwtSecret: process.env.JWT_SECRET,
       apiKeys: {
         enabled: true
       }
     }
   };
   ```

4. **Update API calls**
   ```javascript
   // v1.x API call
   const response = await fetch('/convert', {
     method: 'POST',
     body: JSON.stringify({ mermaid: diagram })
   });

   // v2.x API call
   const response = await fetch('/api/v2/convert', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${apiKey}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       mermaid: diagram,
       format: 'drawio',
       theme: 'default'
     })
   });
   ```

5. **Update environment variables**
   ```bash
   # .env - v1.x
   PORT=3000
   MONGODB_URL=mongodb://localhost:27017/converter

   # .env - v2.x
   SERVER_PORT=8080
   DATABASE_URL=mongodb://localhost:27017/converter
   JWT_SECRET=your-secret-key
   API_KEY_ENABLED=true
   ```

6. **Database migration**
   ```javascript
   // migration script
   const mongoose = require('mongoose');

   async function migrateDatabase() {
     // Connect to database
     await mongoose.connect(process.env.DATABASE_URL);

     // Add new fields to existing documents
     await mongoose.connection.collection('conversions').updateMany(
       {},
       {
         $set: {
           version: '2.0.0',
           migratedAt: new Date(),
           apiKey: null // Will be set by users
         }
       }
     );

     // Create indexes for new features
     await mongoose.connection.collection('conversions').createIndex({
       userId: 1,
       createdAt: -1
     });

     console.log('Database migration completed');
   }

   migrateDatabase().catch(console.error);
   ```

7. **Update client applications**
   ```javascript
   // Client code update
   class ConverterClient {
     constructor(apiKey) {
       this.apiKey = apiKey;
       this.baseUrl = '/api/v2';
     }

     async convert(diagram) {
       const response = await fetch(`${this.baseUrl}/convert`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${this.apiKey}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           mermaid: diagram,
           options: {
             theme: 'default',
             format: 'drawio'
           }
         })
       });

       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }

       return await response.json();
     }
   }
   ```

#### Rollback Plan

If you need to rollback to v1.x:

1. **Restore backup configurations**
   ```bash
   cp config.backup.json config.json
   cp .env.backup .env
   ```

2. **Downgrade package**
   ```bash
   npm install @mermaid/converter@1.9.5
   ```

3. **Update API calls back to v1 format**
4. **Restore database from backup if needed**

### Migrating from v2.x to v3.x

#### New Features in v3.x
- **WebSocket support** for real-time conversion
- **Plugin system** for custom diagram types
- **Advanced caching** with Redis
- **Multi-tenant support**

#### Migration Steps

1. **Update configuration for new features**
   ```javascript
   // config.js - v3.x additions
   module.exports = {
     // ... existing config
     websocket: {
       enabled: true,
       port: 8081
     },
     plugins: {
       enabled: true,
       directory: './plugins'
     },
     cache: {
       redis: {
         url: process.env.REDIS_URL
       }
     },
     multiTenant: {
       enabled: false // Set to true for multi-tenant deployments
     }
   };
   ```

2. **Add Redis dependency**
   ```bash
   npm install redis
   ```

3. **Update environment variables**
   ```bash
   # Add to .env
   REDIS_URL=redis://localhost:6379
   WEBSOCKET_ENABLED=true
   PLUGINS_ENABLED=true
   ```

## Tool Migration

### Migrating from Draw.io Desktop

#### Exporting Diagrams

1. **Open Draw.io Desktop**
2. **File → Export As**
3. **Choose "XML" format**
4. **Save with .drawio extension**

#### Batch Export Script

```python
# drawio-export.py
import os
import glob
from drawio import DrawIOConverter

def export_drawio_files():
    converter = DrawIOConverter()

    # Find all .drawio files
    drawio_files = glob.glob('**/*.drawio', recursive=True)

    for file_path in drawio_files:
        print(f"Processing: {file_path}")

        # Export to Mermaid
        mermaid_content = converter.drawio_to_mermaid(file_path)

        # Save Mermaid file
        mermaid_path = file_path.replace('.drawio', '.mmd')
        with open(mermaid_path, 'w') as f:
            f.write(mermaid_content)

        print(f"Exported: {mermaid_path}")

if __name__ == '__main__':
    export_drawio_files()
```

### Migrating from Lucidchart

#### Export Process

1. **Open Lucidchart document**
2. **File → Download As**
3. **Choose "SVG" or "PNG" format**
4. **Use OCR or manual conversion to Mermaid**

#### Automated Migration

```javascript
// lucidchart-migration.js
const puppeteer = require('puppeteer');
const fs = require('fs');

class LucidchartMigrator {
  async migrateDocument(url, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      // Navigate to Lucidchart document
      await page.goto(url);

      // Wait for diagram to load
      await page.waitForSelector('.diagram-canvas');

      // Extract diagram structure (simplified)
      const diagramData = await page.evaluate(() => {
        // This would need to be customized based on Lucidchart's DOM structure
        const elements = document.querySelectorAll('.shape, .connector');
        return Array.from(elements).map(el => ({
          type: el.className,
          text: el.textContent,
          position: el.getBoundingClientRect()
        }));
      });

      // Convert to Mermaid (basic implementation)
      const mermaid = this.convertToMermaid(diagramData);

      fs.writeFileSync(outputPath, mermaid);
      console.log(`Migrated: ${outputPath}`);

    } finally {
      await browser.close();
    }
  }

  convertToMermaid(elements) {
    // Basic flowchart conversion
    let mermaid = 'flowchart TD\n';

    elements.forEach((el, index) => {
      if (el.type.includes('shape')) {
        mermaid += `    A${index}["${el.text}"]\n`;
      }
    });

    // Add basic connections (simplified)
    for (let i = 0; i < elements.length - 1; i++) {
      mermaid += `    A${i} --> A${i + 1}\n`;
    }

    return mermaid;
  }
}
```

### Migrating from Microsoft Visio

#### Export Options

1. **Save As → SVG**
2. **Use Visio to Mermaid converter**
3. **Manual recreation in Mermaid**

#### Visio to Mermaid Converter

```python
# visio-converter.py
import xml.etree.ElementTree as ET
from pathlib import Path

class VisioToMermaidConverter:
    def __init__(self):
        self.shapes = {}
        self.connections = []

    def convert(self, visio_file):
        # Parse Visio file (VDX format)
        tree = ET.parse(visio_file)
        root = tree.getroot()

        # Extract shapes
        for shape in root.findall('.//Shape'):
            shape_id = shape.get('ID')
            text = shape.find('.//Text')
            shape_text = text.text if text is not None else f'Shape {shape_id}'

            self.shapes[shape_id] = shape_text

        # Extract connections
        for connect in root.findall('.//Connect'):
            from_id = connect.get('FromSheet')
            to_id = connect.get('ToSheet')
            self.connections.append((from_id, to_id))

        return self.generate_mermaid()

    def generate_mermaid(self):
        mermaid = 'flowchart TD\n'

        # Add shapes
        for shape_id, text in self.shapes.items():
            mermaid += f'    {shape_id}["{text}"]\n'

        # Add connections
        for from_id, to_id in self.connections:
            mermaid += f'    {from_id} --> {to_id}\n'

        return mermaid

# Usage
converter = VisioToMermaidConverter()
mermaid = converter.convert('diagram.vdx')
print(mermaid)
```

### Migrating from PlantUML

#### PlantUML to Mermaid Conversion

```javascript
// plantuml-to-mermaid.js
const plantuml = require('node-plantuml');

class PlantUMLToMermaidConverter {
  convert(plantumlCode) {
    // Basic PlantUML to Mermaid conversion
    let mermaid = '';

    // Convert @startuml to flowchart
    if (plantumlCode.includes('@startuml')) {
      mermaid = 'flowchart TD\n';

      // Extract actors (converting to rectangles)
      const actorRegex = /actor\s+(\w+)/g;
      let match;
      while ((match = actorRegex.exec(plantumlCode)) !== null) {
        mermaid += `    ${match[1]}["${match[1]}"]\n`;
      }

      // Extract use cases
      const usecaseRegex = /usecase\s+"([^"]+)"\s+as\s+(\w+)/g;
      while ((match = usecaseRegex.exec(plantumlCode)) !== null) {
        mermaid += `    ${match[2]}("${match[1]}")\n`;
      }

      // Extract relationships
      const relationRegex = /(\w+)\s+-->\s+(\w+)/g;
      while ((match = relationRegex.exec(plantumlCode)) !== null) {
        mermaid += `    ${match[1]} --> ${match[2]}\n`;
      }
    }

    return mermaid;
  }
}

// Usage
const converter = new PlantUMLToMermaidConverter();
const plantumlCode = `
@startuml
actor User
usecase "Login" as Login
User --> Login
@enduml
`;

const mermaid = converter.convert(plantumlCode);
console.log(mermaid);
```

## Cloud Migration

### Migrating from Self-Hosted to Cloud

#### Data Export

```bash
# Export user data
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -X GET "https://your-instance.com/api/export" \
     > user-data-export.json

# Export configurations
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -X GET "https://your-instance.com/api/config" \
     > config-export.json
```

#### Cloud Import

```javascript
// cloud-migration.js
const axios = require('axios');

class CloudMigrator {
  constructor(cloudApiKey) {
    this.cloudApiKey = cloudApiKey;
    this.cloudUrl = 'https://api.mermaid-converter.com/v1';
  }

  async migrateUserData(userData) {
    console.log('Migrating user data to cloud...');

    for (const user of userData.users) {
      // Create user in cloud
      await this.createCloudUser(user);

      // Migrate user's diagrams
      for (const diagram of user.diagrams) {
        await this.migrateDiagram(user.id, diagram);
      }
    }

    console.log('Migration completed');
  }

  async createCloudUser(user) {
    const response = await axios.post(`${this.cloudUrl}/users`, {
      email: user.email,
      name: user.name
    }, {
      headers: {
        'Authorization': `Bearer ${this.cloudApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  async migrateDiagram(userId, diagram) {
    const response = await axios.post(`${this.cloudUrl}/convert`, {
      mermaid: diagram.content,
      userId: userId,
      metadata: {
        originalId: diagram.id,
        migratedAt: new Date(),
        source: 'self-hosted'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${this.cloudApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }
}
```

### Migrating Between Cloud Providers

#### AWS to Google Cloud

```javascript
// aws-to-gcp-migration.js
const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');

class CloudToCloudMigrator {
  constructor() {
    this.s3 = new AWS.S3();
    this.gcs = new Storage();
  }

  async migrateS3ToGCS(bucketName, gcsBucketName) {
    // List S3 objects
    const objects = await this.s3.listObjectsV2({
      Bucket: bucketName
    }).promise();

    for (const obj of objects.Contents) {
      // Download from S3
      const s3Object = await this.s3.getObject({
        Bucket: bucketName,
        Key: obj.Key
      }).promise();

      // Upload to GCS
      const file = this.gcs.bucket(gcsBucketName).file(obj.Key);
      await file.save(s3Object.Body, {
        metadata: {
          contentType: s3Object.ContentType,
          metadata: {
            migratedFrom: 'AWS S3',
            migratedAt: new Date().toISOString()
          }
        }
      });

      console.log(`Migrated: ${obj.Key}`);
    }
  }
}
```

## Database Migration

### MongoDB to PostgreSQL

```javascript
// mongodb-to-postgres-migration.js
const MongoClient = require('mongodb').MongoClient;
const { Pool } = require('pg');

class DatabaseMigrator {
  constructor(mongoUrl, postgresUrl) {
    this.mongoUrl = mongoUrl;
    this.postgresUrl = postgresUrl;
  }

  async migrate() {
    const mongoClient = await MongoClient.connect(this.mongoUrl);
    const postgresPool = new Pool({ connectionString: this.postgresUrl });

    try {
      // Migrate users
      await this.migrateUsers(mongoClient, postgresPool);

      // Migrate conversions
      await this.migrateConversions(mongoClient, postgresPool);

      // Migrate settings
      await this.migrateSettings(mongoClient, postgresPool);

      console.log('Database migration completed');
    } finally {
      await mongoClient.close();
      await postgresPool.end();
    }
  }

  async migrateUsers(mongoClient, postgresPool) {
    const users = await mongoClient.db().collection('users').find().toArray();

    for (const user of users) {
      await postgresPool.query(
        'INSERT INTO users (id, email, name, created_at) VALUES ($1, $2, $3, $4)',
        [user._id, user.email, user.name, user.createdAt]
      );
    }
  }

  async migrateConversions(mongoClient, postgresPool) {
    const conversions = await mongoClient.db().collection('conversions').find().toArray();

    for (const conversion of conversions) {
      await postgresPool.query(
        `INSERT INTO conversions (id, user_id, input_content, output_content, format, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          conversion._id,
          conversion.userId,
          conversion.input,
          conversion.output,
          conversion.format,
          conversion.createdAt
        ]
      );
    }
  }
}
```

## Testing Migration

### Migration Testing Checklist

- [ ] **Data Integrity**: Verify all data migrated correctly
- [ ] **Functionality**: Test all features work in new environment
- [ ] **Performance**: Compare performance before/after migration
- [ ] **Security**: Ensure security settings migrated properly
- [ ] **Access Control**: Verify user permissions maintained
- [ ] **Integrations**: Test all external integrations work
- [ ] **Monitoring**: Set up monitoring for new environment

### Rollback Testing

```javascript
// rollback-test.js
const { expect } = require('chai');

describe('Migration Rollback', () => {
  it('should restore data from backup', async () => {
    // Test data restoration
    const backupData = await loadBackup();
    await restoreFromBackup(backupData);

    const restoredData = await getCurrentData();
    expect(restoredData).to.deep.equal(backupData);
  });

  it('should maintain data consistency during rollback', async () => {
    // Test that rollback doesn't corrupt data
    const originalData = await getCurrentData();
    await performRollback();

    const rolledBackData = await getCurrentData();
    expect(rolledBackData).to.deep.equal(originalData);
  });
});
```

## Migration Best Practices

### Planning
1. **Assess Scope**: Understand what needs to be migrated
2. **Create Timeline**: Set realistic migration deadlines
3. **Identify Dependencies**: Map out system dependencies
4. **Risk Assessment**: Identify potential migration risks

### Preparation
1. **Backup Everything**: Create complete backups before migration
2. **Test Environment**: Set up identical test environment
3. **Documentation**: Document all migration steps
4. **Communication**: Inform stakeholders of migration plans

### Execution
1. **Phased Approach**: Migrate in phases when possible
2. **Monitor Progress**: Track migration progress in real-time
3. **Validate Continuously**: Validate data integrity at each step
4. **Quick Rollback**: Have rollback procedures ready

### Post-Migration
1. **Full Testing**: Test all functionality thoroughly
2. **Performance Monitoring**: Monitor system performance
3. **User Training**: Train users on any new features
4. **Documentation Update**: Update all documentation

### Common Pitfalls to Avoid
- **Underestimating Time**: Migrations always take longer than expected
- **Insufficient Testing**: Test thoroughly in staging environment
- **Poor Communication**: Keep all stakeholders informed
- **No Rollback Plan**: Always have a rollback strategy
- **Data Loss**: Never migrate without complete backups

## Support

If you encounter issues during migration:

1. **Check Documentation**: Review this migration guide
2. **Community Support**: Ask in GitHub Discussions
3. **Professional Services**: Contact our migration specialists
4. **Issue Reports**: Report bugs in GitHub Issues

Remember: Migration is a significant change. Plan carefully, test thoroughly, and have a rollback plan ready.
