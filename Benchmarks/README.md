# Performance Benchmarks

This folder contains performance benchmarks, testing tools, and performance metrics for the Mermaid to Draw.io Converter.

## Benchmark Categories

### Conversion Speed Benchmarks
- **Simple Diagrams**: Basic flowchart and sequence diagrams
- **Complex Diagrams**: Large diagrams with many elements
- **Batch Processing**: Multiple diagram conversions
- **Memory Usage**: RAM consumption during conversion

### Accuracy Benchmarks
- **Format Fidelity**: How accurately diagrams are converted
- **Layout Preservation**: How well positioning is maintained
- **Styling Consistency**: CSS and visual styling preservation

### Scalability Benchmarks
- **Concurrent Users**: Multi-user load testing
- **Large File Handling**: Performance with big diagram files
- **API Throughput**: Requests per second handling

## Running Benchmarks

### Quick Benchmark Script

```bash
#!/bin/bash
# run-benchmarks.sh

echo "Running Mermaid Converter Benchmarks..."
echo "======================================="

# Create test diagrams
echo "Creating test diagrams..."
node create-test-diagrams.js

# Run conversion benchmarks
echo "Running conversion speed tests..."
node benchmark-conversions.js

# Run memory usage tests
echo "Running memory usage tests..."
node benchmark-memory.js

# Run accuracy tests
echo "Running accuracy tests..."
node benchmark-accuracy.js

# Generate report
echo "Generating benchmark report..."
node generate-report.js

echo "Benchmarks completed! Check benchmark-results.json"
```

### Individual Benchmark Tests

#### Conversion Speed Test

```javascript
// benchmark-conversions.js
const { performance } = require('perf_hooks');
const fs = require('fs');
const converter = require('../converter.js');

class ConversionBenchmark {
  constructor() {
    this.results = {
      simple: [],
      complex: [],
      batch: []
    };
  }

  async runAllBenchmarks() {
    console.log('Running conversion benchmarks...');

    await this.benchmarkSimpleDiagrams();
    await this.benchmarkComplexDiagrams();
    await this.benchmarkBatchProcessing();

    this.saveResults();
  }

  async benchmarkSimpleDiagrams() {
    console.log('Benchmarking simple diagrams...');

    const diagrams = this.loadTestDiagrams('simple');
    const results = [];

    for (const diagram of diagrams) {
      const startTime = performance.now();

      try {
        const result = await converter.convert(diagram.content, 'drawio');
        const endTime = performance.now();

        results.push({
          name: diagram.name,
          duration: endTime - startTime,
          success: true,
          outputSize: result.length
        });
      } catch (error) {
        results.push({
          name: diagram.name,
          duration: 0,
          success: false,
          error: error.message
        });
      }
    }

    this.results.simple = results;
  }

  async benchmarkComplexDiagrams() {
    console.log('Benchmarking complex diagrams...');

    const diagrams = this.loadTestDiagrams('complex');
    const results = [];

    for (const diagram of diagrams) {
      const startTime = performance.now();

      try {
        const result = await converter.convert(diagram.content, 'drawio');
        const endTime = performance.now();

        results.push({
          name: diagram.name,
          duration: endTime - startTime,
          success: true,
          outputSize: result.length,
          inputSize: diagram.content.length
        });
      } catch (error) {
        results.push({
          name: diagram.name,
          duration: 0,
          success: false,
          error: error.message
        });
      }
    }

    this.results.complex = results;
  }

  async benchmarkBatchProcessing() {
    console.log('Benchmarking batch processing...');

    const diagrams = this.loadTestDiagrams('all');
    const batchSizes = [10, 50, 100, 500];

    for (const batchSize of batchSizes) {
      const batch = diagrams.slice(0, batchSize);
      const startTime = performance.now();

      try {
        const promises = batch.map(diagram =>
          converter.convert(diagram.content, 'drawio')
        );

        await Promise.all(promises);
        const endTime = performance.now();

        this.results.batch.push({
          batchSize: batchSize,
          totalDuration: endTime - startTime,
          avgDuration: (endTime - startTime) / batchSize,
          success: true
        });
      } catch (error) {
        this.results.batch.push({
          batchSize: batchSize,
          totalDuration: 0,
          avgDuration: 0,
          success: false,
          error: error.message
        });
      }
    }
  }

  loadTestDiagrams(type) {
    // Load test diagrams from test-data directory
    const testDataDir = './test-data';

    try {
      const files = fs.readdirSync(testDataDir)
        .filter(file => file.endsWith('.mmd'))
        .filter(file => {
          if (type === 'all') return true;
          return file.includes(`-${type}-`);
        });

      return files.map(file => ({
        name: file,
        content: fs.readFileSync(`${testDataDir}/${file}`, 'utf8')
      }));
    } catch (error) {
      console.error('Error loading test diagrams:', error);
      return [];
    }
  }

  saveResults() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp: timestamp,
      results: this.results,
      summary: this.generateSummary()
    };

    fs.writeFileSync('benchmark-results.json', JSON.stringify(report, null, 2));
    console.log('Benchmark results saved to benchmark-results.json');
  }

  generateSummary() {
    const summary = {
      simple: this.calculateStats(this.results.simple),
      complex: this.calculateStats(this.results.complex),
      batch: this.results.batch
    };

    return summary;
  }

  calculateStats(results) {
    const successful = results.filter(r => r.success);
    const durations = successful.map(r => r.duration);

    if (durations.length === 0) {
      return {
        totalTests: results.length,
        successfulTests: 0,
        successRate: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0
      };
    }

    return {
      totalTests: results.length,
      successfulTests: successful.length,
      successRate: (successful.length / results.length * 100).toFixed(1) + '%',
      avgDuration: (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) + 'ms',
      minDuration: Math.min(...durations).toFixed(2) + 'ms',
      maxDuration: Math.max(...durations).toFixed(2) + 'ms'
    };
  }
}

// Run benchmarks
const benchmark = new ConversionBenchmark();
benchmark.runAllBenchmarks().catch(console.error);
```

#### Memory Usage Benchmark

```javascript
// benchmark-memory.js
const { performance } = require('perf_hooks');
const fs = require('fs');
const converter = require('../converter.js');

class MemoryBenchmark {
  constructor() {
    this.results = [];
  }

  async runMemoryBenchmarks() {
    console.log('Running memory usage benchmarks...');

    const testCases = [
      { name: 'small-diagram', size: 'small' },
      { name: 'medium-diagram', size: 'medium' },
      { name: 'large-diagram', size: 'large' },
      { name: 'batch-10', size: 'batch', count: 10 },
      { name: 'batch-50', size: 'batch', count: 50 },
      { name: 'batch-100', size: 'batch', count: 100 }
    ];

    for (const testCase of testCases) {
      const result = await this.measureMemoryUsage(testCase);
      this.results.push(result);
      console.log(`${testCase.name}: ${result.peakMemoryMB}MB peak, ${result.duration}ms`);
    }

    this.saveResults();
  }

  async measureMemoryUsage(testCase) {
    const startMemory = process.memoryUsage();
    const startTime = performance.now();

    try {
      if (testCase.size === 'batch') {
        // Batch processing
        const diagrams = this.loadTestDiagrams('simple').slice(0, testCase.count);
        const promises = diagrams.map(diagram =>
          converter.convert(diagram.content, 'drawio')
        );
        await Promise.all(promises);
      } else {
        // Single diagram
        const diagram = this.loadTestDiagrams(testCase.size)[0];
        if (diagram) {
          await converter.convert(diagram.content, 'drawio');
        }
      }
    } catch (error) {
      console.error(`Error in ${testCase.name}:`, error);
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage();

    return {
      testName: testCase.name,
      duration: (endTime - startTime).toFixed(2),
      startMemoryMB: (startMemory.heapUsed / 1024 / 1024).toFixed(2),
      endMemoryMB: (endMemory.heapUsed / 1024 / 1024).toFixed(2),
      finalMemoryMB: (finalMemory.heapUsed / 1024 / 1024).toFixed(2),
      peakMemoryMB: Math.max(
        startMemory.heapUsed,
        endMemory.heapUsed,
        finalMemory.heapUsed
      ) / 1024 / 1024,
      memoryIncreaseMB: ((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)
    };
  }

  loadTestDiagrams(size) {
    const testDataDir = './test-data';

    try {
      let pattern;
      switch (size) {
        case 'small':
          pattern = 'small';
          break;
        case 'medium':
          pattern = 'medium';
          break;
        case 'large':
          pattern = 'large';
          break;
        default:
          pattern = 'simple';
      }

      const files = fs.readdirSync(testDataDir)
        .filter(file => file.endsWith('.mmd'))
        .filter(file => file.includes(`-${pattern}-`));

      return files.map(file => ({
        name: file,
        content: fs.readFileSync(`${testDataDir}/${file}`, 'utf8')
      }));
    } catch (error) {
      console.error('Error loading test diagrams:', error);
      return [];
    }
  }

  saveResults() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp: timestamp,
      results: this.results,
      summary: this.generateSummary()
    };

    fs.writeFileSync('memory-benchmark-results.json', JSON.stringify(report, null, 2));
    console.log('Memory benchmark results saved to memory-benchmark-results.json');
  }

  generateSummary() {
    const memoryUsages = this.results.map(r => r.peakMemoryMB);
    const durations = this.results.map(r => parseFloat(r.duration));

    return {
      avgPeakMemory: (memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length).toFixed(2) + 'MB',
      maxPeakMemory: Math.max(...memoryUsages).toFixed(2) + 'MB',
      avgDuration: (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) + 'ms',
      maxDuration: Math.max(...durations).toFixed(2) + 'ms'
    };
  }
}

// Run memory benchmarks
const benchmark = new MemoryBenchmark();
benchmark.runMemoryBenchmarks().catch(console.error);
```

#### Load Testing Benchmark

```javascript
// benchmark-load.js
const axios = require('axios');
const { performance } = require('perf_hooks');

class LoadBenchmark {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    this.testDiagram = `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`;
  }

  async runLoadTests() {
    console.log('Running load benchmarks...');

    const concurrencyLevels = [1, 5, 10, 25, 50, 100];

    for (const concurrency of concurrencyLevels) {
      console.log(`Testing with ${concurrency} concurrent requests...`);
      const result = await this.testConcurrency(concurrency);
      console.log(`  ${result.requestsPerSecond} req/sec, ${result.avgResponseTime}ms avg, ${result.errorRate}% errors`);
    }
  }

  async testConcurrency(concurrency) {
    const totalRequests = concurrency * 10; // 10 requests per concurrency level
    const results = [];
    const startTime = performance.now();

    // Create concurrent requests
    const promises = [];
    for (let i = 0; i < totalRequests; i++) {
      promises.push(this.makeRequest());
    }

    const responses = await Promise.allSettled(promises);
    const endTime = performance.now();

    // Process results
    let successful = 0;
    let failed = 0;
    const responseTimes = [];

    responses.forEach(result => {
      if (result.status === 'fulfilled') {
        successful++;
        responseTimes.push(result.value.duration);
      } else {
        failed++;
      }
    });

    const totalDuration = endTime - startTime;
    const requestsPerSecond = (totalRequests / totalDuration * 1000).toFixed(2);
    const avgResponseTime = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
      : 0;
    const errorRate = ((failed / totalRequests) * 100).toFixed(1);

    return {
      concurrency: concurrency,
      totalRequests: totalRequests,
      successfulRequests: successful,
      failedRequests: failed,
      totalDuration: totalDuration.toFixed(2),
      requestsPerSecond: requestsPerSecond,
      avgResponseTime: avgResponseTime,
      errorRate: errorRate,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes).toFixed(2) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes).toFixed(2) : 0
    };
  }

  async makeRequest() {
    const startTime = performance.now();

    try {
      const response = await axios.post(`${this.baseUrl}/api/v3/convert`, {
        mermaid: this.testDiagram,
        format: 'drawio'
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const endTime = performance.now();

      return {
        success: true,
        statusCode: response.status,
        duration: endTime - startTime,
        responseSize: JSON.stringify(response.data).length
      };
    } catch (error) {
      const endTime = performance.now();

      return {
        success: false,
        error: error.message,
        duration: endTime - startTime
      };
    }
  }

  async runSustainedLoad(durationMinutes = 5) {
    console.log(`Running sustained load test for ${durationMinutes} minutes...`);

    const endTime = Date.now() + (durationMinutes * 60 * 1000);
    const results = [];
    let requestCount = 0;

    while (Date.now() < endTime) {
      const concurrency = 10; // 10 concurrent requests
      const batchResults = await this.testConcurrency(concurrency);
      results.push(batchResults);
      requestCount += batchResults.totalRequests;

      // Wait 1 second between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const summary = this.analyzeSustainedResults(results, durationMinutes);
    console.log('Sustained load test completed:');
    console.log(`  Total requests: ${requestCount}`);
    console.log(`  Avg req/sec: ${summary.avgRequestsPerSecond}`);
    console.log(`  Avg response time: ${summary.avgResponseTime}ms`);
    console.log(`  Error rate: ${summary.avgErrorRate}%`);

    return summary;
  }

  analyzeSustainedResults(results, durationMinutes) {
    const totalRequests = results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = results.reduce((sum, r) => sum + r.successfulRequests, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failedRequests, 0);
    const avgRequestsPerSecond = results.reduce((sum, r) => sum + parseFloat(r.requestsPerSecond), 0) / results.length;
    const avgResponseTime = results.reduce((sum, r) => sum + parseFloat(r.avgResponseTime), 0) / results.length;
    const avgErrorRate = results.reduce((sum, r) => sum + parseFloat(r.errorRate), 0) / results.length;

    return {
      durationMinutes: durationMinutes,
      totalRequests: totalRequests,
      totalSuccessful: totalSuccessful,
      totalFailed: totalFailed,
      avgRequestsPerSecond: avgRequestsPerSecond.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(2),
      avgErrorRate: avgErrorRate.toFixed(1),
      stability: this.assessStability(results)
    };
  }

  assessStability(results) {
    const responseTimes = results.map(r => parseFloat(r.avgResponseTime));
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / responseTimes.length;
    const stdDev = Math.sqrt(variance);

    // Stability rating based on standard deviation
    const cv = (stdDev / avgTime) * 100; // Coefficient of variation

    if (cv < 10) return 'Excellent';
    if (cv < 25) return 'Good';
    if (cv < 50) return 'Fair';
    return 'Poor';
  }
}

// Run load benchmarks
const benchmark = new LoadBenchmark();
benchmark.runLoadTests().then(() => {
  return benchmark.runSustainedLoad(1); // 1 minute sustained test
}).catch(console.error);
```

## Test Data Generation

### Create Test Diagrams Script

```javascript
// create-test-diagrams.js
const fs = require('fs');
const path = require('path');

class TestDiagramGenerator {
  constructor() {
    this.outputDir = './test-data';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  generateAllTestDiagrams() {
    console.log('Generating test diagrams...');

    this.generateSimpleDiagrams();
    this.generateComplexDiagrams();
    this.generateLargeDiagrams();
    this.generateSpecializedDiagrams();

    console.log('Test diagrams generated in ./test-data/');
  }

  generateSimpleDiagrams() {
    const diagrams = [
      {
        name: 'simple-flowchart-1',
        content: `flowchart TD
    A[Start] --> B[Process]
    B --> C[End]`
      },
      {
        name: 'simple-sequence-1',
        content: `sequenceDiagram
    Alice->>Bob: Hello
    Bob-->>Alice: Hi`
      },
      {
        name: 'simple-gantt-1',
        content: `gantt
    title Simple Gantt
    dateFormat YYYY-MM-DD
    section Planning
    Task 1 :done, 2024-01-01, 2024-01-03`
      }
    ];

    diagrams.forEach(diagram => {
      this.saveDiagram(diagram.name, diagram.content);
    });
  }

  generateComplexDiagrams() {
    const diagrams = [
      {
        name: 'complex-flowchart-1',
        content: this.generateComplexFlowchart()
      },
      {
        name: 'complex-sequence-1',
        content: this.generateComplexSequence()
      },
      {
        name: 'complex-mindmap-1',
        content: this.generateComplexMindmap()
      }
    ];

    diagrams.forEach(diagram => {
      this.saveDiagram(diagram.name, diagram.content);
    });
  }

  generateComplexFlowchart() {
    let diagram = 'flowchart TD\n';

    // Generate 50 nodes with connections
    for (let i = 1; i <= 50; i++) {
      const shape = ['[', '(', '{', '((', '>', ']'][i % 6];
      const closeShape = shape === '[' ? ']' : shape === '(' ? ')' : shape === '{' ? '}' : shape === '((' ? '))' : shape === '>' ? ']' : ']';
      diagram += `    Node${i}${shape}Node ${i} - Complex Process${closeShape}\n`;
    }

    // Add connections
    for (let i = 1; i < 50; i++) {
      const nextConnections = Math.min(3, 50 - i);
      for (let j = 1; j <= nextConnections; j++) {
        if (i + j <= 50) {
          diagram += `    Node${i} --> Node${i + j}\n`;
        }
      }
    }

    return diagram;
  }

  generateComplexSequence() {
    let diagram = 'sequenceDiagram\n';

    const participants = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];

    // Add participants
    participants.forEach(participant => {
      diagram += `    participant ${participant}\n`;
    });

    // Generate complex interactions
    for (let i = 0; i < participants.length - 1; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const from = participants[i];
        const to = participants[j];
        const message = `Message ${i}-${j}`;
        diagram += `    ${from}->>${to}: ${message}\n`;

        if (Math.random() > 0.5) {
          diagram += `    ${to}-->>${from}: Response ${j}-${i}\n`;
        }
      }
    }

    return diagram;
  }

  generateComplexMindmap() {
    let diagram = 'mindmap\n';
    diagram += '  root((Mermaid to Draw.io Converter))\n';

    const mainBranches = [
      'Core Features',
      'Supported Formats',
      'Integrations',
      'Performance',
      'Security',
      'Documentation'
    ];

    mainBranches.forEach((branch, index) => {
      diagram += `    ${branch}\n`;

      // Add sub-branches
      for (let i = 1; i <= 5; i++) {
        diagram += `      ${branch} ${i}\n`;

        // Add leaves
        for (let j = 1; j <= 3; j++) {
          diagram += `        ${branch} ${i}.${j}\n`;
        }
      }
    });

    return diagram;
  }

  generateLargeDiagrams() {
    // Generate very large diagrams for stress testing
    const largeFlowchart = this.generateLargeFlowchart(200);
    this.saveDiagram('large-flowchart-1', largeFlowchart);

    const largeSequence = this.generateLargeSequence(50);
    this.saveDiagram('large-sequence-1', largeSequence);
  }

  generateLargeFlowchart(nodeCount) {
    let diagram = 'flowchart TD\n';

    for (let i = 1; i <= nodeCount; i++) {
      const shapes = ['[', '(', '{', '((', '>', ']'];
      const shape = shapes[i % shapes.length];
      const closeShape = shape === '[' ? ']' : shape === '(' ? ')' : shape === '{' ? '}' : shape === '((' ? '))' : shape === '>' ? ']' : ']';
      diagram += `    N${i}${shape}Large Node ${i} with considerable amount of text that makes it quite long${closeShape}\n`;
    }

    // Create a more complex connection pattern
    for (let i = 1; i <= nodeCount; i++) {
      const connections = Math.min(5, nodeCount - i);
      for (let j = 1; j <= connections; j++) {
        if (i + j <= nodeCount) {
          diagram += `    N${i} --> N${i + j}\n`;
        }
      }
    }

    return diagram;
  }

  generateLargeSequence(participantCount) {
    let diagram = 'sequenceDiagram\n';

    // Add many participants
    for (let i = 1; i <= participantCount; i++) {
      diagram += `    participant P${i}\n`;
    }

    // Generate many interactions
    for (let i = 1; i <= participantCount; i++) {
      for (let j = 1; j <= participantCount; j++) {
        if (i !== j) {
          const message = `Complex message from P${i} to P${j} with detailed content`;
          diagram += `    P${i}->>P${j}: ${message}\n`;

          if (Math.random() > 0.7) {
            diagram += `    P${j}-->>P${i}: Response with additional context\n`;
          }
        }
      }
    }

    return diagram;
  }

  generateSpecializedDiagrams() {
    const specialized = [
      {
        name: 'special-piechart-1',
        content: `pie title Sample Pie Chart
    "Category A" : 45
    "Category B" : 30
    "Category C" : 15
    "Category D" : 10`
      },
      {
        name: 'special-kanban-1',
        content: `kanban
    Todo
      [Task 1]
      [Task 2]
    In Progress
      [Task 3]
    Done
      [Task 4]`
      },
      {
        name: 'special-timeline-1',
        content: `timeline
    title Company Timeline
    2020 : Company founded
    2021 : First product launch
    2022 : Series A funding
    2023 : International expansion
    2024 : 1 million users milestone`
      }
    ];

    specialized.forEach(diagram => {
      this.saveDiagram(diagram.name, diagram.content);
    });
  }

  saveDiagram(name, content) {
    const filename = `${name}.mmd`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Generated: ${filename}`);
  }
}

// Generate all test diagrams
const generator = new TestDiagramGenerator();
generator.generateAllTestDiagrams();
```

## Benchmark Results Analysis

### Results Report Generator

```javascript
// generate-report.js
const fs = require('fs');

class BenchmarkReportGenerator {
  constructor() {
    this.reports = {};
  }

  async generateComprehensiveReport() {
    console.log('Generating comprehensive benchmark report...');

    // Load all benchmark results
    this.loadBenchmarkResults();

    // Generate HTML report
    const htmlReport = this.generateHTMLReport();

    // Generate JSON summary
    const jsonSummary = this.generateJSONSummary();

    // Save reports
    fs.writeFileSync('benchmark-report.html', htmlReport);
    fs.writeFileSync('benchmark-summary.json', JSON.stringify(jsonSummary, null, 2));

    console.log('Reports generated:');
    console.log('  - benchmark-report.html');
    console.log('  - benchmark-summary.json');
  }

  loadBenchmarkResults() {
    const resultFiles = [
      'benchmark-results.json',
      'memory-benchmark-results.json',
      'load-benchmark-results.json'
    ];

    resultFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          this.reports[file.replace('.json', '')] = JSON.parse(fs.readFileSync(file, 'utf8'));
        }
      } catch (error) {
        console.warn(`Could not load ${file}:`, error.message);
      }
    });
  }

  generateHTMLReport() {
    const timestamp = new Date().toLocaleString();

    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Mermaid Converter Benchmark Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e8f4f8; border-radius: 3px; }
        .chart { margin: 20px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .good { color: green; }
        .warning { color: orange; }
        .bad { color: red; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Mermaid to Draw.io Converter - Benchmark Report</h1>
        <p>Generated on: ${timestamp}</p>
    </div>
`;

    // Conversion Benchmarks
    if (this.reports['benchmark-results']) {
      html += this.generateConversionSection();
    }

    // Memory Benchmarks
    if (this.reports['memory-benchmark-results']) {
      html += this.generateMemorySection();
    }

    // Load Benchmarks
    if (this.reports['load-benchmark-results']) {
      html += this.generateLoadSection();
    }

    // Recommendations
    html += this.generateRecommendationsSection();

    html += `
</body>
</html>`;

    return html;
  }

  generateConversionSection() {
    const data = this.reports['benchmark-results'];
    const summary = data.summary;

    let html = `
    <div class="section">
        <h2>Conversion Performance</h2>
        <div class="metric">Simple Diagrams: ${summary.simple.successRate} success rate, ${summary.simple.avgDuration} avg</div>
        <div class="metric">Complex Diagrams: ${summary.complex.successRate} success rate, ${summary.complex.avgDuration} avg</div>

        <h3>Simple Diagrams</h3>
        <table>
            <tr><th>Test Name</th><th>Duration (ms)</th><th>Status</th><th>Output Size</th></tr>`;

    data.results.simple.forEach(result => {
      const statusClass = result.success ? 'good' : 'bad';
      html += `<tr>
        <td>${result.name}</td>
        <td>${result.duration.toFixed(2)}</td>
        <td class="${statusClass}">${result.success ? 'Success' : 'Failed'}</td>
        <td>${result.outputSize || 'N/A'}</td>
      </tr>`;
    });

    html += `
        </table>

        <h3>Complex Diagrams</h3>
        <table>
            <tr><th>Test Name</th><th>Duration (ms)</th><th>Status</th><th>Input Size</th><th>Output Size</th></tr>`;

    data.results.complex.forEach(result => {
      const statusClass = result.success ? 'good' : 'bad';
      html += `<tr>
        <td>${result.name}</td>
        <td>${result.duration.toFixed(2)}</td>
        <td class="${statusClass}">${result.success ? 'Success' : 'Failed'}</td>
        <td>${result.inputSize || 'N/A'}</td>
        <td>${result.outputSize || 'N/A'}</td>
      </tr>`;
    });

    html += `
        </table>

        <h3>Batch Processing</h3>
        <table>
            <tr><th>Batch Size</th><th>Total Duration (ms)</th><th>Avg Duration (ms)</th><th>Status</th></tr>`;

    data.results.batch.forEach(result => {
      const statusClass = result.success ? 'good' : 'bad';
      html += `<tr>
        <td>${result.batchSize}</td>
        <td>${result.totalDuration.toFixed(2)}</td>
        <td>${result.avgDuration.toFixed(2)}</td>
        <td class="${statusClass}">${result.success ? 'Success' : 'Failed'}</td>
      </tr>`;
    });

    html += `
        </table>
    </div>`;

    return html;
  }

  generateMemorySection() {
    const data = this.reports['memory-benchmark-results'];
    const summary = data.summary;

    let html = `
    <div class="section">
        <h2>Memory Usage</h2>
        <div class="metric">Avg Peak Memory: ${summary.avgPeakMemory}</div>
        <div class="metric">Max Peak Memory: ${summary.maxPeakMemory}</div>
        <div class="metric">Avg Duration: ${summary.avgDuration}</div>

        <table>
            <tr><th>Test Name</th><th>Peak Memory (MB)</th><th>Memory Increase (MB)</th><th>Duration (ms)</th></tr>`;

    data.results.forEach(result => {
      html += `<tr>
        <td>${result.testName}</td>
        <td>${result.peakMemoryMB.toFixed(2)}</td>
        <td>${result.memoryIncreaseMB}</td>
        <td>${result.duration}</td>
      </tr>`;
    });

    html += `
        </table>
    </div>`;

    return html;
  }

  generateLoadSection() {
    // This would be populated with load test results
    return `
    <div class="section">
        <h2>Load Testing</h2>
        <p>Load test results would be displayed here.</p>
    </div>`;
  }

  generateRecommendationsSection() {
    let html = `
    <div class="section">
        <h2>Performance Recommendations</h2>
        <ul>`;

    // Analyze results and provide recommendations
    if (this.reports['benchmark-results']) {
      const convSummary = this.reports['benchmark-results'].summary;

      if (parseFloat(convSummary.simple.avgDuration.replace('ms', '')) > 100) {
        html += '<li class="warning">Consider optimizing simple diagram conversion performance</li>';
      }

      if (parseFloat(convSummary.complex.successRate.replace('%', '')) < 95) {
        html += '<li class="bad">Complex diagram conversion success rate needs improvement</li>';
      }
    }

    if (this.reports['memory-benchmark-results']) {
      const memSummary = this.reports['memory-benchmark-results'].summary;
      const maxMem = parseFloat(memSummary.maxPeakMemory.replace('MB', ''));

      if (maxMem > 500) {
        html += '<li class="warning">High memory usage detected - consider memory optimization</li>';
      }
    }

    html += `
        <li>Regular performance monitoring recommended</li>
        <li>Consider implementing caching for frequently converted diagrams</li>
        <li>Monitor memory usage in production environment</li>
        </ul>
    </div>`;

    return html;
  }

  generateJSONSummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      overall: {
        status: 'completed'
      }
    };

    // Aggregate key metrics
    if (this.reports['benchmark-results']) {
      summary.conversion = {
        simpleSuccessRate: this.reports['benchmark-results'].summary.simple.successRate,
        complexSuccessRate: this.reports['benchmark-results'].summary.complex.successRate,
        simpleAvgDuration: this.reports['benchmark-results'].summary.simple.avgDuration,
        complexAvgDuration: this.reports['benchmark-results'].summary.complex.avgDuration
      };
    }

    if (this.reports['memory-benchmark-results']) {
      summary.memory = this.reports['memory-benchmark-results'].summary;
    }

    return summary;
  }
}

// Generate comprehensive report
const generator = new BenchmarkReportGenerator();
generator.generateComprehensiveReport().catch(console.error);
```

## Performance Comparison with Alternatives

### Comparison Framework

```javascript
// compare-tools.js
const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs');

class ToolComparison {
  constructor() {
    this.tools = {
      'mermaid-converter': {
        url: 'http://localhost:8080/api/v3/convert',
        format: 'mermaid'
      },
      // Add other tools for comparison
      // 'alternative-tool': {
      //   url: 'https://alternative-tool.com/api/convert',
      //   format: 'different'
      // }
    };

    this.testDiagrams = this.loadTestDiagrams();
  }

  async compareAllTools() {
    console.log('Comparing performance across tools...');

    const results = {};

    for (const [toolName, config] of Object.entries(this.tools)) {
      console.log(`Testing ${toolName}...`);
      results[toolName] = await this.testTool(toolName, config);
    }

    this.generateComparisonReport(results);
  }

  async testTool(toolName, config) {
    const results = [];

    for (const diagram of this.testDiagrams) {
      const startTime = performance.now();

      try {
        const response = await axios.post(config.url, {
          [config.format]: diagram.content,
          format: 'drawio'
        }, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const endTime = performance.now();

        results.push({
          diagram: diagram.name,
          duration: endTime - startTime,
          success: true,
          outputSize: JSON.stringify(response.data).length
        });
      } catch (error) {
        results.push({
          diagram: diagram.name,
          duration: 0,
          success: false,
          error: error.message
        });
      }
    }

    return {
      results: results,
      summary: this.calculateToolSummary(results)
    };
  }

  calculateToolSummary(results) {
    const successful = results.filter(r => r.success);
    const durations = successful.map(r => r.duration);

    return {
      totalTests: results.length,
      successfulTests: successful.length,
      successRate: (successful.length / results.length * 100).toFixed(1) + '%',
      avgDuration: durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) : 0,
      minDuration: durations.length > 0 ? Math.min(...durations).toFixed(2) : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations).toFixed(2) : 0
    };
  }

  loadTestDiagrams() {
    const testDataDir = './test-data';

    try {
      const files = fs.readdirSync(testDataDir)
        .filter(file => file.endsWith('.mmd'))
        .slice(0, 10); // Test with first 10 diagrams

      return files.map(file => ({
        name: file,
        content: fs.readFileSync(`${testDataDir}/${file}`, 'utf8')
      }));
    } catch (error) {
      console.error('Error loading test diagrams:', error);
      return [];
    }
  }

  generateComparisonReport(results) {
    const timestamp = new Date().toISOString();

    const report = {
      timestamp: timestamp,
      comparison: results,
      winner: this.determineWinner(results)
    };

    fs.writeFileSync('tool-comparison-report.json', JSON.stringify(report, null, 2));

    console.log('Tool comparison report generated: tool-comparison-report.json');

    // Print summary
    console.log('\n=== Tool Comparison Summary ===');
    Object.entries(results).forEach(([tool, data]) => {
      console.log(`${tool}: ${data.summary.successRate} success, ${data.summary.avgDuration}ms avg`);
    });
  }

  determineWinner(results) {
    let bestTool = null;
    let bestScore = -1;

    Object.entries(results).forEach(([tool, data]) => {
      const successRate = parseFloat(data.summary.successRate.replace('%', ''));
      const avgDuration = parseFloat(data.summary.avgDuration);

      // Simple scoring: 70% success rate, 30% performance
      const score = (successRate * 0.7) + ((1000 / (avgDuration + 1)) * 0.3);

      if (score > bestScore) {
        bestScore = score;
        bestTool = tool;
      }
    });

    return {
      tool: bestTool,
      score: bestScore.toFixed(2)
    };
  }
}

// Run comparison
const comparison = new ToolComparison();
comparison.compareAllTools().catch(console.error);
```

## Continuous Performance Monitoring

### Performance Monitoring Setup

```javascript
// performance-monitor.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8080';
    this.monitoringDir = config.monitoringDir || './performance-monitoring';
    this.intervalMinutes = config.intervalMinutes || 60; // Monitor every hour
    this.retentionDays = config.retentionDays || 30;

    this.ensureMonitoringDir();
    this.startMonitoring();
  }

  ensureMonitoringDir() {
    if (!fs.existsSync(this.monitoringDir)) {
      fs.mkdirSync(this.monitoringDir, { recursive: true });
    }
  }

  startMonitoring() {
    console.log(`Starting performance monitoring (every ${this.intervalMinutes} minutes)...`);

    // Run initial test
    this.runPerformanceTest();

    // Schedule regular tests
    this.interval = setInterval(() => {
      this.runPerformanceTest();
    }, this.intervalMinutes * 60 * 1000);

    // Cleanup old logs
    this.cleanupOldLogs();
    setInterval(() => {
      this.cleanupOldLogs();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  async runPerformanceTest() {
    const timestamp = new Date().toISOString();
    const testResults = await this.performQuickTest();

    const logEntry = {
      timestamp: timestamp,
      results: testResults
    };

    // Save to daily log file
    const dateStr = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.monitoringDir, `performance-${dateStr}.json`);

    let existingLogs = [];
    if (fs.existsSync(logFile)) {
      try {
        existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (error) {
        console.error('Error reading existing log file:', error);
      }
    }

    existingLogs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));

    // Check for performance degradation
    this.checkPerformanceDegradation(existingLogs);

    console.log(`Performance test completed at ${timestamp}`);
  }

  async performQuickTest() {
    const testDiagram = `flowchart TD
    A[Start] --> B[Process]
    B --> C[End]`;

    const startTime = performance.now();

    try {
      const response = await axios.post(`${this.baseUrl}/api/v3/convert`, {
        mermaid: testDiagram,
        format: 'drawio'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const endTime = performance.now();

      return {
        success: true,
        responseTime: endTime - startTime,
        statusCode: response.status,
        responseSize: JSON.stringify(response.data).length
      };
    } catch (error) {
      const endTime = performance.now();

      return {
        success: false,
        responseTime: endTime - startTime,
        error: error.message
      };
    }
  }

  checkPerformanceDegradation(logs) {
    if (logs.length < 10) return; // Need some history

    const recentLogs = logs.slice(-10);
    const successfulTests = recentLogs.filter(log => log.results.success);

    if (successfulTests.length < 5) {
      console.warn('WARNING: Low success rate in recent tests');
      return;
    }

    const avgResponseTime = successfulTests.reduce((sum, log) => sum + log.results.responseTime, 0) / successfulTests.length;
    const baselineResponseTime = this.calculateBaselineResponseTime(logs);

    const degradationPercent = ((avgResponseTime - baselineResponseTime) / baselineResponseTime) * 100;

    if (degradationPercent > 20) {
      console.warn(`WARNING: Performance degradation detected: ${degradationPercent.toFixed(1)}% slower than baseline`);
      this.alertPerformanceIssue(degradationPercent, avgResponseTime, baselineResponseTime);
    }
  }

  calculateBaselineResponseTime(logs) {
    // Use first 20% of logs as baseline (assuming stable performance initially)
    const baselineCount = Math.max(5, Math.floor(logs.length * 0.2));
    const baselineLogs = logs.slice(0, baselineCount).filter(log => log.results.success);

    if (baselineLogs.length === 0) return 1000; // Default fallback

    return baselineLogs.reduce((sum, log) => sum + log.results.responseTime, 0) / baselineLogs.length;
  }

  alertPerformanceIssue(degradationPercent, currentAvg, baselineAvg) {
    const alert = {
      timestamp: new Date().toISOString(),
      type: 'performance_degradation',
      degradationPercent: degradationPercent.toFixed(1),
      currentAvgResponseTime: currentAvg.toFixed(2),
      baselineAvgResponseTime: baselineAvg.toFixed(2),
      message: `Performance has degraded by ${degradationPercent.toFixed(1)}%`
    };

    const alertFile = path.join(this.monitoringDir, 'performance-alerts.json');
    let existingAlerts = [];
    if (fs.existsSync(alertFile)) {
      try {
        existingAlerts = JSON.parse(fs.readFileSync(alertFile, 'utf8'));
      } catch (error) {
        // Ignore errors
      }
    }

    existingAlerts.push(alert);
    fs.writeFileSync(alertFile, JSON.stringify(existingAlerts, null, 2));

    console.error('🚨 PERFORMANCE ALERT:', alert.message);
  }

  cleanupOldLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const files = fs.readdirSync(this.monitoringDir)
      .filter(file => file.startsWith('performance-') && file.endsWith('.json'));

    files.forEach(file => {
      const filePath = path.join(this.monitoringDir, file);
      const fileDate = new Date(file.replace('performance-', '').replace('.json', ''));

      if (fileDate < cutoffDate) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old log file: ${file}`);
      }
    });
  }

  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('Performance monitoring stopped');
    }
  }

  generateReport() {
    const report = {
      monitoringStart: this.monitoringStart,
      totalTestsRun: 0,
      successRate: 0,
      avgResponseTime: 0,
      alertsTriggered: 0
    };

    // Aggregate data from all log files
    const files = fs.readdirSync(this.monitoringDir)
      .filter(file => file.startsWith('performance-') && file.endsWith('.json'));

    let allLogs = [];
    files.forEach(file => {
      try {
        const logs = JSON.parse(fs.readFileSync(path.join(this.monitoringDir, file), 'utf8'));
        allLogs = allLogs.concat(logs);
      } catch (error) {
        // Ignore errors
      }
    });

    if (allLogs.length > 0) {
      const successfulTests = allLogs.filter(log => log.results.success);
      report.totalTestsRun = allLogs.length;
      report.successRate = (successfulTests.length / allLogs.length * 100).toFixed(1);
      report.avgResponseTime = (successfulTests.reduce((sum, log) => sum + log.results.responseTime, 0) / successfulTests.length).toFixed(2);
    }

    // Count alerts
    const alertFile = path.join(this.monitoringDir, 'performance-alerts.json');
    if (fs.existsSync(alertFile)) {
      try {
        const alerts = JSON.parse(fs.readFileSync(alertFile, 'utf8'));
        report.alertsTriggered = alerts.length;
      } catch (error) {
        // Ignore errors
      }
    }

    fs.writeFileSync(path.join(this.monitoringDir, 'monitoring-report.json'), JSON.stringify(report, null, 2));
    console.log('Performance monitoring report generated');

    return report;
  }
}

// Start monitoring
const monitor = new PerformanceMonitor({
  baseUrl: 'http://localhost:8080',
  intervalMinutes: 60,
  retentionDays: 30
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down performance monitor...');
  monitor.stopMonitoring();
  monitor.generateReport();
  process.exit(0);
});

module.exports = PerformanceMonitor;
```

This comprehensive benchmarks folder provides tools for measuring, monitoring, and comparing the performance of the Mermaid to Draw.io Converter across various scenarios and use cases.
