# Performance Testing

This document outlines the performance testing strategy and benchmarks for the Mermaid to Draw.io Converter.

## Overview

Performance testing ensures the converter meets response time requirements and can handle production workloads efficiently.

## Performance Metrics

### Response Time Targets
- **Simple diagrams** (< 50 nodes): < 1 second
- **Complex diagrams** (50-200 nodes): < 3 seconds
- **Large diagrams** (> 200 nodes): < 10 seconds
- **Batch processing**: < 5 seconds per diagram (concurrent)

### Throughput Targets
- **Concurrent users**: 50 simultaneous conversions
- **Requests per minute**: 200 sustained
- **Peak load**: 100 concurrent requests

### Resource Usage Limits
- **Memory per conversion**: < 100MB
- **CPU usage**: < 80% during peak load
- **Disk I/O**: < 50MB per conversion
- **Network**: < 10MB per conversion

## Testing Environment

### Hardware Specifications
```
CPU: 4-core Intel i5 or equivalent
RAM: 8GB minimum, 16GB recommended
Storage: SSD with 50GB free space
Network: 100Mbps minimum
```

### Software Stack
```
Node.js: 18.x LTS or later
Playwright: Latest stable version
Browser: Chromium (headless)
OS: macOS/Linux/Windows
```

## Benchmark Tests

### Single Diagram Conversion

```javascript
// benchmarks/single-conversion.js
const { convertDiagram } = require('../src/converter');
const fixtures = require('../test-fixtures');

async function benchmarkSingleConversion() {
  const diagrams = [
    { name: 'simple', content: fixtures.simpleFlowchart },
    { name: 'complex', content: fixtures.complexFlowchart },
    { name: 'large', content: fixtures.largeDiagram }
  ];

  console.log('Single Diagram Conversion Benchmarks\n');
  console.log('Diagram Type | Nodes | Time (ms) | Memory (MB)');
  console.log('-------------|-------|-----------|------------');

  for (const diagram of diagrams) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      await convertDiagram(diagram.content);
    } catch (error) {
      console.log(`${diagram.name} | Error: ${error.message}`);
      continue;
    }

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;
    const duration = endTime - startTime;
    const memoryDelta = (endMemory - startMemory) / 1024 / 1024;

    // Estimate node count (rough approximation)
    const nodeCount = (diagram.content.match(/\[[^\]]+\]/g) || []).length;

    console.log(`${diagram.name.padEnd(12)} | ${nodeCount.toString().padEnd(5)} | ${duration.toString().padEnd(9)} | ${memoryDelta.toFixed(2)}`);
  }
}
```

### Concurrent Load Testing

```javascript
// benchmarks/concurrent-load.js
const { convertDiagram } = require('../src/converter');
const fixtures = require('../test-fixtures');

async function benchmarkConcurrentLoad() {
  const concurrencyLevels = [1, 5, 10, 20, 50];
  const testDiagram = fixtures.simpleFlowchart;
  const iterations = 10;

  console.log('Concurrent Load Benchmarks\n');
  console.log('Concurrency | Total Time (ms) | Avg Time (ms) | Success Rate');
  console.log('------------|----------------|---------------|-------------');

  for (const concurrency of concurrencyLevels) {
    const startTime = Date.now();
    let successCount = 0;
    let totalDuration = 0;

    // Create concurrent conversion tasks
    const tasks = Array(concurrency * iterations).fill().map(async () => {
      const taskStart = Date.now();
      try {
        await convertDiagram(testDiagram);
        successCount++;
        return Date.now() - taskStart;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(tasks);
    const endTime = Date.now();

    const validResults = results.filter(r => r !== null);
    const avgDuration = validResults.reduce((a, b) => a + b, 0) / validResults.length;
    const successRate = (successCount / (concurrency * iterations)) * 100;

    console.log(`${concurrency.toString().padEnd(11)} | ${(endTime - startTime).toString().padEnd(14)} | ${avgDuration.toFixed(0).padEnd(13)} | ${successRate.toFixed(1)}%`);
  }
}
```

### Memory Leak Testing

```javascript
// benchmarks/memory-leak.js
const { convertDiagram } = require('../src/converter');
const fixtures = require('../test-fixtures');

async function benchmarkMemoryLeak() {
  const testDiagram = fixtures.simpleFlowchart;
  const iterations = 100;

  console.log('Memory Leak Test\n');
  console.log('Iteration | Memory Usage (MB) | Growth (MB)');
  console.log('----------|-------------------|------------');

  let previousMemory = process.memoryUsage().heapUsed;

  for (let i = 1; i <= iterations; i++) {
    try {
      await convertDiagram(testDiagram);
    } catch (error) {
      console.log(`Error at iteration ${i}: ${error.message}`);
      continue;
    }

    if (i % 10 === 0) {
      const currentMemory = process.memoryUsage().heapUsed;
      const memoryMB = currentMemory / 1024 / 1024;
      const growth = (currentMemory - previousMemory) / 1024 / 1024;

      console.log(`${i.toString().padEnd(9)} | ${memoryMB.toFixed(2).padEnd(17)} | ${growth.toFixed(2)}`);

      previousMemory = currentMemory;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }
  }
}
```

### File I/O Performance

```javascript
// benchmarks/file-io.js
const { processFile } = require('../src/file-processor');
const fs = require('fs').promises;
const path = require('path');

async function benchmarkFileIO() {
  const testDir = './benchmarks/temp';
  const fileSizes = [1, 10, 50, 100]; // KB

  await fs.mkdir(testDir, { recursive: true });

  console.log('File I/O Performance Test\n');
  console.log('File Size (KB) | Write Time (ms) | Read Time (ms) | Process Time (ms)');
  console.log('---------------|----------------|---------------|-----------------');

  for (const sizeKB of fileSizes) {
    // Create test file
    const content = 'A'.repeat(sizeKB * 1024);
    const inputFile = path.join(testDir, `test-${sizeKB}kb.mmd`);
    const outputFile = path.join(testDir, `test-${sizeKB}kb.drawio`);

    // Write test
    const writeStart = Date.now();
    await fs.writeFile(inputFile, content);
    const writeTime = Date.now() - writeStart;

    // Process test
    const processStart = Date.now();
    await processFile(inputFile, outputFile);
    const processTime = Date.now() - processStart;

    // Read test
    const readStart = Date.now();
    await fs.readFile(outputFile);
    const readTime = Date.now() - readStart;

    console.log(`${sizeKB.toString().padEnd(13)} | ${writeTime.toString().padEnd(14)} | ${readTime.toString().padEnd(13)} | ${processTime.toString()}`);

    // Cleanup
    await fs.unlink(inputFile);
    await fs.unlink(outputFile);
  }

  await fs.rmdir(testDir);
}
```

## Load Testing with Artillery

### Installation
```bash
npm install -g artillery
```

### Load Test Configuration

```yaml
# benchmarks/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Load test"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: 'Convert diagram'
    weight: 80
    flow:
      - post:
          url: '/api/convert'
          json:
            mermaid: |
              flowchart TD
                A[Start] --> B[Process]
                B --> C[End]
          capture:
            json: '$.success'
            as: 'conversion_success'

  - name: 'Batch convert'
    weight: 20
    flow:
      - post:
          url: '/api/batch-convert'
          json:
            files:
              - content: |
                  flowchart TD
                    A[Start] --> B[End]
                filename: 'test1.mmd'
              - content: |
                  sequenceDiagram
                    A->>B: Hello
                    B->>A: Hi
                filename: 'test2.mmd'
```

### Running Load Tests

```bash
# Run load test
artillery run benchmarks/load-test.yml

# Generate HTML report
artillery run --output report.json benchmarks/load-test.yml
artillery report report.json
```

## Browser Performance Testing

### Playwright Performance Tracing

```javascript
// benchmarks/browser-performance.js
const { chromium } = require('playwright');

async function benchmarkBrowserPerformance() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Browser Performance Test\n');

  // Enable tracing
  await context.tracing.start({ screenshots: true, snapshots: true });

  const testDiagram = `
    flowchart TD
      A[Start] --> B[Process]
      B --> C[End]
  `;

  // Measure page load
  const loadStart = Date.now();
  await page.goto('http://localhost:3000');
  const loadTime = Date.now() - loadStart;
  console.log(`Page load time: ${loadTime}ms`);

  // Measure conversion
  const convertStart = Date.now();
  await page.fill('#mermaid-input', testDiagram);
  await page.click('#convert-button');
  await page.waitForSelector('#result');
  const convertTime = Date.now() - convertStart;
  console.log(`Conversion time: ${convertTime}ms`);

  // Stop tracing and save
  await context.tracing.stop({ path: 'trace.zip' });

  await browser.close();
}
```

## Database Performance (if applicable)

```javascript
// benchmarks/database-performance.js
const { Pool } = require('pg');

async function benchmarkDatabasePerformance() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  console.log('Database Performance Test\n');

  // Test insert performance
  const insertTimes = [];
  for (let i = 0; i < 100; i++) {
    const start = Date.now();
    await pool.query(
      'INSERT INTO conversions (user_id, input, output) VALUES ($1, $2, $3)',
      ['test-user', 'test-input', 'test-output']
    );
    insertTimes.push(Date.now() - start);
  }

  const avgInsert = insertTimes.reduce((a, b) => a + b) / insertTimes.length;
  console.log(`Average insert time: ${avgInsert.toFixed(2)}ms`);

  // Test query performance
  const queryTimes = [];
  for (let i = 0; i < 100; i++) {
    const start = Date.now();
    await pool.query('SELECT * FROM conversions WHERE user_id = $1', ['test-user']);
    queryTimes.push(Date.now() - start);
  }

  const avgQuery = queryTimes.reduce((a, b) => a + b) / queryTimes.length;
  console.log(`Average query time: ${avgQuery.toFixed(2)}ms`);

  await pool.end();
}
```

## Continuous Performance Monitoring

### Performance Regression Tests

```javascript
// benchmarks/regression-test.js
const { convertDiagram } = require('../src/converter');
const fs = require('fs').promises;

class PerformanceRegressionTest {
  constructor() {
    this.baselineFile = './benchmarks/baseline.json';
    this.threshold = 0.1; // 10% degradation allowed
  }

  async run() {
    const currentResults = await this.measurePerformance();
    const baselineResults = await this.loadBaseline();

    console.log('Performance Regression Test\n');

    for (const [metric, current] of Object.entries(currentResults)) {
      const baseline = baselineResults[metric];
      if (!baseline) continue;

      const change = (current - baseline) / baseline;
      const status = Math.abs(change) > this.threshold ? 'FAIL' : 'PASS';

      console.log(`${metric.padEnd(20)} | ${baseline.toFixed(2).padEnd(10)} | ${current.toFixed(2).padEnd(10)} | ${(change * 100).toFixed(1).padEnd(8)}% | ${status}`);
    }

    // Update baseline if all tests pass
    const allPass = Object.entries(currentResults).every(([metric, current]) => {
      const baseline = baselineResults[metric];
      if (!baseline) return true;
      const change = Math.abs(current - baseline) / baseline;
      return change <= this.threshold;
    });

    if (allPass) {
      await this.saveBaseline(currentResults);
      console.log('\nAll performance tests passed. Baseline updated.');
    }
  }

  async measurePerformance() {
    // Measure key performance metrics
    const results = {};

    // Simple conversion time
    const start = Date.now();
    await convertDiagram('flowchart TD\nA[Start] --> B[End]');
    results.simpleConversion = Date.now() - start;

    // Memory usage
    results.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    return results;
  }

  async loadBaseline() {
    try {
      const data = await fs.readFile(this.baselineFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  async saveBaseline(results) {
    await fs.writeFile(this.baselineFile, JSON.stringify(results, null, 2));
  }
}
```

## Performance Optimization Tips

### Code Optimizations
1. **Browser Pooling**: Reuse browser instances
2. **Caching**: Cache converted diagrams
3. **Streaming**: Stream large file processing
4. **Async Processing**: Use worker threads for CPU-intensive tasks

### Infrastructure Optimizations
1. **Load Balancing**: Distribute load across multiple instances
2. **CDN**: Serve static assets from CDN
3. **Database Indexing**: Optimize database queries
4. **Memory Management**: Monitor and optimize memory usage

### Monitoring and Alerting
1. **Response Time Monitoring**: Track API response times
2. **Error Rate Monitoring**: Monitor conversion failure rates
3. **Resource Monitoring**: Track CPU, memory, and disk usage
4. **User Experience Monitoring**: Monitor real user performance

## Benchmark Results Template

```markdown
# Performance Benchmark Results

**Date:** YYYY-MM-DD
**Environment:** [Production/Staging/Test]
**Load:** [Low/Medium/High]

## Summary
- Average response time: X ms
- 95th percentile: Y ms
- Error rate: Z%
- Throughput: W requests/minute

## Detailed Results

### Single Diagram Conversion
| Diagram Type | Size | Time (ms) | Memory (MB) |
|-------------|------|-----------|-------------|
| Simple      | 5 nodes | 150      | 25         |
| Complex     | 50 nodes| 800      | 60         |
| Large       | 200 nodes| 2500    | 120        |

### Concurrent Load
| Concurrency | Response Time (ms) | CPU Usage | Memory Usage |
|-------------|-------------------|-----------|--------------|
| 10         | 200              | 45%      | 200MB       |
| 50         | 450              | 75%      | 500MB       |
| 100        | 800              | 90%      | 800MB       |

### Recommendations
- [ ] Optimize database queries
- [ ] Implement caching layer
- [ ] Scale horizontally
- [ ] Monitor resource usage
```
