# API Integration Guide

This guide covers how to integrate the Mermaid to Draw.io Converter into your applications using REST APIs, SDKs, and webhooks.

## REST API

### Base URL
```
https://api.mermaid-converter.com/v1
```

### Authentication

#### API Key Authentication
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.mermaid-converter.com/v1/convert
```

#### OAuth 2.0 (Enterprise)
```javascript
const response = await fetch('/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: 'your_client_id',
    client_secret: 'your_client_secret'
  })
});
```

### Endpoints

#### Convert Single Diagram

**POST** `/convert`

Converts a single Mermaid diagram to Draw.io format.

**Request:**
```json
{
  "mermaid": "flowchart TD\n  A[Start] --> B[End]",
  "format": "drawio",
  "theme": "default",
  "options": {
    "width": 800,
    "height": 600,
    "background": "transparent"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "<?xml version=\"1.0\"...>",
    "format": "drawio",
    "size": 1234,
    "metadata": {
      "nodes": 2,
      "edges": 1,
      "diagram_type": "flowchart"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SYNTAX",
    "message": "Invalid Mermaid syntax",
    "details": "Expected ']' at line 2"
  }
}
```

#### Batch Convert

**POST** `/batch-convert`

Converts multiple diagrams in a single request.

**Request:**
```json
{
  "diagrams": [
    {
      "id": "diagram1",
      "content": "flowchart TD\n  A --> B",
      "theme": "dark"
    },
    {
      "id": "diagram2",
      "content": "sequenceDiagram\n  A->>B: Hello",
      "format": "png"
    }
  ],
  "options": {
    "concurrency": 2,
    "timeout": 30000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "diagram1",
        "success": true,
        "content": "...",
        "size": 1234
      },
      {
        "id": "diagram2",
        "success": false,
        "error": "Timeout exceeded"
      }
    ],
    "summary": {
      "total": 2,
      "successful": 1,
      "failed": 1
    }
  }
}
```

#### Validate Diagram

**POST** `/validate`

Validates Mermaid syntax without conversion.

**Request:**
```json
{
  "mermaid": "flowchart TD\n  A[Start] --> B[End]",
  "strict": true
}
```

**Response:**
```json
{
  "valid": true,
  "warnings": [],
  "suggestions": []
}
```

#### Get Supported Formats

**GET** `/formats`

Returns supported input and output formats.

**Response:**
```json
{
  "input_formats": ["mermaid"],
  "output_formats": ["drawio", "xml", "png", "svg", "pdf"],
  "themes": ["default", "dark", "forest", "neutral"],
  "diagram_types": ["flowchart", "sequence", "class", "gantt", "pie", "state", "er", "mindmap"]
}
```

#### Health Check

**GET** `/health`

Service health status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "browser": "healthy",
    "storage": "healthy",
    "database": "healthy"
  }
}
```

## SDKs and Libraries

### JavaScript SDK

#### Installation
```bash
npm install @mermaid/converter-sdk
```

#### Usage
```javascript
import { MermaidConverter } from '@mermaid/converter-sdk';

const converter = new MermaidConverter({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.mermaid-converter.com/v1'
});

// Single conversion
const result = await converter.convert({
  mermaid: 'flowchart TD\n  A --> B',
  theme: 'dark'
});

console.log(result.content);

// Batch conversion
const results = await converter.convertBatch([
  { id: 'diag1', content: 'flowchart TD\n A --> B' },
  { id: 'diag2', content: 'sequenceDiagram\n A->>B: Hi' }
]);

// Validation
const validation = await converter.validate('flowchart TD\n A --> B');
console.log(validation.valid);
```

#### Advanced Configuration
```javascript
const converter = new MermaidConverter({
  apiKey: 'your_api_key',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  onProgress: (progress) => {
    console.log(`Progress: ${progress}%`);
  },
  onError: (error) => {
    console.error('Conversion error:', error);
  }
});
```

### Python SDK

#### Installation
```bash
pip install mermaid-converter
```

#### Usage
```python
from mermaid_converter import MermaidConverter

converter = MermaidConverter(api_key='your_api_key')

# Single conversion
result = converter.convert("""
flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
""")

print(result.content)

# Batch conversion
diagrams = [
    {"id": "flow", "content": "flowchart TD\n A --> B"},
    {"id": "seq", "content": "sequenceDiagram\n A->>B: Hello"}
]

results = converter.convert_batch(diagrams)
for result in results:
    if result.success:
        print(f"Converted {result.id}")
    else:
        print(f"Failed {result.id}: {result.error}")
```

### Java SDK

#### Maven Dependency
```xml
<dependency>
    <groupId>com.mermaid</groupId>
    <artifactId>converter-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

#### Usage
```java
import com.mermaid.converter.MermaidConverter;
import com.mermaid.converter.model.ConversionRequest;
import com.mermaid.converter.model.ConversionResult;

MermaidConverter converter = new MermaidConverter.Builder()
    .apiKey("your_api_key")
    .timeout(30000)
    .build();

ConversionRequest request = ConversionRequest.builder()
    .mermaid("flowchart TD\n  A[Start] --> B[End]")
    .theme("dark")
    .build();

ConversionResult result = converter.convert(request);
System.out.println(result.getContent());
```

### C# SDK

#### NuGet Package
```xml
<PackageReference Include="Mermaid.Converter" Version="1.0.0" />
```

#### Usage
```csharp
using Mermaid.Converter;

var converter = new MermaidConverter("your_api_key");

var result = await converter.ConvertAsync(new ConversionRequest
{
    Mermaid = "flowchart TD\n  A[Start] --> B[End]",
    Theme = "dark"
});

Console.WriteLine(result.Content);
```

## Webhooks

### Setup Webhook

**POST** `/webhooks`

Register a webhook for conversion events.

**Request:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["conversion.completed", "conversion.failed"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

#### conversion.completed
```json
{
  "event": "conversion.completed",
  "id": "conv_123456",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "request_id": "req_789",
    "format": "drawio",
    "size": 1234,
    "download_url": "https://api.mermaid-converter.com/downloads/conv_123456.drawio"
  }
}
```

#### conversion.failed
```json
{
  "event": "conversion.failed",
  "id": "conv_123456",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "request_id": "req_789",
    "error": {
      "code": "INVALID_SYNTAX",
      "message": "Invalid Mermaid syntax"
    }
  }
}
```

### Webhook Security

```javascript
// Verify webhook signature
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Usage in webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  handleWebhook(req.body);
  res.sendStatus(200);
});
```

## Rate Limiting

### Rate Limits
- **Free tier**: 100 conversions/hour
- **Pro tier**: 1000 conversions/hour
- **Enterprise**: Custom limits

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 3600
```

### Handling Rate Limits
```javascript
class RateLimitedConverter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.retryAfter = 0;
  }

  async convert(mermaid) {
    if (Date.now() < this.retryAfter) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const response = await fetch('/convert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mermaid })
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('X-RateLimit-Retry-After');
        this.retryAfter = Date.now() + (retryAfter * 1000);
        throw new Error('Rate limit exceeded');
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Rate limit')) {
        // Implement exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, Math.random() * 1000)
        );
        return this.convert(mermaid);
      }
      throw error;
    }
  }
}
```

## Error Handling

### Common Error Codes

| Code | Description | Retry |
|------|-------------|-------|
| `INVALID_SYNTAX` | Invalid Mermaid syntax | No |
| `TIMEOUT` | Conversion timeout | Yes |
| `BROWSER_ERROR` | Browser rendering failed | Yes |
| `RATE_LIMITED` | Rate limit exceeded | Yes (with delay) |
| `INVALID_FORMAT` | Unsupported format | No |
| `FILE_TOO_LARGE` | File exceeds size limit | No |

### Retry Logic
```javascript
async function convertWithRetry(mermaid, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await converter.convert(mermaid);
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error)) {
        break;
      }

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function isRetryableError(error) {
  const retryableCodes = ['TIMEOUT', 'BROWSER_ERROR', 'RATE_LIMITED'];
  return retryableCodes.includes(error.code);
}
```

## Examples

### Integration with Documentation Tools

#### MkDocs Plugin
```python
# mkdocs-mermaid-converter.py
import requests
from mkdocs.plugins import BasePlugin

class MermaidConverterPlugin(BasePlugin):
    config_scheme = (
        ('api_key', mkdocs.config.config_options.Type(str, required=True)),
        ('theme', mkdocs.config.config_options.Type(str, default='default')),
    )

    def on_page_markdown(self, markdown, page, config, site_navigation):
        # Find mermaid code blocks
        import re
        mermaid_blocks = re.findall(r'```mermaid\n(.*?)\n```', markdown, re.DOTALL)

        for block in mermaid_blocks:
            # Convert to Draw.io
            response = requests.post('https://api.mermaid-converter.com/v1/convert', json={
                'mermaid': block,
                'theme': self.config['theme']
            }, headers={
                'Authorization': f"Bearer {self.config['api_key']}"
            })

            if response.status_code == 200:
                drawio_content = response.json()['data']['content']
                # Replace mermaid block with Draw.io embed
                markdown = markdown.replace(
                    f'```mermaid\n{block}\n```',
                    f'<div class="drawio-diagram">{drawio_content}</div>'
                )

        return markdown
```

#### Docusaurus Integration
```javascript
// docusaurus-mermaid-converter.js
const fetch = require('node-fetch');

async function convertMermaidInDocs(content, apiKey) {
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;

  let convertedContent = content;
  let match;

  while ((match = mermaidRegex.exec(content)) !== null) {
    const mermaidCode = match[1];

    try {
      const response = await fetch('https://api.mermaid-converter.com/v1/convert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mermaid: mermaidCode,
          format: 'svg'
        })
      });

      if (response.ok) {
        const result = await response.json();
        convertedContent = convertedContent.replace(
          match[0],
          `<img src="data:image/svg+xml;base64,${Buffer.from(result.data.content).toString('base64')}" alt="Diagram" />`
        );
      }
    } catch (error) {
      console.error('Failed to convert mermaid diagram:', error);
    }
  }

  return convertedContent;
}
```

### CI/CD Integration

#### GitHub Actions
```yaml
# .github/workflows/convert-diagrams.yml
name: Convert Diagrams

on:
  push:
    paths:
      - 'docs/diagrams/*.mmd'

jobs:
  convert:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Convert Mermaid Diagrams
      run: |
        for file in docs/diagrams/*.mmd; do
          filename=$(basename "$file" .mmd)
          curl -X POST https://api.mermaid-converter.com/v1/convert \
            -H "Authorization: Bearer ${{ secrets.CONVERTER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d "{\"mermaid\": \"$(cat "$file")\"}" \
            -o "docs/diagrams/${filename}.drawio"
        done

    - name: Commit converted diagrams
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add docs/diagrams/*.drawio
        git commit -m "Convert Mermaid diagrams to Draw.io" || true
        git push
```

#### Jenkins Pipeline
```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        CONVERTER_API_KEY = credentials('mermaid-converter-api-key')
    }

    stages {
        stage('Convert Diagrams') {
            steps {
                script {
                    def diagramFiles = findFiles(glob: 'docs/diagrams/*.mmd')

                    diagramFiles.each { file ->
                        def filename = file.name.take(file.name.lastIndexOf('.'))
                        def outputFile = "docs/diagrams/${filename}.drawio"

                        sh """
                            curl -X POST https://api.mermaid-converter.com/v1/convert \\
                              -H "Authorization: Bearer ${CONVERTER_API_KEY}" \\
                              -H "Content-Type: application/json" \\
                              -d "{\\"mermaid\\": \\"$(cat ${file.path})\\"}" \\
                              -o ${outputFile}
                        """
                    }
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'docs/diagrams/*.drawio', fingerprint: true
            }
        }
    }
}
```

## Best Practices

### Error Handling
- Always implement retry logic for transient errors
- Validate input before sending to API
- Handle rate limiting gracefully
- Log errors with sufficient context

### Performance
- Use batch conversion for multiple diagrams
- Cache frequently converted diagrams
- Compress requests when possible
- Monitor API usage and response times

### Security
- Store API keys securely
- Validate webhook signatures
- Use HTTPS for all API calls
- Implement proper authentication

### Monitoring
- Track conversion success rates
- Monitor response times
- Set up alerts for API failures
- Log usage patterns for optimization
