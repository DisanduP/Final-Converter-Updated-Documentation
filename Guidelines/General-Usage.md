# General Usage Guidelines

## Overview
The Mermaid to Draw.io Converter Toolkit is a command-line tool that transforms Mermaid diagram syntax into professional Draw.io XML files. This toolkit supports multiple diagram types with pixel-perfect accuracy and consistent styling.

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Mermaid CLI (`npm install -g @mermaid-js/mermaid-cli`)

## Installation
```bash
# Install globally for system-wide access
npm install -g @mermaid-js/mermaid-cli

# Install project dependencies
npm install
```

## Basic Usage Pattern
All converters follow a consistent command structure:
```bash
node [converter-name].js -i [input-file] -o [output-file]
```

### Parameters
- `-i, --input`: Path to input Mermaid file (.mmd) or text file
- `-o, --output`: Path for output Draw.io file (.drawio)

## Supported Diagram Types

| Diagram Type | Converter File | Input Format | Use Case |
|-------------|---------------|--------------|----------|
| Flowcharts | `converter.js` | `.mmd` | Process flows, decision trees |
| Kanban Boards | `kanban-converter.js` | `.mmd` | Task management |
| Pie Charts | `piechart-converter.js` | `.mmd` | Data proportions |
| Org Charts | `orgchart-converter.js` | `.mmd` | Hierarchies |
| Gantt Charts | `gantt-converter.js` | `.mmd` | Project timelines |
| Timelines | `timeline-converter.js` | `.mmd` | Event sequences |
| Bar Charts | `barchart-converter.js` | `.mmd` | Data comparisons |
| Sequence Diagrams | `sequence-converter.js` | `.mmd` | Interactions |
| Mindmaps | `mindmap-converter.js` | `.mmd` | Knowledge organization |
| SWOT Analysis | `swot-converter.js` | `.txt` | Strategic analysis |

## File Organization Best Practices

### Input Files
- Use `.mmd` extension for Mermaid syntax files
- Use `.txt` extension for plain text inputs (SWOT)
- Store input files in a dedicated `diagrams/` folder
- Use descriptive filenames: `user-login-flow.mmd`, `q4-sales-chart.mmd`

### Output Files
- Always use `.drawio` extension
- Store outputs in `exports/` or `drawio-files/` folder
- Include version numbers for iterative designs: `flowchart-v2.drawio`

### Project Structure Example
```
project/
├── diagrams/
│   ├── flowcharts/
│   ├── charts/
│   └── sequences/
├── exports/
│   ├── flowcharts/
│   ├── charts/
│   └── sequences/
└── scripts/
    ├── converter.js
    └── *-converter.js
```

## Workflow Recommendations

### 1. Design Phase
- Create diagrams in Mermaid Live Editor first
- Validate syntax before conversion
- Use consistent styling across diagrams

### 2. Conversion Phase
- Run converters individually or batch process
- Check output files immediately after conversion
- Archive working versions

### 3. Editing Phase
- Open `.drawio` files in Draw.io desktop or web app
- Make final adjustments to styling/layout
- Export to desired formats (PNG, PDF, SVG)

## Common Issues & Solutions

### Converter Fails to Run
- Ensure Node.js is installed: `node --version`
- Check if dependencies are installed: `npm list`
- Verify Mermaid CLI: `mmdc --version`

### Output File Issues
- Check input file syntax with online Mermaid validator
- Ensure output directory exists and is writable
- Try absolute paths if relative paths fail

### Styling Problems
- Some complex Mermaid features may not convert perfectly
- Manual adjustment in Draw.io may be required
- Check specific converter guidelines for limitations

## Performance Tips
- Convert diagrams individually for better error isolation
- Use batch scripts for multiple conversions
- Keep input files under 100KB for optimal performance

## Getting Help
- Check converter-specific guidelines in this folder
- Review sample files included with the toolkit
- Test with provided sample diagrams first</content>
<parameter name="filePath">/Users/disandup/Desktop/Final Converter Improved /Untitled/Guidelines/General-Usage.md
