# Batch Processing Tutorial

Learn how to efficiently convert multiple Mermaid diagrams at once using batch processing techniques.

## Why Batch Processing?

Batch processing is useful when you have:
- Multiple diagram files to convert
- Regular diagram updates
- Large documentation projects
- Automated workflows

## Basic Batch Conversion

### Using Shell Scripts

#### Simple Loop (Unix/Linux/macOS)

```bash
#!/bin/bash

# Convert all .mmd files in current directory
for file in *.mmd; do
    if [ -f "$file" ]; then
        output="${file%.mmd}.drawio"
        echo "Converting $file to $output"
        mermaid-to-drawio "$file" "$output"
    fi
done

echo "Batch conversion complete!"
```

#### Windows Batch Script

```batch
@echo off
setlocal enabledelayedexpansion

for %%f in (*.mmd) do (
    set "input=%%f"
    set "output=%%~nf.drawio"
    echo Converting %%f to !output!
    mermaid-to-drawio "%%f" "!output!"
)

echo Batch conversion complete!
pause
```

### Using Find Command

```bash
# Convert all .mmd files recursively
find . -name "*.mmd" -type f -exec bash -c '
    input="$1"
    output="${input%.mmd}.drawio"
    echo "Converting $input to $output"
    mermaid-to-drawio "$input" "$output"
' _ {} \;
```

## Advanced Batch Processing

### Parallel Processing

#### Using GNU Parallel

```bash
# Install parallel if not available
# sudo apt-get install parallel  # Ubuntu/Debian
# brew install parallel          # macOS

# Convert in parallel (4 processes)
find . -name "*.mmd" -type f | parallel -j 4 '
    input={}
    output={.}.drawio
    echo "Converting $input to $output"
    mermaid-to-drawio "$input" "$output"
'
```

#### Node.js Script for Parallel Processing

```javascript
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function convertFile(inputPath) {
  const outputPath = inputPath.replace('.mmd', '.drawio');
  const command = `mermaid-to-drawio "${inputPath}" "${outputPath}"`;

  try {
    await execAsync(command);
    console.log(`✓ Converted: ${inputPath} → ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed: ${inputPath} - ${error.message}`);
    return false;
  }
}

async function batchConvert(directory, concurrency = 4) {
  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith('.mmd'))
    .map(file => path.join(directory, file));

  console.log(`Found ${files.length} .mmd files to convert`);

  // Process in batches
  const batches = [];
  for (let i = 0; i < files.length; i += concurrency) {
    batches.push(files.slice(i, i + concurrency));
  }

  let successCount = 0;
  let failCount = 0;

  for (const batch of batches) {
    const promises = batch.map(convertFile);
    const results = await Promise.all(promises);

    successCount += results.filter(Boolean).length;
    failCount += results.filter(r => !r).length;
  }

  console.log(`\nBatch conversion complete:`);
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
}

// Usage
const targetDir = process.argv[2] || '.';
batchConvert(targetDir);
```

Save as `batch-convert.js` and run:

```bash
node batch-convert.js /path/to/diagrams
```

### Error Handling and Logging

#### Comprehensive Batch Script

```javascript
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class BatchConverter {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 4;
    this.logFile = options.logFile || 'conversion-log.txt';
    this.skipExisting = options.skipExisting || false;
  }

  async convertDirectory(directory) {
    const files = this.findMermaidFiles(directory);
    console.log(`Found ${files.length} Mermaid files to convert`);

    const results = {
      total: files.length,
      successful: 0,
      failed: 0,
      skipped: 0
    };

    await this.initializeLog();

    const batches = this.createBatches(files);

    for (const batch of batches) {
      const batchResults = await this.processBatch(batch);
      results.successful += batchResults.successful;
      results.failed += batchResults.failed;
      results.skipped += batchResults.skipped;
    }

    await this.writeSummary(results);
    this.printSummary(results);
  }

  findMermaidFiles(directory) {
    const files = [];

    function scan(dir) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.')) {
          scan(fullPath);
        } else if (item.endsWith('.mmd')) {
          files.push(fullPath);
        }
      }
    }

    scan(directory);
    return files;
  }

  createBatches(files) {
    const batches = [];
    for (let i = 0; i < files.length; i += this.concurrency) {
      batches.push(files.slice(i, i + this.concurrency));
    }
    return batches;
  }

  async processBatch(batch) {
    const promises = batch.map(file => this.convertFile(file));
    const results = await Promise.all(promises);

    return results.reduce((acc, result) => {
      acc[result.status]++;
      return acc;
    }, { successful: 0, failed: 0, skipped: 0 });
  }

  async convertFile(inputPath) {
    const outputPath = inputPath.replace('.mmd', '.drawio');

    // Skip if output exists and skipExisting is true
    if (this.skipExisting && fs.existsSync(outputPath)) {
      await this.log(`SKIPPED: ${inputPath} (output exists)`);
      return { status: 'skipped' };
    }

    const command = `mermaid-to-drawio "${inputPath}" "${outputPath}"`;

    try {
      const startTime = Date.now();
      await execAsync(command, { timeout: 60000 });
      const duration = Date.now() - startTime;

      await this.log(`SUCCESS: ${inputPath} → ${outputPath} (${duration}ms)`);
      return { status: 'successful' };
    } catch (error) {
      await this.log(`FAILED: ${inputPath} - ${error.message}`);
      return { status: 'failed' };
    }
  }

  async initializeLog() {
    const header = `=== Batch Conversion Log - ${new Date().toISOString()} ===\n\n`;
    await fs.promises.writeFile(this.logFile, header);
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    console.log(message);
    await fs.promises.appendFile(this.logFile, logEntry);
  }

  async writeSummary(results) {
    const summary = `\n=== Conversion Summary ===\n` +
                   `Total files: ${results.total}\n` +
                   `Successful: ${results.successful}\n` +
                   `Failed: ${results.failed}\n` +
                   `Skipped: ${results.skipped}\n`;

    await fs.promises.appendFile(this.logFile, summary);
  }

  printSummary(results) {
    console.log('\n=== Batch Conversion Complete ===');
    console.log(`Total files: ${results.total}`);
    console.log(`✓ Successful: ${results.successful}`);
    console.log(`✗ Failed: ${results.failed}`);
    console.log(`⊘ Skipped: ${results.skipped}`);

    if (results.failed > 0) {
      console.log(`\nCheck ${this.logFile} for details on failed conversions.`);
    }
  }
}

// CLI usage
const directory = process.argv[2] || '.';
const options = {
  concurrency: parseInt(process.argv[3]) || 4,
  skipExisting: process.argv.includes('--skip-existing'),
  logFile: process.argv.includes('--log') ? process.argv[process.argv.indexOf('--log') + 1] : 'conversion-log.txt'
};

const converter = new BatchConverter(options);
converter.convertDirectory(directory).catch(console.error);
```

Save as `advanced-batch.js` and run:

```bash
# Basic usage
node advanced-batch.js /path/to/diagrams

# With custom concurrency
node advanced-batch.js /path/to/diagrams 8

# Skip existing files
node advanced-batch.js /path/to/diagrams 4 --skip-existing

# Custom log file
node advanced-batch.js /path/to/diagrams 4 --log my-log.txt
```

## Configuration-Based Batch Processing

### YAML Configuration

Create a `batch-config.yaml`:

```yaml
# Batch conversion configuration
input:
  directories:
    - ./diagrams
    - ./docs/diagrams
  patterns:
    - "*.mmd"
    - "*.mermaid"

output:
  directory: ./converted
  format: drawio
  overwrite: false

processing:
  concurrency: 4
  timeout: 60000
  retries: 2

logging:
  level: info
  file: batch-conversion.log
  console: true

hooks:
  pre_convert: "echo 'Starting batch conversion'"
  post_convert: "echo 'Batch conversion complete'"
  on_error: "echo 'Error occurred during conversion'"
```

### Configuration-Driven Script

```javascript
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class ConfigBatchConverter {
  constructor(configPath) {
    this.config = this.loadConfig(configPath);
    this.logger = this.createLogger();
  }

  loadConfig(configPath) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return yaml.load(configContent);
  }

  createLogger() {
    return {
      info: (message) => this.log('INFO', message),
      error: (message) => this.log('ERROR', message),
      warn: (message) => this.log('WARN', message)
    };
  }

  async log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level}: ${message}`;

    if (this.config.logging.console) {
      console.log(logEntry);
    }

    if (this.config.logging.file) {
      await fs.promises.appendFile(this.config.logging.file, logEntry + '\n');
    }
  }

  async runHook(hookName) {
    if (this.config.hooks && this.config.hooks[hookName]) {
      try {
        await execAsync(this.config.hooks[hookName]);
      } catch (error) {
        this.logger.error(`Hook ${hookName} failed: ${error.message}`);
      }
    }
  }

  async convert() {
    await this.runHook('pre_convert');

    try {
      const files = await this.findFiles();
      this.logger.info(`Found ${files.length} files to convert`);

      const results = await this.processFiles(files);
      await this.reportResults(results);

      await this.runHook('post_convert');
    } catch (error) {
      this.logger.error(`Batch conversion failed: ${error.message}`);
      await this.runHook('on_error');
      throw error;
    }
  }

  async findFiles() {
    const files = [];

    for (const dir of this.config.input.directories) {
      await this.scanDirectory(dir, files);
    }

    return files;
  }

  async scanDirectory(directory, files) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await this.scanDirectory(fullPath, files);
      } else {
        if (this.matchesPattern(item)) {
          files.push(fullPath);
        }
      }
    }
  }

  matchesPattern(filename) {
    return this.config.input.patterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filename);
    });
  }

  async processFiles(files) {
    const batches = this.createBatches(files);
    const results = { successful: 0, failed: 0, skipped: 0 };

    for (const batch of batches) {
      const batchResults = await this.processBatch(batch);
      results.successful += batchResults.successful;
      results.failed += batchResults.failed;
      results.skipped += batchResults.skipped;
    }

    return results;
  }

  createBatches(files) {
    const batches = [];
    const batchSize = this.config.processing.concurrency;

    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    return batches;
  }

  async processBatch(batch) {
    const promises = batch.map(file => this.convertFile(file));
    return await Promise.all(promises);
  }

  async convertFile(inputPath) {
    const relativePath = path.relative(process.cwd(), inputPath);
    const outputPath = this.getOutputPath(inputPath);

    // Create output directory
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    // Check if output exists
    if (!this.config.output.overwrite && fs.existsSync(outputPath)) {
      this.logger.info(`Skipping ${relativePath} (output exists)`);
      return { successful: 0, failed: 0, skipped: 1 };
    }

    const command = `mermaid-to-drawio "${inputPath}" "${outputPath}"`;

    try {
      const startTime = Date.now();
      await execAsync(command, {
        timeout: this.config.processing.timeout
      });
      const duration = Date.now() - startTime;

      this.logger.info(`Converted ${relativePath} (${duration}ms)`);
      return { successful: 1, failed: 0, skipped: 0 };
    } catch (error) {
      this.logger.error(`Failed to convert ${relativePath}: ${error.message}`);
      return { successful: 0, failed: 1, skipped: 0 };
    }
  }

  getOutputPath(inputPath) {
    const relativePath = path.relative(process.cwd(), inputPath);
    const outputName = relativePath.replace(/\.mmd$|\.mermaid$/, '.drawio');
    return path.join(this.config.output.directory, outputName);
  }

  async reportResults(results) {
    const total = results.successful + results.failed + results.skipped;

    this.logger.info('=== Batch Conversion Summary ===');
    this.logger.info(`Total files: ${total}`);
    this.logger.info(`Successful: ${results.successful}`);
    this.logger.info(`Failed: ${results.failed}`);
    this.logger.info(`Skipped: ${results.skipped}`);
  }
}

// Usage
const configPath = process.argv[2] || 'batch-config.yaml';
const converter = new ConfigBatchConverter(configPath);
converter.convert().catch(console.error);
```

## Monitoring Batch Jobs

### Progress Monitoring

```javascript
const cliProgress = require('cli-progress');

class ProgressMonitor {
  constructor(total) {
    this.progressBar = new cliProgress.SingleBar({
      format: 'Converting | {bar} | {percentage}% | {value}/{total} | ETA: {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    this.progressBar.start(total, 0);
  }

  update(increment = 1) {
    this.progressBar.increment(increment);
  }

  stop() {
    this.progressBar.stop();
  }
}
```

### Real-time Monitoring

```javascript
const WebSocket = require('ws');

class BatchMonitor {
  constructor(port = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.clients = new Set();
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      startTime: Date.now()
    };

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      ws.send(JSON.stringify(this.stats));

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    console.log(`Batch monitor running on ws://localhost:${port}`);
  }

  updateStats(updates) {
    Object.assign(this.stats, updates);
    this.broadcast();
  }

  broadcast() {
    const message = JSON.stringify(this.stats);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  close() {
    this.wss.close();
  }
}
```

## Best Practices

### File Organization

```
project/
├── diagrams/
│   ├── flowcharts/
│   ├── gantt/
│   ├── sequence/
│   └── converted/          # Output directory
├── batch-config.yaml
├── convert-all.sh
└── logs/
    └── conversion.log
```

### Error Recovery

```bash
# Resume failed conversions
grep "FAILED:" conversion.log | cut -d' ' -f2 | xargs -I {} mermaid-to-drawio {} {}.drawio
```

### Cleanup Scripts

```bash
# Remove old converted files
find ./converted -name "*.drawio" -mtime +30 -delete

# Archive logs
tar -czf logs-$(date +%Y%m%d).tar.gz logs/
rm -rf logs/*.log
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Convert Diagrams

on:
  push:
    paths:
      - 'diagrams/**'

jobs:
  convert:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Convert diagrams
      run: node batch-convert.js diagrams

    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: converted-diagrams
        path: diagrams/converted/
```

### GitLab CI

```yaml
stages:
  - convert

convert_diagrams:
  stage: convert
  image: node:18
  script:
    - npm install
    - node batch-convert.js diagrams
  artifacts:
    paths:
      - diagrams/converted/
    expire_in: 1 week
  only:
    changes:
      - diagrams/**/*
```

## Performance Optimization

### Hardware Considerations

- **CPU**: More cores = better parallel processing
- **RAM**: 512MB minimum, 2GB recommended for large batches
- **Storage**: SSD recommended for faster I/O

### Optimization Tips

1. **Adjust Concurrency**: Match to CPU cores
2. **Batch Size**: Balance memory usage and throughput
3. **File System**: Use fast storage for temp files
4. **Network**: Ensure stable connection for CDN resources

### Benchmarking

```bash
# Test different concurrency levels
for concurrency in 1 2 4 8; do
  echo "Testing concurrency: $concurrency"
  time node batch-convert.js diagrams $concurrency
done
```

## Troubleshooting

### Common Issues

**High Memory Usage**
- Reduce concurrency
- Process in smaller batches
- Monitor with `top` or `htop`

**Timeout Errors**
- Increase timeout in configuration
- Check network connectivity
- Split large diagrams

**Permission Errors**
- Ensure write access to output directory
- Check file permissions on input files

**Browser Crashes**
- Update Playwright: `npx playwright install`
- Reduce concurrent browsers
- Add browser flags for stability

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* node batch-convert.js diagrams

# Log to file
node batch-convert.js diagrams 2>&1 | tee batch.log
```

## Next Steps

- [Web Integration Tutorial](web-integration.md) - Using the converter in web applications
- [API Integration Tutorial](api-integration.md) - Building programmatic integrations
- [Custom Themes Tutorial](custom-themes.md) - Advanced styling options

Batch processing can significantly improve your workflow efficiency. Start small, measure performance, and scale up as needed!
