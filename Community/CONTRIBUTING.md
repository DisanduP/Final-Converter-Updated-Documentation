# Contributing Guide

Thank you for your interest in contributing to the Mermaid to Draw.io Converter! This guide will help you get started with contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [Review Process](#review-process)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 16.x or higher
- **npm**: Version 7.x or higher (comes with Node.js)
- **Git**: Version 2.25.x or higher
- **Docker**: Optional, for containerized development

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-org/mermaid-converter.git
cd mermaid-converter

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Development Setup

### Local Development Environment

#### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/mermaid-converter.git
cd mermaid-converter

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

#### 2. Database Setup

```bash
# For local PostgreSQL
createdb mermaid_converter_dev

# Or use Docker
docker run -d --name postgres-dev \
  -e POSTGRES_DB=mermaid_converter_dev \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=devpass \
  -p 5432:5432 postgres:13
```

#### 3. Start Development Server

```bash
# Start the application
npm run dev

# In another terminal, start the database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

### Docker Development Environment

```bash
# Build development container
docker build -t mermaid-converter-dev -f Dockerfile.dev .

# Run with hot reload
docker run -p 3000:3000 -p 9229:9229 \
  -v $(pwd):/app \
  -v /app/node_modules \
  mermaid-converter-dev

# Access the application at http://localhost:3000
# Debug port available at localhost:9229
```

### IDE Setup

#### VS Code Recommendations

Install these VS Code extensions for the best development experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-jest",
    "ms-vscode.test-adapter-converter",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-docker",
    "github.copilot"
  ]
}
```

#### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

## Contribution Workflow

### 1. Choose an Issue

Visit our [GitHub Issues](https://github.com/your-org/mermaid-converter/issues) and look for:

- Issues labeled `good first issue` for beginners
- Issues labeled `help wanted` for community contributions
- Issues labeled `bug` for bug fixes
- Issues labeled `enhancement` for new features

Comment on the issue you'd like to work on to indicate your interest.

### 2. Create a Branch

```bash
# Create a new branch for your work
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description

# Or for documentation
git checkout -b docs/update-contributing-guide
```

### 3. Make Your Changes

```bash
# Make your code changes
# Add tests for new features
# Update documentation

# Stage your changes
git add .

# Commit with a clear message
git commit -m "feat: add support for Sankey diagrams

- Add Sankey diagram conversion logic
- Update type definitions
- Add comprehensive tests
- Update documentation

Closes #123"
```

### 4. Run Tests and Checks

```bash
# Run the full test suite
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run security audit
npm audit

# Build the project
npm run build
```

### 5. Update Documentation

If your changes affect the API or user-facing functionality:

```bash
# Update API documentation
npm run docs:api

# Update user documentation
# Edit relevant files in docs/ directory

# Update CHANGELOG.md
# Add your changes to the unreleased section
```

### 6. Submit a Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
# - Use a clear title
# - Provide detailed description
# - Reference related issues
# - Add screenshots for UI changes
```

### 7. Address Review Feedback

```bash
# Make requested changes
git add .
git commit -m "fix: address review feedback

- Fix linting errors
- Add missing test case
- Update documentation"

# Push the updates
git push origin feature/your-feature-name
```

## Coding Standards

### JavaScript/TypeScript Style Guide

#### Naming Conventions

```javascript
// Use camelCase for variables and functions
const userName = 'john_doe';
const getUserById = (id) => { /* ... */ };

// Use PascalCase for classes and types
class DiagramConverter {
  // ...
}

interface ConversionOptions {
  format: string;
  theme: string;
}

// Use UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_VERSION = 'v3';
```

#### Function Structure

```javascript
// Good: Clear function with proper documentation
/**
 * Converts a Mermaid diagram to Draw.io format
 * @param {string} input - The Mermaid diagram source
 * @param {ConversionOptions} options - Conversion options
 * @returns {Promise<string>} The converted diagram
 */
async function convertDiagram(input, options = {}) {
  // Input validation
  if (!input || typeof input !== 'string') {
    throw new ValidationError('Input must be a non-empty string');
  }

  // Default options
  const config = {
    format: 'drawio',
    validate: true,
    ...options
  };

  // Conversion logic
  try {
    const result = await performConversion(input, config);
    return result;
  } catch (error) {
    throw new ConversionError(`Conversion failed: ${error.message}`);
  }
}

// Bad: Unclear function with poor structure
async function convert(input, opts) {
  if (!input) throw new Error('bad input');
  let result;
  try {
    result = await convertInternal(input, opts);
  } catch (e) {
    throw e;
  }
  return result;
}
```

#### Error Handling

```javascript
// Good: Specific error types with context
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class ConversionError extends Error {
  constructor(message, diagramType) {
    super(message);
    this.name = 'ConversionError';
    this.diagramType = diagramType;
  }
}

// Usage
function validateInput(input) {
  if (!input) {
    throw new ValidationError('Input is required', 'input');
  }

  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string', 'input');
  }
}

async function convertDiagram(input) {
  try {
    validateInput(input);
    return await performConversion(input);
  } catch (error) {
    if (error instanceof ValidationError) {
      // Handle validation errors
      throw new ConversionError(`Invalid input: ${error.message}`);
    }
    throw error;
  }
}
```

#### Async/Await Patterns

```javascript
// Good: Clear async patterns
async function processBatch(diagrams) {
  const results = [];

  for (const diagram of diagrams) {
    try {
      const result = await convertDiagram(diagram);
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return results;
}

// Also good: Parallel processing when appropriate
async function processBatchParallel(diagrams) {
  const promises = diagrams.map(diagram => convertDiagram(diagram));
  const results = await Promise.allSettled(promises);

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value };
    } else {
      return { success: false, error: result.reason.message };
    }
  });
}
```

### File Organization

```
src/
├── converters/          # Conversion logic
│   ├── flowchart.js
│   ├── sequence.js
│   └── index.js
├── validators/          # Input validation
│   ├── mermaid.js
│   └── index.js
├── utils/              # Utility functions
│   ├── file.js
│   ├── string.js
│   └── index.js
├── api/                # API routes and handlers
│   ├── routes/
│   ├── middleware/
│   └── index.js
├── config/             # Configuration
├── types/              # TypeScript definitions
└── index.js
```

### Import/Export Patterns

```javascript
// Prefer named exports
export const convertFlowchart = (input) => { /* ... */ };
export const convertSequence = (input) => { /* ... */ };

// For default exports, use meaningful names
export default class DiagramConverter { /* ... */ }

// Import patterns
import { convertFlowchart, convertSequence } from './converters';
import DiagramConverter from './DiagramConverter';

// Avoid wildcard imports in production code
// import * as converters from './converters'; // Only for testing
```

## Testing Guidelines

### Test Structure

```javascript
// Use descriptive test suites
describe('DiagramConverter', () => {
  describe('convert()', () => {
    describe('flowchart conversion', () => {
      it('should convert simple flowchart', () => {
        // Test implementation
      });

      it('should handle complex flowcharts', () => {
        // Test implementation
      });
    });

    describe('sequence diagram conversion', () => {
      it('should convert basic sequence diagrams', () => {
        // Test implementation
      });
    });
  });
});
```

### Test Categories

#### Unit Tests

```javascript
// Focus on individual functions/classes
const { convertFlowchart } = require('../converters/flowchart');

describe('convertFlowchart', () => {
  it('should convert basic flowchart syntax', () => {
    const input = 'flowchart TD\nA --> B';
    const result = convertFlowchart(input);

    expect(result).toContain('<mxfile>');
    expect(result).toContain('A');
    expect(result).toContain('B');
  });

  it('should handle different node shapes', () => {
    const input = 'flowchart TD\nA[A] --> B(B) --> C{C}';
    const result = convertFlowchart(input);

    expect(result).toMatch(/shape=rectangle/);
    expect(result).toMatch(/shape=ellipse/);
    expect(result).toMatch(/shape=diamond/);
  });
});
```

#### Integration Tests

```javascript
// Test component interactions
const request = require('supertest');
const app = require('../app');

describe('API Integration', () => {
  describe('POST /api/v3/convert', () => {
    it('should convert diagram successfully', async () => {
      const diagram = 'flowchart TD\nA --> B';

      const response = await request(app)
        .post('/api/v3/convert')
        .send({ mermaid: diagram })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle invalid input', async () => {
      const response = await request(app)
        .post('/api/v3/convert')
        .send({ mermaid: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
```

#### End-to-End Tests

```javascript
// Test complete user workflows
const puppeteer = require('puppeteer');

describe('E2E Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should convert diagram through web interface', async () => {
    await page.goto('http://localhost:3000');

    // Type diagram
    await page.type('#diagram-input', 'flowchart TD\nA --> B');

    // Click convert
    await page.click('#convert-button');

    // Wait for result
    await page.waitForSelector('#result');

    // Check result
    const result = await page.$eval('#result', el => el.textContent);
    expect(result).toContain('Converted successfully');
  });
});
```

### Test Best Practices

#### Test Data Management

```javascript
// Use factories for test data
const createTestDiagram = (type, options = {}) => {
  const defaults = {
    simple: 'flowchart TD\nA --> B',
    complex: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
    invalid: ''
  };

  return defaults[type] || defaults.simple;
};

// Use fixtures for complex data
const testDiagrams = {
  flowchart: {
    simple: 'flowchart TD\nA --> B',
    withStyles: 'flowchart TD\nA --> B\nclassDef classA fill:#f9f',
    large: loadFixture('large-flowchart.mmd')
  },
  sequence: {
    simple: 'sequenceDiagram\nA->>B: Hello',
    complex: loadFixture('complex-sequence.mmd')
  }
};
```

#### Mocking and Stubbing

```javascript
// Mock external dependencies
const axios = require('axios');
jest.mock('axios');

const { convertDiagram } = require('../converter');

describe('convertDiagram', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call external API for complex diagrams', async () => {
    // Mock the API response
    axios.post.mockResolvedValue({
      data: { result: '<mxfile>mock result</mxfile>' }
    });

    const result = await convertDiagram('complex diagram');

    expect(axios.post).toHaveBeenCalledWith(
      'https://external-api.com/convert',
      expect.any(Object)
    );
    expect(result).toContain('mock result');
  });
});
```

#### Performance Testing

```javascript
// Test performance constraints
describe('Performance Tests', () => {
  it('should convert large diagram within time limit', async () => {
    const largeDiagram = createLargeDiagram(1000); // 1000 nodes

    const startTime = Date.now();
    const result = await convertDiagram(largeDiagram);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(5000); // 5 seconds max
    expect(result).toBeDefined();
  });

  it('should handle concurrent requests', async () => {
    const promises = Array(10).fill().map(() =>
      convertDiagram('flowchart TD\nA --> B')
    );

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    expect(results).toHaveLength(10);
    expect(duration).toBeLessThan(10000); // 10 seconds max for 10 requests
  });
});
```

## Documentation Standards

### Code Documentation

#### JSDoc Comments

```javascript
/**
 * Converts a Mermaid diagram to Draw.io format
 * @param {string} input - The Mermaid diagram source code
 * @param {ConversionOptions} [options={}] - Conversion options
 * @param {string} [options.format='drawio'] - Output format
 * @param {boolean} [options.validate=true] - Whether to validate input
 * @param {string} [options.theme='default'] - Diagram theme
 * @returns {Promise<string>} The converted diagram in Draw.io format
 * @throws {ValidationError} When input validation fails
 * @throws {ConversionError} When conversion fails
 * @example
 * const result = await convertDiagram('flowchart TD\nA --> B');
 * console.log(result); // '<mxfile>...</mxfile>'
 */
async function convertDiagram(input, options = {}) {
  // Implementation
}
```

#### Class Documentation

```javascript
/**
 * Handles conversion of Mermaid diagrams to various formats
 * @class
 */
class DiagramConverter {
  /**
   * Creates a new converter instance
   * @param {ConverterConfig} config - Configuration options
   */
  constructor(config) {
    // Implementation
  }

  /**
   * Converts a diagram from Mermaid to target format
   * @param {string} input - Mermaid diagram source
   * @param {string} targetFormat - Target format ('drawio', 'svg', 'png')
   * @returns {Promise<ConversionResult>} Conversion result
   */
  async convert(input, targetFormat) {
    // Implementation
  }
}
```

### API Documentation

#### OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Mermaid to Draw.io Converter API
  version: 3.0.0
  description: API for converting Mermaid diagrams to Draw.io format

paths:
  /api/v3/convert:
    post:
      summary: Convert a Mermaid diagram
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                mermaid:
                  type: string
                  description: The Mermaid diagram source code
                  example: "flowchart TD\nA --> B"
                format:
                  type: string
                  enum: [drawio, svg, png]
                  default: drawio
                  description: Output format
              required:
                - mermaid
      responses:
        '200':
          description: Successful conversion
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: string
                    description: Converted diagram
                  id:
                    type: string
                    description: Conversion ID
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

### README Documentation

#### Project README Structure

```markdown
# Mermaid to Draw.io Converter

[![npm version](https://badge.fury.io/js/mermaid-converter.svg)](https://badge.fury.io/js/mermaid-converter)
[![Build Status](https://github.com/your-org/mermaid-converter/workflows/CI/badge.svg)](https://github.com/your-org/mermaid-converter/actions)
[![Coverage](https://codecov.io/gh/your-org/mermaid-converter/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/mermaid-converter)

A powerful tool for converting Mermaid diagrams to Draw.io format with high fidelity and performance.

## Features

- ✅ Support for all Mermaid diagram types
- ✅ High-fidelity conversion preserving layout
- ✅ Batch processing capabilities
- ✅ RESTful API and CLI interfaces
- ✅ Docker containerization
- ✅ Comprehensive test coverage

## Quick Start

### Installation

```bash
npm install @mermaid/converter
```

### Basic Usage

```javascript
const { convertDiagram } = require('@mermaid/converter');

const diagram = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]`;

convertDiagram(diagram).then(result => {
    console.log(result);
});
```

### API Usage

```bash
curl -X POST "http://localhost:8080/api/v3/convert" \
  -H "Content-Type: application/json" \
  -d '{"mermaid": "flowchart TD\nA --> B"}'
```

## Documentation

- [API Reference](./docs/api.md)
- [CLI Guide](./docs/cli.md)
- [Configuration](./docs/configuration.md)
- [Contributing](./CONTRIBUTING.md)

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Your Organization](https://your-org.com)
```

## Review Process

### Pull Request Guidelines

#### PR Title Format

```
type(scope): description

Examples:
feat(converter): add support for Sankey diagrams
fix(api): resolve memory leak in batch processing
docs(readme): update installation instructions
refactor(utils): simplify string processing functions
```

#### PR Description Template

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] Tests pass
- [ ] No linting errors
- [ ] Commit messages follow conventions

## Related Issues

Closes #123
Related to #456

## Screenshots (if applicable)

Add screenshots for UI changes.
```

### Code Review Checklist

#### For Reviewers

- [ ] **Functionality**: Does the code work as expected?
- [ ] **Code Quality**: Is the code well-structured and readable?
- [ ] **Tests**: Are there adequate tests? Do they pass?
- [ ] **Documentation**: Is documentation updated?
- [ ] **Performance**: Any performance implications?
- [ ] **Security**: Any security concerns?
- [ ] **Compatibility**: Backward compatibility maintained?

#### For Authors

- [ ] **Self-Review**: Have you reviewed your own code?
- [ ] **Edge Cases**: Have you considered edge cases?
- [ ] **Error Handling**: Proper error handling implemented?
- [ ] **Logging**: Appropriate logging added?
- [ ] **Dependencies**: No unnecessary dependencies added?

### Review Comments

#### Good Review Comments

```markdown
✅ **Good**: Clear explanation with suggestion
"This function could be simplified by using array destructuring:
```javascript
const [first, second] = array;
```

❌ **Bad**: Unclear or rude
"This is wrong. Fix it."
```

#### Addressing Feedback

```javascript
// Before: Review feedback received
function processData(data) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    result.push(data[i] * 2);
  }
  return result;
}

// After: Addressed feedback with better performance
function processData(data) {
  return data.map(item => item * 2);
}
```

## Community Guidelines

### Communication

#### Be Respectful

- Use inclusive language
- Respect different viewpoints
- Give constructive feedback
- Be patient with newcomers

#### Be Collaborative

- Help others when possible
- Share knowledge freely
- Acknowledge contributions
- Work towards common goals

### Issue Reporting

#### Bug Reports

```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., macOS 12.1]
- Browser: [e.g., Chrome 97]
- Version: [e.g., 3.1.0]

**Additional Context**
Any other relevant information.
```

#### Feature Requests

```markdown
**Problem**
What's the problem this feature would solve?

**Proposed Solution**
Describe the solution you'd like.

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Any other context or screenshots.
```

### Getting Help

#### Where to Ask

1. **GitHub Issues**: For bugs and feature requests
2. **GitHub Discussions**: For questions and general discussion
3. **Discord**: For real-time help
4. **Stack Overflow**: Tag with `mermaid-converter`

#### Response Times

- **Community Support**: Within 48 hours
- **Priority Support**: Within 24 hours (for sponsors)
- **Enterprise Support**: Within 4 hours

## Recognition

### Contribution Recognition

Contributors are recognized through:

- **GitHub Profile**: Contributions appear on your GitHub profile
- **Contributors File**: Listed in CONTRIBUTORS.md
- **Hall of Fame**: Featured for significant contributions
- **Badges**: Earn badges for different types of contributions

### Rewards

- **GitHub Sponsors**: Financial support for the project
- **Swag**: Project-branded merchandise
- **Conference Access**: Free tickets to relevant conferences
- **Priority Support**: Faster response times

Thank you for contributing to the Mermaid to Draw.io Converter! Your contributions help make diagram conversion better for everyone. 🚀
