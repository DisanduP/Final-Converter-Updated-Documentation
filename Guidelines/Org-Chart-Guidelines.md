# Organizational Chart Guidelines

## Overview
Organizational charts visualize company hierarchies, reporting structures, and team relationships. The toolkit converts Mermaid graph syntax into professional Draw.io org charts.

## Basic Syntax
```mermaid
graph TD
    CEO --> CTO
    CEO --> CFO
    CTO --> DevMgr
    CTO --> OpsMgr
    DevMgr --> Dev1
    DevMgr --> Dev2
```

## Advanced Structure

### Multi-level Hierarchy
```mermaid
graph TD
    CEO[John Smith<br/>Chief Executive Officer] --> CTO[Sarah Johnson<br/>Chief Technology Officer]
    CEO --> CFO[Mike Davis<br/>Chief Financial Officer]
    CEO --> CMO[Emma Wilson<br/>Chief Marketing Officer]

    CTO --> DevDir[Alex Chen<br/>Director of Development]
    CTO --> OpsDir[Rachel Brown<br/>Director of Operations]

    DevDir --> FrontendMgr[Tom Wilson<br/>Frontend Manager]
    DevDir --> BackendMgr[Lisa Garcia<br/>Backend Manager]

    FrontendMgr --> FE1[React Developer]
    FrontendMgr --> FE2[Vue Developer]
    BackendMgr --> BE1[Node.js Developer]
    BackendMgr --> BE2[Python Developer]
```

### Matrix Organization
```mermaid
graph TD
    CEO --> ProductMgr[Product Manager]
    CEO --> EngMgr[Engineering Manager]

    ProductMgr --> ProjA[Project A]
    ProductMgr --> ProjB[Project B]

    EngMgr --> Team1[Dev Team 1]
    EngMgr --> Team2[Dev Team 2]

    ProjA --> Team1
    ProjA --> Team2
    ProjB --> Team1

    Team1 --> Dev1[Developer 1]
    Team1 --> Dev2[Developer 2]
    Team2 --> Dev3[Developer 3]
    Team2 --> Dev4[Developer 4]
```

## Best Practices

### Node Formatting
- **Include titles**: `Name[Full Name<br/>Job Title]`
- **Use consistent formatting**: Same style for same levels
- **Keep names concise**: Avoid overly long titles
- **Add departments**: Group by functional areas

### Hierarchy Design
- **Limit depth**: 4-5 levels maximum for readability
- **Balance branches**: Avoid heavily skewed structures
- **Use clear connections**: Solid lines for direct reports
- **Group logically**: Department or functional groupings

### Visual Consistency
- **Color coding**: Different colors for departments
- **Shape consistency**: Same shapes for same roles
- **Font hierarchy**: Larger fonts for higher positions
- **Spacing**: Adequate space between nodes

## Conversion Command
```bash
node orgchart-converter.js -i myorgchart.mmd -o myorgchart.drawio
```

## Advanced Features

### Department Grouping
```mermaid
graph TD
    subgraph Executive
        CEO[CEO]
    end

    subgraph Technology
        CTO[CTO]
        CIO[CIO]
    end

    subgraph Finance
        CFO[CFO]
        Controller[Controller]
    end

    CEO --> CTO
    CEO --> CFO
    CTO --> CIO
    CFO --> Controller
```

### Role-based Styling
```mermaid
graph TD
    classDef executive fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef manager fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef staff fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    CEO[CEO]:::executive
    CTO[CTO]:::executive
    Mgr1[Manager 1]:::manager
    Mgr2[Manager 2]:::manager
    Emp1[Employee 1]:::staff
    Emp2[Employee 2]:::staff

    CEO --> CTO
    CTO --> Mgr1
    CTO --> Mgr2
    Mgr1 --> Emp1
    Mgr2 --> Emp2
```

## Common Org Chart Types

### Traditional Hierarchy
```mermaid
graph TD
    CEO --> VP1[VP Sales]
    CEO --> VP2[VP Marketing]
    CEO --> VP3[VP Engineering]

    VP1 --> Dir1[Director East]
    VP1 --> Dir2[Director West]
    VP2 --> Dir3[Director Digital]
    VP3 --> Dir4[Director Product]
    VP3 --> Dir5[Director Development]
```

### Flat Organization
```mermaid
graph TD
    CEO --> Mgr1[Manager A]
    CEO --> Mgr2[Manager B]
    CEO --> Mgr3[Manager C]

    Mgr1 --> Emp1
    Mgr1 --> Emp2
    Mgr2 --> Emp3
    Mgr2 --> Emp4
    Mgr3 --> Emp5
    Mgr3 --> Emp6
```

### Project-based Structure
```mermaid
graph TD
    CEO --> ProjMgr1[Project Manager 1]
    CEO --> ProjMgr2[Project Manager 2]

    ProjMgr1 --> Dev1[Developer]
    ProjMgr1 --> QA1[QA Engineer]
    ProjMgr1 --> UX1[UX Designer]

    ProjMgr2 --> Dev2[Developer]
    ProjMgr2 --> QA2[QA Engineer]
    ProjMgr2 --> UX2[UX Designer]

    Dev1 -.-> Shared[Shared Resources]
    Dev2 -.-> Shared
    QA1 -.-> Shared
    QA2 -.-> Shared
```

## Integration with Other Diagrams

### Combined Views
- **Link to process flows** showing how departments interact
- **Connect to RACI charts** for responsibility matrices
- **Use with timelines** for organizational changes
- **Combine with SWOT** for structural analysis

### Reporting Relationships
- **Solid lines**: Direct reports
- **Dashed lines**: Dotted line relationships
- **Colored lines**: Different types of relationships
- **Labels**: Relationship descriptions

## Draw.io Enhancement

### Layout Options
- **Hierarchical layout**: Traditional top-down
- **Compact layout**: Space-efficient arrangement
- **Custom positioning**: Manual arrangement for clarity

### Visual Enhancements
- **Icons**: Add role-specific icons
- **Photos**: Include employee photos
- **Contact info**: Add email/phone in tooltips
- **Links**: Connect to detailed profiles

## Data Management

### Large Organizations
- **Break into divisions**: Separate charts for departments
- **Use summaries**: High-level overview charts
- **Create indexes**: Reference system for large structures
- **Version control**: Track organizational changes

### Updates and Maintenance
- **Regular reviews**: Quarterly structure updates
- **Change tracking**: Document reorganization
- **Approval workflows**: Governance for changes
- **Communication plans**: Stakeholder notifications

## Accessibility Considerations

### Design for All Users
- **High contrast**: Ensure text readability
- **Alt text**: Describe chart purpose and structure
- **Screen reader friendly**: Logical reading order
- **Color blind friendly**: Use patterns with colors

### Inclusive Representation
- **Diverse representation**: Reflect organizational diversity
- **Clear hierarchies**: Avoid confusing structures
- **Consistent terminology**: Use standard job titles
- **Cultural sensitivity**: Respect naming conventions

## Troubleshooting

### Layout Issues
- **Overlapping nodes**: Increase spacing in Draw.io
- **Long labels**: Use abbreviations or line breaks
- **Unbalanced trees**: Adjust node positioning manually
- **Connection routing**: Use orthogonal connectors

### Conversion Problems
- **Complex structures**: Simplify for better conversion
- **Special characters**: Use plain text for names
- **Long hierarchies**: Break into multiple charts
- **Styling conflicts**: Apply styling after conversion

## Examples
See `sample_orgchart.mmd` for a complete company hierarchy example.</content>
<parameter name="filePath">/Users/disandup/Desktop/Final Converter Improved /Untitled/Guidelines/Org-Chart-Guidelines.md
