# Tool Migration Guide

This guide helps you migrate from other diagram tools to the Mermaid to Draw.io Converter.

## Supported Source Formats

### Draw.io Native Format
- **File Extension**: `.drawio`
- **Format Type**: XML-based diagram format
- **Conversion Method**: Direct XML parsing and Mermaid generation

### PlantUML
- **File Extension**: `.puml`, `.plantuml`
- **Format Type**: Text-based diagram DSL
- **Conversion Method**: Parser-based conversion to Mermaid

### Graphviz DOT
- **File Extension**: `.dot`, `.gv`
- **Format Type**: Graph description language
- **Conversion Method**: DOT to Mermaid transformation

### Visio (Limited Support)
- **File Extension**: `.vsdx`, `.vsd`
- **Format Type**: Microsoft Visio proprietary format
- **Conversion Method**: Shape extraction and Mermaid recreation

## Migration from Draw.io

### Single File Migration

```bash
# Convert single Draw.io file
node converter.js input.drawio output.mmd

# Or using the API
curl -X POST "http://localhost:8080/api/v3/convert" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "drawio",
    "content": "<mxfile>...</mxfile>",
    "target": "mermaid"
  }'
```

### Batch Migration Script

```bash
#!/bin/bash
# drawio-batch-migrate.sh

INPUT_DIR="./drawio-files"
OUTPUT_DIR="./mermaid-files"

mkdir -p "$OUTPUT_DIR"

find "$INPUT_DIR" -name "*.drawio" -type f | while read -r file; do
    filename=$(basename "$file" .drawio)
    output_file="$OUTPUT_DIR/${filename}.mmd"

    echo "Converting: $file -> $output_file"

    # Use the converter API
    curl -X POST "http://localhost:8080/api/v3/convert" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -d "{
        \"source\": \"drawio\",
        \"file\": \"$file\",
        \"target\": \"mermaid\"
      }" > "$output_file"

    echo "Converted: $output_file"
done

echo "Batch migration completed!"
```

### Draw.io to Mermaid Mapping

| Draw.io Element | Mermaid Equivalent |
|----------------|-------------------|
| Rectangle | `A["Label"]` |
| Circle | `B("Label")` |
| Diamond | `C{"Label"}` |
| Rounded Rectangle | `D("Label")` |
| Parallelogram | `E["Label"]` |
| Arrow | `A --> B` |
| Dashed Arrow | `A -.-> B` |
| Bidirectional | `A <--> B` |

## Migration from PlantUML

### PlantUML Converter Class

```javascript
// plantuml-converter.js
const axios = require('axios');

class PlantUMLToMermaidConverter {
  constructor(apiUrl = 'http://localhost:8080') {
    this.apiUrl = apiUrl;
  }

  async convert(plantumlContent) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/v3/convert`, {
        source: 'plantuml',
        content: plantumlContent,
        target: 'mermaid'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.result;
    } catch (error) {
      throw new Error(`PlantUML conversion failed: ${error.message}`);
    }
  }

  async convertFile(inputPath, outputPath) {
    const fs = require('fs');
    const plantumlContent = fs.readFileSync(inputPath, 'utf8');
    const mermaidContent = await this.convert(plantumlContent);
    fs.writeFileSync(outputPath, mermaidContent);
  }
}

module.exports = PlantUMLToMermaidConverter;
```

### Usage Example

```javascript
const PlantUMLConverter = require('./plantuml-converter');

const converter = new PlantUMLConverter();

const plantumlDiagram = `
@startuml
actor User
User -> System: Login
System -> Database: Validate
Database --> System: OK
System --> User: Welcome
@enduml
`;

converter.convert(plantumlDiagram).then(mermaid => {
  console.log(mermaid);
  // Output: sequenceDiagram
  // User->>System: Login
  // System->>Database: Validate
  // Database-->>System: OK
  // System-->>User: Welcome
});
```

### PlantUML to Mermaid Mapping

| PlantUML | Mermaid |
|----------|---------|
| `@startuml` | `sequenceDiagram` or `flowchart TD` |
| `actor ActorName` | `participant ActorName` |
| `->` | `->>` |
| `->>` | `-->>` |
| `note right: text` | `Note right of Actor: text` |
| `activate Actor` | `activate Actor` |
| `deactivate Actor` | `deactivate Actor` |

## Migration from Graphviz DOT

### DOT to Mermaid Converter

```javascript
// dot-converter.js
const axios = require('axios');

class DOTToMermaidConverter {
  constructor(apiUrl = 'http://localhost:8080') {
    this.apiUrl = apiUrl;
  }

  async convert(dotContent) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/v3/convert`, {
        source: 'dot',
        content: dotContent,
        target: 'mermaid'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.result;
    } catch (error) {
      throw new Error(`DOT conversion failed: ${error.message}`);
    }
  }

  parseDOT(content) {
    // Basic DOT parser
    const lines = content.split('\n');
    const nodes = new Map();
    const edges = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Parse node definitions: NodeName [label="Label"]
      const nodeMatch = trimmed.match(/^(\w+)\s*\[label="([^"]+)"\]/);
      if (nodeMatch) {
        nodes.set(nodeMatch[1], nodeMatch[2]);
        continue;
      }

      // Parse edges: Node1 -> Node2 [label="Label"]
      const edgeMatch = trimmed.match(/^(\w+)\s*->\s*(\w+)\s*\[label="([^"]+)"\]/);
      if (edgeMatch) {
        edges.push({
          from: edgeMatch[1],
          to: edgeMatch[2],
          label: edgeMatch[3]
        });
      }
    }

    return { nodes, edges };
  }

  generateMermaid(nodes, edges) {
    let mermaid = 'flowchart TD\n';

    // Add nodes
    for (const [id, label] of nodes) {
      mermaid += `    ${id}["${label}"]\n`;
    }

    // Add edges
    for (const edge of edges) {
      if (edge.label) {
        mermaid += `    ${edge.from} -->|"${edge.label}"| ${edge.to}\n`;
      } else {
        mermaid += `    ${edge.from} --> ${edge.to}\n`;
      }
    }

    return mermaid;
  }
}

module.exports = DOTToMermaidConverter;
```

### DOT Migration Example

```javascript
const DOTConverter = require('./dot-converter');

const converter = new DOTConverter();

const dotDiagram = `
digraph G {
    A [label="Start"];
    B [label="Process"];
    C [label="End"];

    A -> B [label="Begin"];
    B -> C [label="Finish"];
}
`;

converter.convert(dotDiagram).then(mermaid => {
  console.log(mermaid);
  // Output: flowchart TD
  //     A["Start"]
  //     B["Process"]
  //     C["End"]
  //     A -->|"Begin"| B
  //     B -->|"Finish"| C
});
```

## Migration from Microsoft Visio

### Visio Migration Challenges

Visio files (.vsdx) are complex binary formats that require specialized parsing. The converter provides limited support through shape extraction.

### Basic Visio Converter

```javascript
// visio-converter.js
const JSZip = require('jszip');
const xml2js = require('xml2js');

class VisioToMermaidConverter {
  constructor(apiUrl = 'http://localhost:8080') {
    this.apiUrl = apiUrl;
  }

  async convertVisioFile(filePath) {
    const fs = require('fs');
    const buffer = fs.readFileSync(filePath);

    // Unzip the .vsdx file
    const zip = await JSZip.loadAsync(buffer);

    // Extract page XML
    const pageXml = await zip.file('visio/pages/page1.xml').async('text');

    // Parse XML to extract shapes and connections
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(pageXml);

    // Convert to Mermaid
    return this.convertShapesToMermaid(result);
  }

  convertShapesToMermaid(visioData) {
    let mermaid = 'flowchart TD\n';
    const shapes = visioData.Page.Shapes[0].Shape || [];

    // Extract shapes
    shapes.forEach((shape, index) => {
      const text = shape.Text?.[0]?.Para?.[0]?.Run?.[0] || `Shape${index}`;
      mermaid += `    S${index}["${text}"]\n`;
    });

    // Note: Connection extraction is complex and requires
    // analysis of Connect elements in Visio XML
    // This is a simplified implementation

    return mermaid;
  }
}

module.exports = VisioToMermaidConverter;
```

### Visio Migration Limitations

- **Complex Layouts**: Advanced Visio layouts may not convert perfectly
- **Custom Shapes**: Custom Visio shapes need manual recreation
- **Macros**: Visio macros cannot be converted
- **Data Graphics**: Data-linked graphics lose connections

## Migration from Lucidchart

### Lucidchart Export Process

1. **Open Diagram in Lucidchart**
2. **File → Export**
3. **Choose "SVG" or "PNG" format**
4. **Use OCR or manual conversion**

### Automated Lucidchart Migration

```javascript
// lucidchart-migrator.js
const puppeteer = require('puppeteer');

class LucidchartMigrator {
  async migrateFromLucidchart(url, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      // Navigate to Lucidchart document
      await page.goto(url);

      // Wait for diagram to load
      await page.waitForSelector('.diagram-canvas', { timeout: 10000 });

      // Extract diagram elements
      const elements = await page.evaluate(() => {
        const shapes = document.querySelectorAll('.shape, .element');
        return Array.from(shapes).map(shape => ({
          type: shape.className,
          text: shape.textContent?.trim() || '',
          bounds: shape.getBoundingClientRect(),
          style: window.getComputedStyle(shape)
        }));
      });

      // Convert to Mermaid
      const mermaid = this.elementsToMermaid(elements);

      // Save result
      const fs = require('fs');
      fs.writeFileSync(outputPath, mermaid);

      console.log(`Migrated Lucidchart diagram to: ${outputPath}`);

    } catch (error) {
      throw new Error(`Lucidchart migration failed: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  elementsToMermaid(elements) {
    let mermaid = 'flowchart TD\n';

    // Group elements by type
    const rectangles = elements.filter(el => el.type.includes('rectangle'));
    const circles = elements.filter(el => el.type.includes('circle'));
    const diamonds = elements.filter(el => el.type.includes('diamond'));

    // Add nodes
    [...rectangles, ...circles, ...diamonds].forEach((el, index) => {
      const shapeType = el.type.includes('circle') ? '(' : el.type.includes('diamond') ? '{' : '[';
      const closeType = el.type.includes('circle') ? ')' : el.type.includes('diamond') ? '}' : ']';
      mermaid += `    N${index}${shapeType}"${el.text}"${closeType}\n`;
    });

    // Basic connection logic (simplified)
    // In practice, you'd need to analyze the actual connections
    for (let i = 0; i < elements.length - 1; i++) {
      mermaid += `    N${i} --> N${i + 1}\n`;
    }

    return mermaid;
  }
}

module.exports = LucidchartMigrator;
```

## Migration from Gliffy

### Gliffy to Mermaid

Gliffy (used in Confluence) diagrams can be exported as XML and converted.

```javascript
// gliffy-converter.js
const xml2js = require('xml2js');

class GliffyToMermaidConverter {
  async convertGliffyXml(xmlContent) {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlContent);

    const objects = result.gliffy.objects[0].graphic || [];

    let mermaid = 'flowchart TD\n';

    // Extract shapes
    objects.forEach((obj, index) => {
      const graphic = obj['$'];
      const text = obj.Text?.[0]?.['$']?.text || `Object${index}`;

      // Determine shape type
      let shape = '["Label"]'; // default rectangle
      if (graphic?.uid?.includes('circle')) {
        shape = '("Label")';
      } else if (graphic?.uid?.includes('diamond')) {
        shape = '{"Label"}';
      }

      mermaid += `    G${index}${shape.replace('Label', text)}\n`;
    });

    // Extract connections (simplified)
    const connections = result.gliffy.objects[0].line || [];
    connections.forEach((conn, index) => {
      // This would need more complex logic to determine from/to
      mermaid += `    G${index} --> G${index + 1}\n`;
    });

    return mermaid;
  }
}

module.exports = GliffyToMermaidConverter;
```

## Batch Migration Tools

### Universal Migration Script

```bash
#!/bin/bash
# universal-migrate.sh

API_URL="http://localhost:8080/api/v3/convert"
API_KEY="your-api-key"

# Function to convert single file
convert_file() {
    local input_file="$1"
    local output_file="$2"
    local source_format="$3"

    echo "Converting $input_file to $output_file (format: $source_format)"

    # Determine source format from file extension if not provided
    if [ -z "$source_format" ]; then
        case "${input_file##*.}" in
            drawio) source_format="drawio" ;;
            puml|plantuml) source_format="plantuml" ;;
            dot|gv) source_format="dot" ;;
            vsdx|vsd) source_format="visio" ;;
            *) echo "Unknown format for $input_file"; return 1 ;;
        esac
    fi

    # Make API call
    curl -s -X POST "$API_URL" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"source\": \"$source_format\",
        \"file\": \"$input_file\",
        \"target\": \"mermaid\"
      }" > "$output_file"

    if [ $? -eq 0 ]; then
        echo "✓ Converted $input_file"
    else
        echo "✗ Failed to convert $input_file"
    fi
}

# Batch convert all files in directory
batch_convert() {
    local input_dir="$1"
    local output_dir="$2"

    mkdir -p "$output_dir"

    find "$input_dir" -type f \( \
        -name "*.drawio" -o \
        -name "*.puml" -o \
        -name "*.plantuml" -o \
        -name "*.dot" -o \
        -name "*.gv" -o \
        -name "*.vsdx" -o \
        -name "*.vsd" \
    \) | while read -r file; do
        filename=$(basename "$file")
        extension="${filename##*.}"
        basename="${filename%.*}"
        output_file="$output_dir/${basename}.mmd"

        convert_file "$file" "$output_file"
    done
}

# Usage
case "$1" in
    single)
        convert_file "$2" "$3" "$4"
        ;;
    batch)
        batch_convert "$2" "$3"
        ;;
    *)
        echo "Usage: $0 {single input_file output_file [format]|batch input_dir output_dir}"
        exit 1
        ;;
esac
```

### Migration Progress Tracking

```javascript
// migration-tracker.js
const fs = require('fs');
const path = require('path');

class MigrationTracker {
  constructor(logFile = 'migration-log.json') {
    this.logFile = logFile;
    this.loadProgress();
  }

  loadProgress() {
    try {
      this.progress = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
    } catch (error) {
      this.progress = {
        total: 0,
        completed: 0,
        failed: 0,
        files: {}
      };
    }
  }

  saveProgress() {
    fs.writeFileSync(this.logFile, JSON.stringify(this.progress, null, 2));
  }

  startMigration(filePath) {
    this.progress.files[filePath] = {
      status: 'in_progress',
      started: new Date().toISOString()
    };
    this.progress.total++;
    this.saveProgress();
  }

  completeMigration(filePath, outputPath) {
    if (this.progress.files[filePath]) {
      this.progress.files[filePath].status = 'completed';
      this.progress.files[filePath].completed = new Date().toISOString();
      this.progress.files[filePath].output = outputPath;
      this.progress.completed++;
      this.saveProgress();
    }
  }

  failMigration(filePath, error) {
    if (this.progress.files[filePath]) {
      this.progress.files[filePath].status = 'failed';
      this.progress.files[filePath].failed = new Date().toISOString();
      this.progress.files[filePath].error = error;
      this.progress.failed++;
      this.saveProgress();
    }
  }

  getStats() {
    return {
      total: this.progress.total,
      completed: this.progress.completed,
      failed: this.progress.failed,
      successRate: this.progress.total > 0 ? (this.progress.completed / this.progress.total * 100).toFixed(1) : 0
    };
  }

  getFailedFiles() {
    return Object.entries(this.progress.files)
      .filter(([_, data]) => data.status === 'failed')
      .map(([file, data]) => ({ file, error: data.error }));
  }
}

module.exports = MigrationTracker;
```

## Migration Validation

### Validation Script

```javascript
// validate-migration.js
const fs = require('fs');
const axios = require('axios');

class MigrationValidator {
  constructor(apiUrl = 'http://localhost:8080') {
    this.apiUrl = apiUrl;
  }

  async validateMermaidFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      // Test conversion back to drawio
      const response = await axios.post(`${this.apiUrl}/api/v3/convert`, {
        source: 'mermaid',
        content: content,
        target: 'drawio'
      });

      return {
        valid: true,
        originalSize: content.length,
        convertedSize: response.data.result.length
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  async validateBatch(directory) {
    const files = fs.readdirSync(directory)
      .filter(file => file.endsWith('.mmd'));

    const results = [];

    for (const file of files) {
      const filePath = path.join(directory, file);
      const result = await this.validateMermaidFile(filePath);
      results.push({
        file: file,
        ...result
      });
    }

    return results;
  }

  generateReport(results) {
    const valid = results.filter(r => r.valid);
    const invalid = results.filter(r => !r.valid);

    return {
      summary: {
        total: results.length,
        valid: valid.length,
        invalid: invalid.length,
        successRate: ((valid.length / results.length) * 100).toFixed(1) + '%'
      },
      invalidFiles: invalid.map(r => ({
        file: r.file,
        error: r.error
      }))
    };
  }
}

module.exports = MigrationValidator;
```

## Troubleshooting Migration Issues

### Common Problems

#### "Invalid format" errors
- **Cause**: Unsupported diagram elements or syntax
- **Solution**: Simplify the diagram or use manual conversion for complex elements

#### Encoding issues
- **Cause**: Special characters in diagram text
- **Solution**: Ensure UTF-8 encoding and escape special characters

#### Connection mapping failures
- **Cause**: Complex connection logic in source format
- **Solution**: Review and manually adjust connections in output

#### Performance issues with large files
- **Cause**: Memory limitations with very large diagrams
- **Solution**: Split large diagrams into smaller components

### Recovery Procedures

#### Partial Migration Recovery
```bash
# Find unconverted files
find /input/dir -name "*.drawio" | while read file; do
    base=$(basename "$file" .drawio)
    if [ ! -f "/output/dir/${base}.mmd" ]; then
        echo "Missing: $file"
        # Re-run conversion for missing files
        ./convert-file.sh "$file"
    fi
done
```

#### Data Integrity Checks
```javascript
// integrity-check.js
const crypto = require('crypto');
const fs = require('fs');

function calculateHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function verifyIntegrity(originalDir, migratedDir) {
  const originals = fs.readdirSync(originalDir);
  const issues = [];

  originals.forEach(file => {
    const originalPath = path.join(originalDir, file);
    const migratedPath = path.join(migratedDir, file.replace(/\.[^.]+$/, '.mmd'));

    if (fs.existsSync(migratedPath)) {
      const originalHash = calculateHash(originalPath);
      // Note: Hash comparison may not be meaningful for format conversions
      // Instead, check if conversion was successful
      const migratedContent = fs.readFileSync(migratedPath, 'utf8');
      if (migratedContent.length === 0) {
        issues.push({ file, issue: 'Empty output file' });
      }
    } else {
      issues.push({ file, issue: 'Missing migrated file' });
    }
  });

  return issues;
}
```

## Best Practices

### Pre-Migration Preparation
1. **Audit existing diagrams** - Catalog all diagrams to be migrated
2. **Backup everything** - Create complete backups before starting
3. **Test conversion** - Test with sample diagrams first
4. **Plan for manual work** - Complex diagrams may need manual adjustment

### During Migration
1. **Process in batches** - Convert diagrams in manageable batches
2. **Monitor progress** - Track conversion success and failures
3. **Validate results** - Check converted diagrams for accuracy
4. **Document issues** - Keep track of conversion problems and solutions

### Post-Migration
1. **Update references** - Update any links or references to old diagrams
2. **Train users** - Ensure users know how to work with Mermaid format
3. **Archive originals** - Keep original files for reference
4. **Monitor usage** - Track how migrated diagrams are being used

### Performance Optimization
- **Parallel processing** - Convert multiple files simultaneously
- **Caching** - Cache conversion results for repeated diagrams
- **Resource allocation** - Ensure adequate memory and CPU for large conversions
- **Error handling** - Implement robust error handling and retry logic

This comprehensive migration guide should help you transition from various diagram tools to the Mermaid to Draw.io Converter efficiently and effectively.
