# Performance Guide

This guide covers performance optimization, benchmarking, and monitoring for the Mermaid to Draw.io converter.

## Performance Metrics

### Key Performance Indicators (KPIs)

- **Conversion Time**: Time to convert a diagram from Mermaid to Draw.io
- **Throughput**: Number of conversions per second/minute
- **Memory Usage**: RAM consumption during conversion
- **CPU Usage**: Processor utilization
- **Error Rate**: Percentage of failed conversions
- **Latency**: Response time for API calls

### Benchmarking Setup

#### Basic Benchmarking

```javascript
// benchmark.js
const { performance } = require('perf_hooks');
const converter = require('./converter');

async function benchmark(diagram, iterations = 100) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await converter.convert(diagram);
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

  return { avg, min, max, p95, iterations };
}
```

#### Load Testing

```javascript
// load-test.js
const autocannon = require('autocannon');

async function loadTest(url, connections = 10, duration = 10) {
  const result = await autocannon({
    url,
    connections,
    duration,
    headers: {
      'content-type': 'text/plain'
    },
    body: 'graph TD; A-->B; C-->D;'
  });

  console.log('Load Test Results:');
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency (avg): ${result.latency.average}ms`);
  console.log(`Errors: ${result.errors}`);
}
```

## Performance Optimization

### Browser Optimization

#### Browser Configuration

```javascript
// optimized-browser.js
const browser = await playwright.chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ]
});
```

#### Page Optimization

```javascript
// optimized-page.js
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 800 });

// Disable unnecessary features
await page.setJavaScriptEnabled(true);
await page.setCSSAnimationsEnabled(false);
await page.setCSSTransitionsEnabled(false);

// Preload Mermaid library
await page.addScriptTag({
  url: 'https://cdn.jsdelivr.net/npm/mermaid@10.2.3/dist/mermaid.min.js'
});
```

### Memory Management

#### Memory Pool

```javascript
// browser-pool.js
class BrowserPool {
  constructor(maxBrowsers = 4) {
    this.maxBrowsers = maxBrowsers;
    this.browsers = [];
    this.available = [];
  }

  async getBrowser() {
    if (this.available.length > 0) {
      return this.available.pop();
    }

    if (this.browsers.length < this.maxBrowsers) {
      const browser = await playwright.chromium.launch({
        headless: true,
        args: ['--no-sandbox']
      });
      this.browsers.push(browser);
      return browser;
    }

    // Wait for available browser
    return new Promise((resolve) => {
      const checkAvailable = () => {
        if (this.available.length > 0) {
          resolve(this.available.pop());
        } else {
          setTimeout(checkAvailable, 100);
        }
      };
      checkAvailable();
    });
  }

  releaseBrowser(browser) {
    this.available.push(browser);
  }

  async closeAll() {
    await Promise.all(this.browsers.map(b => b.close()));
  }
}
```

#### Garbage Collection

```javascript
// memory-cleanup.js
async function convertWithCleanup(input) {
  const browser = await browserPool.getBrowser();
  const page = await browser.newPage();

  try {
    // Perform conversion
    const result = await performConversion(page, input);
    return result;
  } finally {
    // Clean up
    await page.close();
    browserPool.releaseBrowser(browser);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
}
```

### Caching Strategies

#### Template Caching

```javascript
// template-cache.js
class TemplateCache {
  constructor(ttl = 3600000) { // 1 hour
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.value;
    }
    this.cache.delete(key);
    return null;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}
```

#### Result Caching

```javascript
// result-cache.js
const crypto = require('crypto');

class ResultCache {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  getCacheKey(input) {
    return crypto.createHash('md5').update(input).digest('hex');
  }

  async get(input) {
    const key = this.getCacheKey(input);
    return await this.redis.get(key);
  }

  async set(input, result, ttl = 3600) {
    const key = this.getCacheKey(input);
    await this.redis.setex(key, ttl, result);
  }
}
```

### Parallel Processing

#### Worker Threads

```javascript
// worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', async (data) => {
  try {
    const result = await convertDiagram(data.input);
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});
```

```javascript
// main-thread.js
const { Worker } = require('worker_threads');

async function convertWithWorkers(inputs) {
  const workers = [];
  const results = [];

  // Create workers
  for (let i = 0; i < Math.min(inputs.length, 4); i++) {
    workers.push(new Worker('./worker.js'));
  }

  // Process inputs
  const promises = inputs.map((input, index) => {
    return new Promise((resolve, reject) => {
      const worker = workers[index % workers.length];

      worker.postMessage({ input });

      worker.on('message', (message) => {
        if (message.success) {
          results[index] = message.result;
          resolve();
        } else {
          reject(new Error(message.error));
        }
      });
    });
  });

  await Promise.all(promises);

  // Clean up workers
  workers.forEach(worker => worker.terminate());

  return results;
}
```

### Database Optimization

#### Connection Pooling

```javascript
// db-pool.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'conversions',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function saveConversion(input, output) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'INSERT INTO conversions (input, output, created_at) VALUES (?, ?, NOW())',
      [input, output]
    );
  } finally {
    connection.release();
  }
}
```

## Monitoring and Profiling

### Application Metrics

```javascript
// metrics.js
const promClient = require('prom-client');

const register = new promClient.Registry();

// Conversion metrics
const conversionCounter = new promClient.Counter({
  name: 'conversions_total',
  help: 'Total number of conversions',
  labelNames: ['type', 'status']
});

const conversionDuration = new promClient.Histogram({
  name: 'conversion_duration_seconds',
  help: 'Duration of conversions in seconds',
  labelNames: ['type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Memory metrics
const memoryUsage = new promClient.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
});

// Register metrics
register.registerMetric(conversionCounter);
register.registerMetric(conversionDuration);
register.registerMetric(memoryUsage);

module.exports = {
  register,
  conversionCounter,
  conversionDuration,
  memoryUsage
};
```

### Profiling Tools

#### Node.js Built-in Profiler

```bash
# CPU profiling
node --prof converter.js input.mmd output.drawio

# Process profile
node --prof-process isolate-*.log > profile.txt
```

#### Clinic.js

```bash
# Install clinic
npm install -g clinic

# Doctor mode
clinic doctor -- node converter.js input.mmd output.drawio

# Flame mode
clinic flame -- node converter.js input.mmd output.drawio

# Heap dump
clinic heapprofiler -- node converter.js input.mmd output.drawio
```

#### Chrome DevTools

```javascript
// Enable DevTools in browser
const browser = await playwright.chromium.launch({
  headless: false,
  devtools: true
});
```

### Custom Profiling

```javascript
// profiler.js
class Profiler {
  constructor() {
    this.metrics = {
      conversions: 0,
      totalTime: 0,
      memoryPeaks: []
    };
  }

  startConversion() {
    this.startTime = performance.now();
    this.startMemory = process.memoryUsage();
  }

  endConversion() {
    const duration = performance.now() - this.startTime;
    const endMemory = process.memoryUsage();

    this.metrics.conversions++;
    this.metrics.totalTime += duration;
    this.metrics.memoryPeaks.push(endMemory.heapUsed);

    return {
      duration,
      memoryDelta: endMemory.heapUsed - this.startMemory.heapUsed
    };
  }

  getStats() {
    return {
      totalConversions: this.metrics.conversions,
      averageTime: this.metrics.totalTime / this.metrics.conversions,
      peakMemory: Math.max(...this.metrics.memoryPeaks),
      averageMemory: this.metrics.memoryPeaks.reduce((a, b) => a + b) / this.metrics.memoryPeaks.length
    };
  }
}
```

## Benchmark Results

### Test Environment

- **CPU**: Intel Core i7-9750H (6 cores, 12 threads)
- **RAM**: 16GB DDR4
- **OS**: macOS 12.6
- **Node.js**: v18.12.0
- **Playwright**: v1.28.1

### Simple Flowchart (3 nodes, 2 edges)

```
graph TD;
    A-->B;
    A-->C;
```

**Results:**
- Average conversion time: 1.2s
- 95th percentile: 1.8s
- Memory usage: 45MB
- CPU usage: 15%

### Complex Flowchart (50 nodes, 75 edges)

```
graph TD;
    A-->B;
    B-->C;
    // ... 47 more nodes
```

**Results:**
- Average conversion time: 3.5s
- 95th percentile: 5.2s
- Memory usage: 120MB
- CPU usage: 35%

### Gantt Chart (10 tasks, 3 months)

```
gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
    A task          :a1, 2023-01-01, 30d
    Another task    :after a1, 20d
    // ... 8 more tasks
```

**Results:**
- Average conversion time: 2.1s
- 95th percentile: 3.1s
- Memory usage: 68MB
- CPU usage: 22%

### Sequence Diagram (8 participants, 15 messages)

```
sequenceDiagram
    participant A
    participant B
    participant C
    A->>B: Message 1
    B->>C: Message 2
    // ... 13 more messages
```

**Results:**
- Average conversion time: 1.8s
- 95th percentile: 2.7s
- Memory usage: 52MB
- CPU usage: 18%

## Performance Tuning

### Configuration Tuning

```javascript
// optimal-config.js
const optimalConfig = {
  browser: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--memory-pressure-off'
    ]
  },
  page: {
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 1
  },
  conversion: {
    timeout: 30000,
    retries: 2,
    parallelLimit: 4
  },
  cache: {
    enabled: true,
    ttl: 3600000,
    maxSize: 100
  }
};
```

### System Tuning

#### Linux Optimizations

```bash
# Increase file descriptors
echo "fs.file-max = 100000" >> /etc/sysctl.conf
echo "* soft nofile 100000" >> /etc/security/limits.conf
echo "* hard nofile 100000" >> /etc/security/limits.conf

# Optimize network
echo "net.core.somaxconn = 1024" >> /etc/sysctl.conf

# Apply changes
sysctl -p
```

#### macOS Optimizations

```bash
# Increase file descriptors
sudo launchctl limit maxfiles 1000000 1000000

# Add to /etc/sysctl.conf
kern.maxfiles=1000000
kern.maxfilesperproc=1000000
```

### Scaling Strategies

#### Vertical Scaling

```javascript
// Increase resources
const config = {
  maxMemory: '2GB',
  maxCPUs: os.cpus().length,
  browserPoolSize: Math.min(os.cpus().length, 8)
};
```

#### Horizontal Scaling

```javascript
// Load balancer
const cluster = require('cluster');

if (cluster.isMaster) {
  const numWorkers = os.cpus().length;

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  startServer();
}
```

## Troubleshooting Performance Issues

### High Memory Usage

**Symptoms:**
- OutOfMemoryError
- Slow conversions
- System becomes unresponsive

**Solutions:**
1. Reduce browser pool size
2. Enable garbage collection
3. Monitor memory leaks
4. Use streaming for large files

### High CPU Usage

**Symptoms:**
- System slowdown
- High temperature
- Battery drain

**Solutions:**
1. Reduce parallel conversions
2. Optimize browser arguments
3. Use CPU profiling
4. Implement rate limiting

### Slow Conversions

**Symptoms:**
- Long response times
- Timeout errors
- User complaints

**Solutions:**
1. Check network connectivity
2. Optimize browser settings
3. Implement caching
4. Use faster hardware

### Monitoring Commands

```bash
# Monitor system resources
top -p $(pgrep node)

# Check memory usage
ps aux --sort=-%mem | head

# Monitor network
iftop

# Check disk I/O
iotop

# View system logs
journalctl -u mermaid-converter -f
```

## Performance Checklist

### Pre-deployment
- [ ] Run performance benchmarks
- [ ] Configure optimal settings
- [ ] Set up monitoring
- [ ] Test under load
- [ ] Configure auto-scaling

### Production Monitoring
- [ ] Monitor KPIs regularly
- [ ] Set up alerts
- [ ] Review performance logs
- [ ] Update configurations
- [ ] Plan capacity upgrades

### Optimization Tasks
- [ ] Profile application regularly
- [ ] Update dependencies
- [ ] Optimize database queries
- [ ] Implement caching layers
- [ ] Review architecture decisions
