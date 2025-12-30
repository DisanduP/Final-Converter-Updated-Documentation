# Testing Guide

This guide covers the testing strategy and practices for the Mermaid to Draw.io Converter project.

## Overview

The project uses a comprehensive testing approach combining unit tests, integration tests, and end-to-end tests to ensure reliability and quality.

## Test Structure

```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for component interaction
├── e2e/           # End-to-end tests for complete workflows
├── fixtures/      # Test data and sample files
├── utils/         # Test utilities and helpers
└── coverage/      # Test coverage reports
```

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install test dependencies
npm install --save-dev jest playwright-test
```

### Basic Test Execution

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testPathPattern=unit

# Run tests in watch mode
npm run test:watch
```

### Test Categories

#### Unit Tests
```bash
# Run only unit tests
npm run test:unit

# Run unit tests with verbose output
npm run test:unit -- --verbose
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run with specific environment
NODE_ENV=test npm run test:integration
```

#### End-to-End Tests
```bash
# Run E2E tests (requires browser)
npm run test:e2e

# Run E2E tests in headless mode
HEADLESS=true npm run test:e2e
```

## Writing Tests

### Unit Test Example

```javascript
// tests/unit/converter.test.js
const { convertDiagram } = require('../../src/converter');

describe('Diagram Converter', () => {
  test('should convert basic flowchart', async () => {
    const input = `flowchart TD
    A[Start] --> B[Process]
    B --> C[End]`;

    const result = await convertDiagram(input, { format: 'drawio' });

    expect(result).toBeDefined();
    expect(result.format).toBe('drawio');
    expect(result.content).toContain('drawio');
  });

  test('should handle invalid input', async () => {
    const invalidInput = 'invalid mermaid syntax';

    await expect(convertDiagram(invalidInput))
      .rejects
      .toThrow('Invalid Mermaid syntax');
  });
});
```

### Integration Test Example

```javascript
// tests/integration/file-processing.test.js
const { processFile } = require('../../src/file-processor');
const fs = require('fs').promises;

describe('File Processing Integration', () => {
  const testInput = './tests/fixtures/sample.mmd';
  const testOutput = './tests/temp/output.drawio';

  beforeEach(async () => {
    // Setup test files
    await fs.mkdir('./tests/temp', { recursive: true });
  });

  afterEach(async () => {
    // Cleanup
    try {
      await fs.unlink(testOutput);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  test('should process file end-to-end', async () => {
    const result = await processFile(testInput, testOutput);

    expect(result.success).toBe(true);
    expect(result.outputPath).toBe(testOutput);

    // Verify output file exists
    const stats = await fs.stat(testOutput);
    expect(stats.size).toBeGreaterThan(0);
  });
});
```

### E2E Test Example

```javascript
// tests/e2e/conversion-workflow.test.js
const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

test.describe('Conversion Workflow', () => {
  test('should convert diagram via web interface', async ({ page }) => {
    // Navigate to converter page
    await page.goto('http://localhost:3000');

    // Upload mermaid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/complex-diagram.mmd');

    // Click convert button
    await page.click('button:has-text("Convert")');

    // Wait for conversion to complete
    await page.waitForSelector('.conversion-complete');

    // Verify download link appears
    const downloadLink = page.locator('a:has-text("Download Draw.io")');
    await expect(downloadLink).toBeVisible();

    // Download and verify file
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadLink.click()
    ]);

    const downloadPath = await download.path();
    const stats = await fs.stat(downloadPath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js'
  ],
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000
};
```

### Test Setup

```javascript
// tests/setup.js
// Global test setup
process.env.NODE_ENV = 'test';

// Mock browser environment for tests
global.window = {};
global.document = {};

// Setup test utilities
beforeAll(() => {
  console.log('Starting test suite...');
});

afterAll(() => {
  console.log('Test suite completed.');
});
```

## Test Data Management

### Fixtures

```javascript
// tests/fixtures/index.js
const fs = require('fs');
const path = require('path');

const fixtures = {
  simpleFlowchart: fs.readFileSync(
    path.join(__dirname, 'simple-flowchart.mmd'),
    'utf8'
  ),

  complexDiagram: fs.readFileSync(
    path.join(__dirname, 'complex-diagram.mmd'),
    'utf8'
  ),

  invalidSyntax: fs.readFileSync(
    path.join(__dirname, 'invalid-syntax.mmd'),
    'utf8'
  )
};

module.exports = fixtures;
```

### Test Helpers

```javascript
// tests/utils/test-helpers.js
const fs = require('fs').promises;
const path = require('path');

class TestHelper {
  static async createTempFile(content, extension = 'mmd') {
    const tempDir = path.join(__dirname, '../temp');
    await fs.mkdir(tempDir, { recursive: true });

    const filename = `test-${Date.now()}.${extension}`;
    const filepath = path.join(tempDir, filename);

    await fs.writeFile(filepath, content);
    return filepath;
  }

  static async cleanupTempFiles() {
    const tempDir = path.join(__dirname, '../temp');
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error.message);
    }
  }

  static async waitForFile(filepath, timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        await fs.access(filepath);
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return false;
  }
}

module.exports = TestHelper;
```

## Performance Testing

### Benchmark Tests

```javascript
// tests/performance/benchmark.test.js
const { convertDiagram } = require('../../src/converter');
const fixtures = require('../fixtures');

describe('Performance Benchmarks', () => {
  test('should convert simple diagram within time limit', async () => {
    const startTime = Date.now();

    await convertDiagram(fixtures.simpleFlowchart);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // 1 second
  });

  test('should handle concurrent conversions', async () => {
    const promises = Array(10).fill().map(() =>
      convertDiagram(fixtures.simpleFlowchart)
    );

    const startTime = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(5000); // 5 seconds for 10 conversions
  });
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./tests/coverage/lcov.info
```

## Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: Cover all major workflows
- **E2E Tests**: Cover critical user journeys
- **Performance Tests**: Meet response time SLAs

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Mocking and Stubbing
- Mock external dependencies
- Use stubs for complex operations
- Avoid testing implementation details

### Test Data
- Use realistic test data
- Create fixtures for complex data
- Clean up after tests

### Performance
- Write efficient tests
- Use appropriate timeouts
- Parallelize when possible
- Monitor test execution time

## Troubleshooting

### Common Issues

**Tests failing randomly**
- Check for race conditions
- Ensure proper cleanup between tests
- Use unique identifiers for test resources

**Slow test execution**
- Review async operations
- Check for unnecessary waits
- Optimize test data setup

**Browser tests failing**
- Update browser binaries
- Check browser compatibility
- Verify test environment setup

**Coverage not updating**
- Ensure source maps are generated
- Check coverage configuration
- Verify file paths in coverage settings

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Cover both happy path and error cases
3. Update existing tests if behavior changes
4. Ensure all tests pass before submitting PR

When fixing bugs:
1. Write a test that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Check that no other tests are broken
