# Flowchart Guidelines

## Overview
Flowcharts are the most versatile diagram type in the toolkit, supporting process flows, decision trees, workflows, and organizational diagrams using the main `converter.js`.

## Supported Syntax

### Basic Flowchart Structure
```mermaid
graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

### Direction Options
- `TD` - Top to Bottom (recommended)
- `LR` - Left to Right
- `RL` - Right to Left
- `BT` - Bottom to Top

### Node Types
- `A[Text]` - Rectangle (process)
- `B{Text}` - Diamond (decision)
- `C((Text))` - Circle (terminal)
- `D>Text]` - Right arrow (flow)
- `E{Text}` - Hexagon (preparation)

### Connection Types
- `-->` - Solid line
- `-.->` - Dotted line
- `==>` - Thick line
- `--text-->` - Labeled connection
- `-->|label|` - Conditional connection

## Best Practices

### Layout Design
- Use `TD` direction for most business processes
- Keep flow moving in one primary direction
- Limit to 10-15 nodes per diagram for readability
- Use subgraphs for complex processes

### Node Naming
- Use descriptive, action-oriented labels
- Keep text under 3-4 words per node
- Use consistent capitalization (Title Case)
- Avoid special characters in node IDs

### Decision Points
- Always provide both Yes/No or True/False paths
- Use clear, specific decision criteria
- Avoid nested decisions when possible

## Advanced Features

### Subgraphs
```mermaid
graph TD
    subgraph Process A
        A1[Step 1] --> A2[Step 2]
    end
    subgraph Process B
        B1[Step 3] --> B2[Step 4]
    end
    A2 --> B1
```

### Styling Classes
```mermaid
graph TD
    classDef processClass fill:#e1f5fe,stroke:#01579b
    classDef decisionClass fill:#fff3e0,stroke:#e65100

    A[Process]:::processClass
    B{Decision}:::decisionClass
```

## Common Patterns

### Process Flow
```mermaid
graph TD
    A[Receive Order] --> B{Valid Order?}
    B -->|Yes| C[Process Payment]
    B -->|No| D[Send Error Message]
    C --> E[Ship Product]
    D --> F[End]
    E --> F
```

### Decision Tree
```mermaid
graph TD
    A[Start] --> B{Age >= 18?}
    B -->|Yes| C{Income > 50K?}
    B -->|No| D[Not Eligible]
    C -->|Yes| E[Premium Plan]
    C -->|No| F[Basic Plan]
```

### Workflow Diagram
```mermaid
graph LR
    A[Idea] --> B[Research]
    B --> C{Technical Feasible?}
    C -->|Yes| D[Development]
    C -->|No| E[Archive]
    D --> F[Testing]
    F --> G[Deployment]
```

## Conversion Tips

### Before Converting
- Validate syntax in Mermaid Live Editor
- Ensure all connections are properly defined
- Check for circular references

### After Converting
- Open in Draw.io to verify layout
- Adjust node sizes if text is cut off
- Fine-tune connection routing if needed

## Limitations
- Complex styling may not convert perfectly
- Some advanced Mermaid features unsupported
- Manual layout adjustments may be required

## Examples
See `sample_flowchart.mmd` for a complete working example.</content>
<parameter name="filePath">/Users/disandup/Desktop/Final Converter Improved /Untitled/Guidelines/Flowchart-Guidelines.md
