# Diagram Templates

This directory contains ready-to-use templates for all supported diagram types in the Mermaid to Draw.io Converter Toolkit. These templates provide starting points that you can customize for your specific needs.

## Available Templates

### flowchart-template.mmd
**Purpose**: Process flows, decision trees, workflows
**Converter**: `node converter.js`
**Use Case**: Business processes, system flows, decision logic

### kanban-template.mmd
**Purpose**: Agile project management, task tracking
**Converter**: `node kanban-converter.js`
**Use Case**: Sprint planning, task management, workflow visualization

### charts-template.mmd
**Purpose**: Data visualization, metrics display
**Converters**:
- Pie charts: `node piechart-converter.js`
- Bar charts: `node barchart-converter.js`
**Use Case**: Data analysis, reporting, dashboards

### project-template.mmd
**Purpose**: Project management, scheduling
**Converters**:
- Gantt charts: `node gantt-converter.js`
- Timelines: `node timeline-converter.js`
**Use Case**: Project planning, milestone tracking, roadmaps

### technical-template.mmd
**Purpose**: Technical documentation, system design
**Converters**:
- Sequence diagrams: `node sequence-converter.js`
- Mindmaps: `node mindmap-converter.js`
**Use Case**: API documentation, system architecture, knowledge organization

### orgchart-template.mmd
**Purpose**: Organizational structure, reporting relationships
**Converter**: `node orgchart-converter.js`
**Use Case**: Company hierarchy, team structure, reporting lines

### swot-template.txt
**Purpose**: Strategic analysis, business planning
**Converter**: `node swot-converter.js`
**Use Case**: Business strategy, competitive analysis, decision making

## How to Use Templates

### 1. Copy the Template
```bash
# Copy a template to start your diagram
cp Templates/flowchart-template.mmd my-diagram.mmd
```

### 2. Customize the Content
- Replace placeholder text with your actual content
- Modify structure to match your requirements
- Adjust styling and formatting as needed

### 3. Validate Syntax
- Test in [Mermaid Live Editor](https://mermaid.live)
- Ensure all connections and references are correct
- Check for syntax errors before conversion

### 4. Convert to Draw.io
```bash
# Example conversions
node converter.js -i my-diagram.mmd -o my-diagram.drawio
node kanban-converter.js -i kanban-template.mmd -o kanban.drawio
node swot-converter.js -i swot-template.txt -o swot.drawio
```

### 5. Refine in Draw.io
- Open the converted file in Draw.io
- Apply final styling and adjustments
- Add corporate branding or custom elements

## Template Customization Tips

### Flowcharts
- Start with basic structure, add complexity gradually
- Use consistent naming conventions for nodes
- Consider using subgraphs for complex processes

### Kanban Boards
- Customize columns to match your workflow
- Add priority levels and assignments
- Include time estimates and blockers

### Charts
- Replace sample data with real numbers
- Ensure data ranges are appropriate for visualization
- Consider combining bar and line charts for trends

### Project Management
- Adjust dates to match your timeline
- Add realistic dependencies between tasks
- Include milestones and checkpoints

### Technical Diagrams
- Use descriptive participant names
- Add notes for complex interactions
- Consider error paths and edge cases

### Org Charts
- Include job titles and reporting relationships
- Use styling to differentiate management levels
- Consider matrix reporting structures

### SWOT Analysis
- Focus on actionable insights
- Use specific examples rather than general statements
- Ensure balanced coverage of all four quadrants

## Best Practices

### File Organization
```
project/
├── diagrams/
│   ├── sources/     # Original .mmd/.txt files
│   ├── exports/     # Converted .drawio files
│   └── templates/   # Copied and customized templates
```

### Version Control
- Store template copies in version control
- Track changes to customized diagrams
- Maintain template library for reuse

### Quality Assurance
- Always validate syntax before conversion
- Test converted diagrams in Draw.io
- Review final output for accuracy

### Maintenance
- Update templates as new patterns emerge
- Archive successful diagram patterns
- Share templates across team members

## Creating Custom Templates

### From Scratch
1. Design diagram in Mermaid Live Editor
2. Test various scenarios and use cases
3. Remove specific content, keep structure
4. Add comments for customization points
5. Save as template file

### From Existing Diagrams
1. Start with working diagram
2. Replace specific content with placeholders
3. Add comments explaining customization
4. Test template with sample data
5. Document usage instructions

## Integration with Workflows

### Development Workflow
```
Template → Customize → Validate → Convert → Integrate → Deploy
```

### Documentation Workflow
```
Template → Content → Convert → Style → Insert → Publish
```

### Presentation Workflow
```
Template → Data → Convert → Brand → Slides → Present
```

These templates provide a solid foundation for creating professional diagrams quickly and consistently across your projects.
