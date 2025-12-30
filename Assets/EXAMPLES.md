# Usage Examples

This document provides practical examples of how to use the Mermaid to Draw.io converter.

## Basic Usage

Convert a Mermaid flowchart to Draw.io format:

```bash
node converter.js input.mmd output.drawio
```

## Supported Diagram Types

### Flowcharts
```bash
node converter.js flowchart-template.mmd flowchart.drawio
```

### Gantt Charts
```bash
node converter.js gantt-template.mmd gantt.drawio
```

### Kanban Boards
```bash
node converter.js kanban-template.mmd kanban.drawio
```

### Mind Maps
```bash
node converter.js mindmap-template.mmd mindmap.drawio
```

### Organization Charts
```bash
node converter.js orgchart-template.mmd orgchart.drawio
```

### Pie Charts
```bash
node converter.js piechart-template.mmd piechart.drawio
```

### Sequence Diagrams
```bash
node converter.js sequence-template.mmd sequence.drawio
```

### SWOT Analysis
```bash
node converter.js swot-template.txt swot.drawio
```

### Timelines
```bash
node converter.js timeline-template.mmd timeline.drawio
```

### User Journey Maps
```bash
node converter.js userjourney-template.mmd userjourney.drawio
```

## Batch Conversion

You can convert multiple files using shell scripting:

```bash
for file in *.mmd; do
  node converter.js "$file" "${file%.mmd}.drawio"
done
```

## Using as a Global Command

After installing globally:

```bash
npm install -g .
mermaid-to-drawio input.mmd output.drawio
```

## Input Formats

The converter accepts:
- `.mmd` files (Mermaid diagrams)
- `.txt` files (for SWOT analysis)
- Direct Mermaid code as input

## Output

All outputs are in Draw.io XML format, which can be opened directly in Draw.io or diagrams.net.
