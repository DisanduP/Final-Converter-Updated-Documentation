# Architecture Overview

This document describes the architecture and design of the Mermaid to Draw.io converter.

## System Architecture

The converter is built as a Node.js CLI application that uses Playwright for browser automation to convert Mermaid diagrams to Draw.io format.

### Core Components

#### 1. Main Converter (`converter.js`)
- Entry point for the CLI application
- Handles command-line arguments and file I/O
- Orchestrates the conversion process

#### 2. Specialized Converters
Each diagram type has its own converter module:
- `flowchart-converter.js` - Flowchart conversion logic
- `gantt-converter.js` - Gantt chart conversion
- `kanban-converter.js` - Kanban board conversion
- `mindmap-converter.js` - Mind map conversion
- `orgchart-converter.js` - Organization chart conversion
- `piechart-converter.js` - Pie chart conversion
- `sequence-converter.js` - Sequence diagram conversion
- `swot-converter.js` - SWOT analysis conversion
- `timeline-converter.js` - Timeline conversion
- `userjourney-converter.js` - User journey map conversion
- And more...

#### 3. Browser Automation (Playwright)
- Launches a headless browser instance
- Renders Mermaid diagrams using Mermaid.js library
- Captures the rendered diagram as SVG or image
- Converts to Draw.io XML format

#### 4. XML Generation (`xmlbuilder2`)
- Converts processed diagram data to Draw.io XML format
- Maintains compatibility with Draw.io schema
- Preserves diagram structure and styling

### Data Flow

1. **Input Processing**: Read Mermaid diagram from file or stdin
2. **Parsing**: Parse Mermaid syntax into intermediate representation
3. **Browser Rendering**: Use Playwright to render diagram in browser
4. **Element Extraction**: Extract SVG paths, text, and positioning
5. **XML Generation**: Convert to Draw.io XML format
6. **Output**: Write Draw.io file

### Dependencies

#### Runtime Dependencies
- **cheerio**: HTML parsing and manipulation
- **commander**: Command-line interface framework
- **dagre**: Graph layout and positioning
- **date-fns**: Date parsing and formatting
- **fs-extra**: Enhanced file system operations
- **playwright**: Browser automation
- **xmlbuilder2**: XML document creation

#### Development Dependencies
- Testing frameworks
- Linting tools
- Documentation generators

### Design Principles

#### Modularity
- Each diagram type is handled by a separate module
- Easy to add new diagram types
- Clear separation of concerns

#### Extensibility
- Plugin architecture for custom converters
- Configuration options for customization
- API for programmatic usage

#### Performance
- Headless browser for efficient rendering
- Streaming I/O for large files
- Caching for repeated conversions

#### Reliability
- Comprehensive error handling
- Input validation
- Graceful degradation for unsupported features

### File Structure

```
/
├── converter.js                 # Main entry point
├── *-converter.js              # Specialized converters
├── package.json                # Project metadata
├── Assets/                     # Supporting documents
├── Guidelines/                 # Usage guidelines
├── Templates/                  # Diagram templates
└── README.md                   # Project documentation
```

### Security Considerations

- No external network requests during conversion
- Local file system access only
- No persistent data storage
- Sandboxed browser execution

### Future Architecture Improvements

- Microservices architecture for scalability
- WebAssembly for client-side conversion
- GraphQL API for advanced queries
- Real-time conversion streaming
