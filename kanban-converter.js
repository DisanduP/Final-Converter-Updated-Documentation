// Mermaid Kanban to Draw.io XML Converter
// This script converts Mermaid Kanban diagram code to Draw.io XML format

const fs = require('fs');

function parseMermaidKanban(mermaidCode) {
    const lines = mermaidCode.split('\n').map(line => line.trimEnd()).filter(line => line.trim());

    if (!lines[0] || lines[0].toLowerCase() !== 'kanban') {
        throw new Error('Invalid Mermaid Kanban code: must start with "kanban"');
    }

    // Find the minimum indent for columns
    let minColumnIndent = Infinity;
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const indent = line.length - line.trimStart().length;
        if (indent < minColumnIndent) {
            minColumnIndent = indent;
        }
    }

    const columns = [];
    let currentColumn = null;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const indent = line.length - line.trimStart().length;

        if (indent === minColumnIndent) {
            // New column
            let id, title;
            const bracketMatch = line.trim().match(/^(\w+)?\[([^\]]+)\]$/);
            if (bracketMatch) {
                id = bracketMatch[1] || `col_${columns.length}`;
                title = bracketMatch[2];
            } else {
                // Plain text column
                title = line.trim();
                id = `col_${columns.length}`;
            }
            currentColumn = { id, title, tasks: [] };
            columns.push(currentColumn);
        } else if (currentColumn && indent > minColumnIndent) {
            // Task
            const taskMatch = line.trim().match(/^(\w+)?\[([^\]]+)\](?:@\{([^}]+)\})?$/);
            if (taskMatch) {
                const taskId = taskMatch[1] || `task_${currentColumn.tasks.length}`;
                const description = taskMatch[2];
                const metadata = taskMatch[3] ? parseMetadata(taskMatch[3]) : {};
                currentColumn.tasks.push({ id: taskId, description, metadata });
            } else {
                // Task without brackets? But according to syntax, should have.
                console.warn(`Skipping invalid task line: ${line}`);
            }
        }
    }

    return columns;
}

function parseMetadata(metadataStr) {
    const metadata = {};
    const pairs = metadataStr.split(',').map(pair => pair.trim());
    pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim().replace(/['"]/g, ''));
        if (key && value) {
            metadata[key] = value;
        }
    });
    return metadata;
}

function generateDrawioXML(columns) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2023-12-22T00:00:00.000Z" agent="5.0 (Mac)" etag="hash" version="21.8.8" type="device">
  <diagram id="diagram1" name="Page-1">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
`;

    let cellId = 2;
    const columnWidth = 200;
    const taskHeight = 60;
    const columnSpacing = 20;
    const taskSpacing = 10;

    columns.forEach((column, colIndex) => {
        const x = colIndex * (columnWidth + columnSpacing);
        const columnHeight = 30 + (column.tasks.length * (taskHeight + taskSpacing)) + 10; // header + tasks + padding

        // Column swimlane
        const columnCellId = cellId++;
        xml += `
        <mxCell id="${columnCellId}" value="${column.title}" style="swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeLast=0;collapsible=1;marginBottom=0;" vertex="1" parent="1">
          <mxGeometry x="${x}" y="0" width="${columnWidth}" height="${columnHeight}" as="geometry" />
        </mxCell>`;

        let taskY = 30; // Start after column header

        column.tasks.forEach(task => {
            const taskValue = `${task.description}${task.metadata.ticket ? ` (${task.metadata.ticket})` : ''}`;

            xml += `
        <mxCell id="${cellId++}" value="${taskValue}" style="whiteSpace=wrap;html=1;" vertex="1" parent="${columnCellId}">
          <mxGeometry x="0" y="${taskY}" width="${columnWidth}" height="${taskHeight}" as="geometry" />
        </mxCell>`;

            taskY += taskHeight + taskSpacing;
        });
    });

    xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
}

function convertMermaidToDrawio(mermaidCode) {
    try {
        const columns = parseMermaidKanban(mermaidCode);
        return generateDrawioXML(columns);
    } catch (error) {
        console.error('Error converting Mermaid to Draw.io:', error.message);
        return null;
    }
}

// Read from file and convert
const inputFile = process.argv[2] || 'sample.mmd';
const outputFile = process.argv[3] || 'output.drawio';

try {
    const mermaidCode = fs.readFileSync(inputFile, 'utf8');
    const xml = convertMermaidToDrawio(mermaidCode);
    if (xml) {
        fs.writeFileSync(outputFile, xml);
        console.log(`Converted ${inputFile} to ${outputFile}`);
    } else {
        console.error('Conversion failed');
    }
} catch (error) {
    console.error('Error:', error.message);
}

module.exports = { convertMermaidToDrawio, parseMermaidKanban, generateDrawioXML };
