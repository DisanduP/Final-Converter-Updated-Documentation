# Web Integration Tutorial

Learn how to integrate the Mermaid to Draw.io converter into web applications, websites, and web services.

## Basic Web Integration

### HTML Page with Conversion

Create a simple web page that allows users to convert Mermaid diagrams:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mermaid to Draw.io Converter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            display: flex;
            gap: 20px;
        }
        .panel {
            flex: 1;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        textarea {
            width: 100%;
            height: 300px;
            font-family: monospace;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #005aa3;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .status {
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <h1>Mermaid to Draw.io Converter</h1>

    <div class="container">
        <div class="panel">
            <h2>Mermaid Input</h2>
            <textarea id="mermaidInput" placeholder="Enter your Mermaid diagram here...

Example:
graph TD;
    A[Start] --> B{Decision};
    B -->|Yes| C[Action 1];
    B -->|No| D[Action 2];
    C --> E[End];
    D --> E;"></textarea>
            <br><br>
            <button id="convertBtn" onclick="convertDiagram()">Convert to Draw.io</button>
            <div id="status" class="status"></div>
        </div>

        <div class="panel">
            <h2>Draw.io Output</h2>
            <div id="outputContainer">
                <p>Converted diagram will appear here...</p>
            </div>
            <br>
            <button id="downloadBtn" onclick="downloadDiagram()" style="display: none;">Download .drawio File</button>
        </div>
    </div>

    <script>
        let drawioData = null;

        async function convertDiagram() {
            const input = document.getElementById('mermaidInput').value.trim();
            const convertBtn = document.getElementById('convertBtn');
            const status = document.getElementById('status');

            if (!input) {
                showStatus('Please enter a Mermaid diagram', 'error');
                return;
            }

            convertBtn.disabled = true;
            convertBtn.textContent = 'Converting...';
            status.style.display = 'none';

            try {
                const response = await fetch('/api/convert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: input
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                drawioData = await response.text();
                displayResult(drawioData);
                showStatus('Conversion successful!', 'success');

            } catch (error) {
                console.error('Conversion error:', error);
                showStatus(`Conversion failed: ${error.message}`, 'error');
            } finally {
                convertBtn.disabled = false;
                convertBtn.textContent = 'Convert to Draw.io';
            }
        }

        function displayResult(data) {
            const container = document.getElementById('outputContainer');
            const downloadBtn = document.getElementById('downloadBtn');

            // For demo purposes, show a preview message
            // In a real implementation, you'd integrate with Draw.io viewer
            container.innerHTML = `
                <div style="padding: 20px; background: #f8f9fa; border-radius: 4px;">
                    <h3>✓ Conversion Complete!</h3>
                    <p>Draw.io XML data generated (${data.length} characters)</p>
                    <p><strong>Note:</strong> In a full implementation, this would display the diagram using Draw.io's viewer.</p>
                </div>
            `;

            downloadBtn.style.display = 'inline-block';
        }

        function downloadDiagram() {
            if (!drawioData) return;

            const blob = new Blob([drawioData], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'diagram.drawio';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
        }

        function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = `status ${type}`;
            status.style.display = 'block';
        }

        // Load example on page load
        window.addEventListener('load', () => {
            const example = `graph TD;
    A[User] --> B[Login Page];
    B --> C{Valid Credentials?};
    C -->|Yes| D[Dashboard];
    C -->|No| E[Error Message];
    E --> B;
    D --> F[Logout];
    F --> A;`;

            document.getElementById('mermaidInput').value = example;
        });
    </script>
</body>
</html>
```

## Backend API Implementation

### Node.js/Express API

```javascript
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const converter = require('./converter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.text({ limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/convert', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Conversion endpoint
app.post('/api/convert', async (req, res) => {
  try {
    const mermaidCode = req.body;

    if (!mermaidCode || typeof mermaidCode !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide Mermaid diagram code as a string'
      });
    }

    if (mermaidCode.length > 100000) {
      return res.status(400).json({
        error: 'Input too large',
        message: 'Diagram code must be less than 100KB'
      });
    }

    // Convert the diagram
    const drawioXml = await converter.convert(mermaidCode);

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="diagram.drawio"');

    // Return the converted diagram
    res.send(drawioXml);

  } catch (error) {
    console.error('Conversion error:', error);

    res.status(500).json({
      error: 'Conversion failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Batch conversion endpoint
app.post('/api/convert-batch', async (req, res) => {
  try {
    const { diagrams } = req.body;

    if (!Array.isArray(diagrams)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide an array of Mermaid diagrams'
      });
    }

    if (diagrams.length > 10) {
      return res.status(400).json({
        error: 'Too many diagrams',
        message: 'Batch conversion limited to 10 diagrams'
      });
    }

    const results = [];

    for (const diagram of diagrams) {
      try {
        const drawioXml = await converter.convert(diagram);
        results.push({
          success: true,
          data: drawioXml,
          size: drawioXml.length
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      total: diagrams.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });

  } catch (error) {
    console.error('Batch conversion error:', error);
    res.status(500).json({
      error: 'Batch conversion failed',
      message: error.message
    });
  }
});

// Get supported diagram types
app.get('/api/types', (req, res) => {
  res.json({
    types: [
      'flowchart',
      'gantt',
      'sequence',
      'class',
      'state',
      'erDiagram',
      'journey',
      'gitgraph',
      'pie',
      'requirement',
      'mindmap',
      'timeline',
      'kanban',
      'sankey'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mermaid to Draw.io converter API running on port ${PORT}`);
});

module.exports = app;
```

### Python/Flask API

```python
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import subprocess
import tempfile
import os
import logging

app = Flask(__name__)
CORS(app)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health')
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@app.route('/api/convert', methods=['POST'])
@limiter.limit("10 per minute")
def convert():
    try:
        mermaid_code = request.get_data(as_text=True)

        if not mermaid_code:
            return jsonify({
                "error": "No input provided",
                "message": "Please provide Mermaid diagram code"
            }), 400

        if len(mermaid_code) > 100000:
            return jsonify({
                "error": "Input too large",
                "message": "Diagram code must be less than 100KB"
            }), 400

        # Create temporary files
        with tempfile.NamedTemporaryFile(mode='w', suffix='.mmd', delete=False) as input_file:
            input_file.write(mermaid_code)
            input_path = input_file.name

        output_path = input_path.replace('.mmd', '.drawio')

        try:
            # Run conversion
            result = subprocess.run(
                ['mermaid-to-drawio', input_path, output_path],
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode != 0:
                raise Exception(f"Conversion failed: {result.stderr}")

            # Read output
            with open(output_path, 'r') as f:
                drawio_xml = f.read()

            return Response(
                drawio_xml,
                mimetype='application/xml',
                headers={
                    'Content-Disposition': 'attachment; filename="diagram.drawio"'
                }
            )

        finally:
            # Clean up temporary files
            os.unlink(input_path)
            if os.path.exists(output_path):
                os.unlink(output_path)

    except subprocess.TimeoutExpired:
        return jsonify({
            "error": "Conversion timeout",
            "message": "Diagram conversion took too long"
        }), 408
    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        return jsonify({
            "error": "Conversion failed",
            "message": str(e)
        }), 500

@app.route('/api/convert-batch', methods=['POST'])
@limiter.limit("5 per minute")
def convert_batch():
    try:
        data = request.get_json()

        if not data or 'diagrams' not in data:
            return jsonify({
                "error": "Invalid input",
                "message": "Please provide a 'diagrams' array"
            }), 400

        diagrams = data['diagrams']

        if not isinstance(diagrams, list):
            return jsonify({
                "error": "Invalid input",
                "message": "'diagrams' must be an array"
            }), 400

        if len(diagrams) > 5:
            return jsonify({
                "error": "Too many diagrams",
                "message": "Batch conversion limited to 5 diagrams"
            }), 400

        results = []

        for i, diagram in enumerate(diagrams):
            try:
                # Create temporary files
                with tempfile.NamedTemporaryFile(mode='w', suffix='.mmd', delete=False) as input_file:
                    input_file.write(str(diagram))
                    input_path = input_file.name

                output_path = input_path.replace('.mmd', '.drawio')

                # Run conversion
                result = subprocess.run(
                    ['mermaid-to-drawio', input_path, output_path],
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                if result.returncode == 0:
                    with open(output_path, 'r') as f:
                        drawio_xml = f.read()

                    results.append({
                        "index": i,
                        "success": True,
                        "data": drawio_xml,
                        "size": len(drawio_xml)
                    })
                else:
                    results.append({
                        "index": i,
                        "success": False,
                        "error": result.stderr.strip()
                    })

                # Clean up
                os.unlink(input_path)
                if os.path.exists(output_path):
                    os.unlink(output_path)

            except Exception as e:
                results.append({
                    "index": i,
                    "success": False,
                    "error": str(e)
                })

        successful = len([r for r in results if r['success']])
        failed = len([r for r in results if not r['success']])

        return jsonify({
            "total": len(diagrams),
            "successful": successful,
            "failed": failed,
            "results": results
        })

    except Exception as e:
        logger.error(f"Batch conversion error: {str(e)}")
        return jsonify({
            "error": "Batch conversion failed",
            "message": str(e)
        }), 500

@app.route('/api/types', methods=['GET'])
def get_types():
    return jsonify({
        "types": [
            "flowchart",
            "gantt",
            "sequence",
            "class",
            "state",
            "erDiagram",
            "journey",
            "gitgraph",
            "pie",
            "requirement",
            "mindmap",
            "timeline",
            "kanban",
            "sankey"
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
```

## Advanced Web Integration

### React Component

```jsx
import React, { useState, useRef } from 'react';
import './MermaidConverter.css';

const MermaidConverter = () => {
  const [mermaidCode, setMermaidCode] = useState(`graph TD;
    A[Start] --> B{Decision};
    B -->|Yes| C[Process];
    B -->|No| D[End];
    C --> D;`);

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [drawioData, setDrawioData] = useState(null);
  const fileInputRef = useRef(null);

  const convertDiagram = async () => {
    if (!mermaidCode.trim()) {
      setError('Please enter Mermaid code');
      return;
    }

    setIsConverting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: mermaidCode
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      setDrawioData(data);
      setSuccess(`Conversion successful! Generated ${data.length} characters of Draw.io XML.`);

    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadDiagram = () => {
    if (!drawioData) return;

    const blob = new Blob([drawioData], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.drawio';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const loadFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setMermaidCode(e.target.result);
      setError('');
      setSuccess('');
    };
    reader.readAsText(file);
  };

  const loadExample = (type) => {
    const examples = {
      flowchart: `graph TD;
    A[Start] --> B{Is it working?};
    B -->|Yes| C[Great!];
    B -->|No| D[Debug];
    D --> B;`,

      gantt: `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
    A task          :a1, 2023-01-01, 30d
    Another task    :after a1, 20d`,

      sequence: `sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: I am good thanks!
    Alice->>Bob: That's great!`
    };

    setMermaidCode(examples[type] || examples.flowchart);
    setError('');
    setSuccess('');
  };

  return (
    <div className="mermaid-converter">
      <h1>Mermaid to Draw.io Converter</h1>

      <div className="controls">
        <button onClick={() => loadExample('flowchart')}>Load Flowchart Example</button>
        <button onClick={() => loadExample('gantt')}>Load Gantt Example</button>
        <button onClick={() => loadExample('sequence')}>Load Sequence Example</button>
        <label className="file-input-label">
          Load from File
          <input
            ref={fileInputRef}
            type="file"
            accept=".mmd,.txt"
            onChange={loadFromFile}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="editor-container">
        <div className="editor-panel">
          <h2>Mermaid Input</h2>
          <textarea
            value={mermaidCode}
            onChange={(e) => setMermaidCode(e.target.value)}
            placeholder="Enter your Mermaid diagram code here..."
            rows={20}
          />
          <button
            onClick={convertDiagram}
            disabled={isConverting}
            className="convert-btn"
          >
            {isConverting ? 'Converting...' : 'Convert to Draw.io'}
          </button>
        </div>

        <div className="result-panel">
          <h2>Result</h2>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {drawioData && (
            <div className="result-content">
              <div className="result-preview">
                <h3>✓ Conversion Complete!</h3>
                <p>Draw.io XML generated ({drawioData.length} characters)</p>
                <p><small>This would display the diagram in a full implementation</small></p>
              </div>
              <button onClick={downloadDiagram} className="download-btn">
                Download .drawio File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MermaidConverter;
```

### Vue.js Component

```vue
<template>
  <div class="mermaid-converter">
    <h1>Mermaid to Draw.io Converter</h1>

    <div class="examples">
      <button @click="loadExample('flowchart')">Flowchart Example</button>
      <button @click="loadExample('gantt')">Gantt Example</button>
      <button @click="loadExample('sequence')">Sequence Example</button>
    </div>

    <div class="converter-container">
      <div class="input-panel">
        <h2>Mermaid Input</h2>
        <textarea
          v-model="mermaidCode"
          placeholder="Enter your Mermaid diagram..."
          rows="20"
        ></textarea>
        <button @click="convert" :disabled="isConverting">
          {{ isConverting ? 'Converting...' : 'Convert to Draw.io' }}
        </button>
      </div>

      <div class="output-panel">
        <h2>Draw.io Output</h2>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="success" class="success">{{ success }}</div>

        <div v-if="drawioData" class="result">
          <div class="preview">
            <h3>✓ Conversion Complete!</h3>
            <p>Generated {{ drawioData.length }} characters of Draw.io XML</p>
          </div>
          <button @click="download">Download .drawio File</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MermaidConverter',
  data() {
    return {
      mermaidCode: `graph TD;
    A[Start] --> B{Decision};
    B -->|Yes| C[Process];
    B -->|No| D[End];`,
      isConverting: false,
      error: '',
      success: '',
      drawioData: null
    };
  },
  methods: {
    async convert() {
      if (!this.mermaidCode.trim()) {
        this.error = 'Please enter Mermaid code';
        return;
      }

      this.isConverting = true;
      this.error = '';
      this.success = '';

      try {
        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: this.mermaidCode
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.drawioData = await response.text();
        this.success = `Conversion successful! Generated ${this.drawioData.length} characters.`;

      } catch (err) {
        this.error = `Conversion failed: ${err.message}`;
      } finally {
        this.isConverting = false;
      }
    },

    download() {
      if (!this.drawioData) return;

      const blob = new Blob([this.drawioData], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.drawio';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    },

    loadExample(type) {
      const examples = {
        flowchart: `graph TD;
    A[Start] --> B{Decision};
    B -->|Yes| C[Process];
    B -->|No| D[End];`,

        gantt: `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
    A task :a1, 2023-01-01, 30d
    Another task :after a1, 20d`,

        sequence: `sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: I am good thanks!`
      };

      this.mermaidCode = examples[type] || examples.flowchart;
      this.error = '';
      this.success = '';
      this.drawioData = null;
    }
  }
};
</script>

<style scoped>
.mermaid-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.converter-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.input-panel, .output-panel {
  flex: 1;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

textarea {
  width: 100%;
  font-family: monospace;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

button {
  background: #007acc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

button:hover:not(:disabled) {
  background: #005aa3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #d32f2f;
  background: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.success {
  color: #2e7d32;
  background: #e8f5e8;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.result {
  margin-top: 20px;
}

.preview {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>
```

## Integration with Popular Frameworks

### Next.js API Route

```javascript
// pages/api/convert.js
import { convert } from '../../../lib/converter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mermaid } = req.body;

    if (!mermaid || typeof mermaid !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const drawioXml = await convert(mermaid);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="diagram.drawio"');
    res.status(200).send(drawioXml);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed', message: error.message });
  }
}
```

### Express Middleware

```javascript
// middleware/converter.js
const converter = require('../lib/converter');

const convertMiddleware = async (req, res, next) => {
  try {
    if (req.method === 'POST' && req.path === '/convert') {
      const mermaidCode = req.body;

      if (!mermaidCode) {
        return res.status(400).json({ error: 'No Mermaid code provided' });
      }

      const drawioXml = await converter.convert(mermaidCode);

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="diagram.drawio"');
      return res.send(drawioXml);
    }

    next();
  } catch (error) {
    console.error('Conversion middleware error:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
};

module.exports = convertMiddleware;
```

## Security Considerations

### Input Validation

```javascript
// validation.js
const validateMermaid = (code) => {
  if (typeof code !== 'string') {
    throw new Error('Input must be a string');
  }

  if (code.length > 100000) {
    throw new Error('Input too large (max 100KB)');
  }

  // Check for potentially harmful content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      throw new Error('Potentially unsafe content detected');
    }
  }

  return true;
};
```

### Rate Limiting

```javascript
// rate-limit.js
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 60000)} minutes.`
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = createRateLimit;
```

### CORS Configuration

```javascript
// cors.js
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from specific domains
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
```

## Performance Optimization

### Caching

```javascript
// cache.js
const NodeCache = require('node-cache');
const crypto = require('crypto');

class ConversionCache {
  constructor(ttl = 3600) {
    this.cache = new NodeCache({ stdTTL: ttl });
  }

  getKey(mermaidCode) {
    return crypto.createHash('md5').update(mermaidCode).digest('hex');
  }

  get(mermaidCode) {
    const key = this.getKey(mermaidCode);
    return this.cache.get(key);
  }

  set(mermaidCode, drawioXml) {
    const key = this.getKey(mermaidCode);
    this.cache.set(key, drawioXml);
  }

  clear() {
    this.cache.flushAll();
  }
}

module.exports = ConversionCache;
```

### Connection Pooling

```javascript
// browser-pool.js
const playwright = require('playwright');

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
        args: ['--no-sandbox', '--disable-setuid-sandbox']
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

module.exports = BrowserPool;
```

## Deployment Considerations

### Environment Variables

```bash
# .env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
CACHE_TTL=3600
BROWSER_POOL_SIZE=4
CONVERSION_TIMEOUT=30000
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy app
COPY . .

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Install Playwright browsers
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
RUN npx playwright install chromium

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
```

### Health Checks

```javascript
// health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  };

  // Check conversion capability
  try {
    const testDiagram = 'graph TD; A-->B;';
    await converter.convert(testDiagram);
    health.conversion = 'ok';
  } catch (error) {
    health.status = 'degraded';
    health.conversion = 'failed';
    health.error = error.message;
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

## Monitoring and Analytics

### Request Logging

```javascript
// logger.js
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const logger = morgan('combined', {
  stream: logStream,
  skip: (req, res) => res.statusCode < 400 // Only log errors
});

module.exports = logger;
```

### Metrics Collection

```javascript
// metrics.js
const promClient = require('prom-client');

const register = new promClient.Registry();

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const conversionCounter = new promClient.Counter({
  name: 'conversions_total',
  help: 'Total number of diagram conversions',
  labelNames: ['type', 'status']
});

const conversionDuration = new promClient.Histogram({
  name: 'conversion_duration_seconds',
  help: 'Duration of conversions',
  labelNames: ['type']
});

register.registerMetric(httpRequestCounter);
register.registerMetric(conversionCounter);
register.registerMetric(conversionDuration);

module.exports = {
  register,
  httpRequestCounter,
  conversionCounter,
  conversionDuration
};
```

## Next Steps

- [API Integration Tutorial](api-integration.md) - Building programmatic integrations
- [Custom Themes Tutorial](custom-themes.md) - Advanced styling options
- [Batch Processing Tutorial](batch-processing.md) - Converting multiple diagrams

Web integration opens up many possibilities for incorporating diagram conversion into your applications. Start with the basic HTML example and gradually add more advanced features as needed!
