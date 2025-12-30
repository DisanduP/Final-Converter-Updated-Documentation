# API Reference

This document provides a comprehensive reference for the Mermaid to Draw.io converter's programmatic API.

## Overview

The converter provides both a command-line interface and a programmatic JavaScript API for integration into applications.

## Installation

```bash
npm install mermaid-to-drawio
```

## Basic Usage

```javascript
const { convert, Converter } = require('mermaid-to-drawio');

// Simple conversion
const drawioXml = await convert(mermaidCode);

// Advanced usage with options
const converter = new Converter({
  theme: 'dark',
  browser: 'chromium'
});

const result = await converter.convert(mermaidCode, {
  format: 'svg',
  width: 1200
});
```

## API Reference

### Core Functions

#### `convert(mermaidCode, options?)`

Converts Mermaid diagram code to Draw.io format.

**Parameters:**
- `mermaidCode` (string) - The Mermaid diagram code to convert
- `options` (object, optional) - Conversion options

**Returns:** Promise<string> - The converted Draw.io XML

**Example:**
```javascript
const drawioXml = await convert(`graph TD;
  A[Start] --> B{Decision};
  B -->|Yes| C[Action];
  B -->|No| D[End];`);
```

#### `convertFile(inputPath, outputPath, options?)`

Converts a Mermaid file to Draw.io format.

**Parameters:**
- `inputPath` (string) - Path to input Mermaid file
- `outputPath` (string) - Path for output Draw.io file
- `options` (object, optional) - Conversion options

**Returns:** Promise<void>

**Example:**
```javascript
await convertFile('diagram.mmd', 'diagram.drawio');
```

#### `convertStream(inputStream, outputStream, options?)`

Converts Mermaid code from a readable stream to a writable stream.

**Parameters:**
- `inputStream` (Readable) - Input stream with Mermaid code
- `outputStream` (Writable) - Output stream for Draw.io XML
- `options` (object, optional) - Conversion options

**Returns:** Promise<void>

### Classes

#### `Converter`

Main converter class with advanced configuration options.

**Constructor:**
```javascript
new Converter(options?)
```

**Parameters:**
- `options` (object, optional) - Default configuration options

**Methods:**

##### `convert(mermaidCode, options?)`

Converts Mermaid code with instance-specific options.

##### `convertFile(inputPath, outputPath, options?)`

Converts a file with instance-specific options.

##### `convertBatch(inputs, options?)`

Converts multiple diagrams in batch.

##### `validate(mermaidCode)`

Validates Mermaid syntax without conversion.

##### `getSupportedTypes()`

Returns array of supported diagram types.

##### `close()`

Closes the converter and cleans up resources.

**Example:**
```javascript
const converter = new Converter({
  theme: 'dark',
  timeout: 60000,
  browser: {
    headless: true,
    args: ['--no-sandbox']
  }
});

const result = await converter.convert(diagramCode);
await converter.close();
```

#### `BatchConverter`

Specialized class for batch conversions.

**Constructor:**
```javascript
new BatchConverter(options?)
```

**Methods:**

##### `addJob(input, output?, options?)`

Adds a conversion job to the batch.

##### `execute()`

Executes all queued jobs.

##### `on(event, callback)`

Registers event listeners for progress updates.

**Example:**
```javascript
const batch = new BatchConverter();

batch.addJob('diagram1.mmd', 'output1.drawio');
batch.addJob('diagram2.mmd', 'output2.drawio');

batch.on('progress', (completed, total) => {
  console.log(`Progress: ${completed}/${total}`);
});

await batch.execute();
```

## Options Reference

### Global Options

- `theme` (string) - Mermaid theme: `'default'`, `'dark'`, `'forest'`, `'neutral'`
- `browser` (string) - Browser to use: `'chromium'`, `'firefox'`, `'webkit'`
- `timeout` (number) - Conversion timeout in milliseconds (default: 30000)
- `retries` (number) - Number of retry attempts (default: 3)
- `format` (string) - Output format: `'drawio'`, `'svg'`, `'png'`
- `width` (number) - Diagram width in pixels
- `height` (number) - Diagram height in pixels
- `scale` (number) - Scale factor for raster outputs (default: 1)

### Browser Options

```javascript
{
  browser: {
    headless: true,        // Run in headless mode
    args: ['--no-sandbox'], // Additional browser arguments
    slowMo: 0,            // Slow down operations (for debugging)
    devtools: false       // Open DevTools
  }
}
```

### Performance Options

```javascript
{
  performance: {
    concurrency: 4,       // Number of concurrent conversions
    memoryLimit: '512MB', // Memory limit
    cache: true,          // Enable caching
    poolSize: 4          // Browser pool size
  }
}
```

### Output Options

```javascript
{
  output: {
    compress: false,      // Compress output
    pretty: false,        // Pretty-print XML
    validate: true,       // Validate output
    metadata: true        // Include metadata
  }
}
```

### Logging Options

```javascript
{
  logging: {
    level: 'info',        // Log level: 'error', 'warn', 'info', 'debug'
    file: null,          // Log to file
    console: true,       // Log to console
    json: false          // JSON format logs
  }
}
```

## Events

The converter emits various events during operation:

### Converter Events

- `start` - Conversion started
- `progress` - Conversion progress update
- `complete` - Conversion completed successfully
- `error` - Conversion failed
- `timeout` - Conversion timed out

**Example:**
```javascript
converter.on('progress', (percent) => {
  console.log(`Progress: ${percent}%`);
});

converter.on('error', (error) => {
  console.error('Conversion failed:', error);
});
```

### Batch Events

- `job-start` - Individual job started
- `job-complete` - Individual job completed
- `batch-start` - Batch processing started
- `batch-complete` - Batch processing completed
- `batch-error` - Batch processing failed

## Error Handling

### Error Types

- `ValidationError` - Invalid input or configuration
- `ConversionError` - Conversion process failed
- `TimeoutError` - Conversion timed out
- `BrowserError` - Browser-related error
- `FileError` - File I/O error

### Error Handling Example

```javascript
try {
  const result = await convert(mermaidCode);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Conversion timed out');
  } else {
    console.error('Conversion failed:', error.message);
  }
}
```

## Advanced Usage

### Custom Browser Configuration

```javascript
const converter = new Converter({
  browser: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--memory-pressure-off'
    ]
  }
});
```

### Memory Management

```javascript
const converter = new Converter({
  performance: {
    memoryLimit: '1GB',
    poolSize: 2,
    cache: {
      enabled: true,
      ttl: 3600000,  // 1 hour
      maxSize: 100
    }
  }
});

// Always close when done
process.on('exit', () => converter.close());
```

### Custom Validation

```javascript
const converter = new Converter();

converter.addValidator((mermaidCode) => {
  if (mermaidCode.length > 100000) {
    throw new ValidationError('Diagram too large');
  }
});

converter.addValidator((mermaidCode) => {
  if (mermaidCode.includes('<script>')) {
    throw new ValidationError('Potentially unsafe content');
  }
});
```

### Streaming Conversion

```javascript
const fs = require('fs');
const { convertStream } = require('mermaid-to-drawio');

const inputStream = fs.createReadStream('large-diagram.mmd');
const outputStream = fs.createWriteStream('large-diagram.drawio');

await convertStream(inputStream, outputStream, {
  theme: 'dark',
  timeout: 120000
});
```

### Plugin System

```javascript
const converter = new Converter();

// Add custom plugin
converter.use({
  name: 'custom-exporter',
  convert: async (mermaidCode, options) => {
    // Custom conversion logic
    return customDrawioXml;
  }
});
```

## TypeScript Support

The API includes full TypeScript definitions:

```typescript
import { convert, Converter, ConvertOptions } from 'mermaid-to-drawio';

interface ConvertOptions {
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  browser?: 'chromium' | 'firefox' | 'webkit';
  timeout?: number;
  format?: 'drawio' | 'svg' | 'png';
  width?: number;
  height?: number;
  // ... more options
}

const options: ConvertOptions = {
  theme: 'dark',
  timeout: 60000
};

const result: string = await convert(mermaidCode, options);
```

## Integration Examples

### Express.js Middleware

```javascript
const express = require('express');
const { convert } = require('mermaid-to-drawio');

const app = express();
app.use(express.text({ limit: '10mb' }));

app.post('/convert', async (req, res) => {
  try {
    const drawioXml = await convert(req.body, {
      theme: req.query.theme || 'default'
    });

    res.set('Content-Type', 'application/xml');
    res.send(drawioXml);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### WebSocket Server

```javascript
const WebSocket = require('ws');
const { convert } = require('mermaid-to-drawio');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const result = await convert(data.mermaid, data.options);

      ws.send(JSON.stringify({
        success: true,
        result
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        success: false,
        error: error.message
      }));
    }
  });
});
```

### Worker Threads

```javascript
const { Worker } = require('worker_threads');

function convertInWorker(mermaidCode, options) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./converter-worker.js');

    worker.postMessage({ mermaidCode, options });

    worker.on('message', (result) => {
      worker.terminate();
      resolve(result);
    });

    worker.on('error', (error) => {
      worker.terminate();
      reject(error);
    });
  });
}

// converter-worker.js
const { parentPort } = require('worker_threads');
const { convert } = require('mermaid-to-drawio');

parentPort.on('message', async ({ mermaidCode, options }) => {
  try {
    const result = await convert(mermaidCode, options);
    parentPort.postMessage(result);
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
```

## Performance Considerations

### Connection Pooling

```javascript
const converter = new Converter({
  performance: {
    poolSize: 4,
    maxConnections: 10
  }
});
```

### Caching

```javascript
const converter = new Converter({
  cache: {
    enabled: true,
    ttl: 3600000,  // 1 hour
    maxEntries: 1000
  }
});
```

### Monitoring

```javascript
const converter = new Converter();

converter.on('complete', (duration, size) => {
  console.log(`Conversion took ${duration}ms, output size: ${size} bytes`);
});

converter.on('error', (error) => {
  console.error('Conversion error:', error);
});
```

## Security

### Input Sanitization

```javascript
const converter = new Converter({
  security: {
    maxInputSize: 100000,  // 100KB
    allowedTags: ['div', 'span', 'p'],  // For HTML labels
    sanitize: true
  }
});
```

### Resource Limits

```javascript
const converter = new Converter({
  limits: {
    maxExecutionTime: 30000,  // 30 seconds
    maxMemoryUsage: '512MB',
    maxFileSize: '10MB',
    rateLimit: 100  // requests per hour
  }
});
```

## Testing

### Unit Testing

```javascript
const { convert } = require('mermaid-to-drawio');

describe('Converter', () => {
  test('converts simple flowchart', async () => {
    const input = 'graph TD; A-->B;';
    const result = await convert(input);

    expect(result).toContain('<mxGraphModel>');
    expect(result).toContain('drawio');
  });

  test('handles invalid input', async () => {
    await expect(convert('invalid')).rejects.toThrow();
  });
});
```

### Integration Testing

```javascript
const { Converter } = require('mermaid-to-drawio');

describe('Converter Integration', () => {
  let converter;

  beforeAll(() => {
    converter = new Converter();
  });

  afterAll(async () => {
    await converter.close();
  });

  test('converts complex diagram', async () => {
    const complexDiagram = `
      graph TD;
      A[Start] --> B{Decision Point};
      B -->|Yes| C[Process 1];
      B -->|No| D[Process 2];
      C --> E[End];
      D --> E;
    `;

    const result = await converter.convert(complexDiagram);
    expect(result).toBeValidDrawioXml();
  });
});
```

## Migration Guide

### From v1.x to v2.x

```javascript
// v1.x
const result = await convert(mermaidCode, { theme: 'dark' });

// v2.x (same API, enhanced options)
const result = await convert(mermaidCode, {
  theme: 'dark',
  performance: { cache: true }
});
```

## Troubleshooting

### Common Issues

**Memory Leaks**
```javascript
// Ensure proper cleanup
const converter = new Converter();
try {
  await converter.convert(diagram);
} finally {
  await converter.close();
}
```

**Timeout Issues**
```javascript
const result = await convert(diagram, {
  timeout: 60000,  // Increase timeout
  retries: 3       // Add retries
});
```

**Browser Errors**
```javascript
const result = await convert(diagram, {
  browser: {
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  }
});
```

## See Also

- [Installation Guide](../Docs/INSTALLATION.md)
- [Configuration Guide](../Docs/CONFIGURATION.md)
- [Examples](../Assets/EXAMPLES.md)
- [Troubleshooting](../Assets/TROUBLESHOOTING.md)
