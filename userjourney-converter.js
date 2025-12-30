#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// --- Configuration ---
const CONFIG = {
    laneWidth: 280,
    laneHeaderHeight: 40,
    nodeWidth: 160,
    nodeHeight: 60,
    verticalGap: 40,    // Gap between nodes in the same phase
    phaseGap: 80,       // Extra gap between different phases (sections)
    paddingTop: 80,     // Space inside the lane before first node
    startX: 40,
    startY: 40
};

// --- Helper: Emoji Mapper ---
function getIconForActor(actorName) {
    const lower = actorName.toLowerCase();
    if (lower.includes('feeling') || lower.includes('emotion')) return '💭';
    if (lower.includes('system') || lower.includes('touchpoint') || lower.includes('app') || lower.includes('interface')) return '⚙️';
    if (lower.includes('action') || lower.includes('user')) return '👱';
    return '📌';
}

// --- Helper: XML Entity Escaper ---
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&#39;';
            case '"': return '&quot;';
        }
    });
}

// --- Step 1: Parse Mermaid Journey Syntax ---
function parseMermaid(content) {
    const lines = content.split('\n');
    const actors = new Set();
    const sections = []; // Array of { name: 'Phase 1', tasks: [] }
    
    let currentSectionIdx = -1;

    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('journey') || line.startsWith('title')) return;

        if (line.startsWith('section')) {
            const sectionName = line.replace('section', '').trim();
            sections.push({ name: sectionName, tasks: [] });
            currentSectionIdx++;
        } else {
            // Default to a "General" section if none defined
            if (currentSectionIdx === -1) {
                sections.push({ name: 'Start', tasks: [] });
                currentSectionIdx = 0;
            }

            // Regex: Task Name: Score: Actor1, Actor2...
            const parts = line.split(':');
            if (parts.length >= 3) {
                const taskName = parts[0].trim();
                const taskActors = parts[2].split(',').map(a => a.trim());

                taskActors.forEach(actor => {
                    actors.add(actor);
                    sections[currentSectionIdx].tasks.push({
                        name: taskName,
                        actor: actor
                    });
                });
            }
        }
    });

    return {
        actors: Array.from(actors),
        sections: sections
    };
}

// --- Step 2: Generate Draw.io XML ---
function generateDrawioXml(data) {
    const { actors, sections } = data;
    
    // Header
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron" modified="${new Date().toISOString()}" agent="MermaidToDrawioCLI" version="21.0.0" type="device">
  <diagram id="diagram_1" name="Journey Map">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />`;

    let idCounter = 2;
    const laneXPositions = {};
    const lastNodeIdByActor = {}; // To track connections across phases

    // 1. Draw Swimlanes
    // We calculate total height later, but set a default large one for now
    actors.forEach((actor, index) => {
        const xPos = CONFIG.startX + (index * (CONFIG.laneWidth + 20));
        laneXPositions[actor] = xPos;
        lastNodeIdByActor[actor] = null; // Init tracker
        
        const emoji = getIconForActor(actor);
        const laneStyle = "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;rounded=0;shadow=0;comic=0;labelBackgroundColor=none;strokeWidth=2;fontFamily=Helvetica;fontSize=14;align=center;";

        // Note: Height is arbitrary here (3000), Draw.io usually auto-sizes, but this ensures it's visible.
        xml += `
        <mxCell id="${idCounter++}" value="${emoji} ${escapeXml(actor)}" style="${laneStyle}" vertex="1" parent="1">
          <mxGeometry x="${xPos}" y="${CONFIG.startY}" width="${CONFIG.laneWidth}" height="3000" as="geometry" />
        </mxCell>`;
    });

    // 2. Draw Tasks (Phase by Phase)
    let currentY = CONFIG.startY + CONFIG.paddingTop;

    sections.forEach(section => {
        // Prepare tasks for this section by actor
        const tasksByActor = {};
        actors.forEach(a => tasksByActor[a] = []);
        
        section.tasks.forEach(task => {
            if (tasksByActor[task.actor]) tasksByActor[task.actor].push(task);
        });

        // Determine height of this section (based on the actor with MOST tasks)
        let maxTasksInSection = 0;
        Object.values(tasksByActor).forEach(tList => {
            if (tList.length > maxTasksInSection) maxTasksInSection = tList.length;
        });

        // If section is empty, skip
        if (maxTasksInSection === 0) return;

        // Render tasks for each actor in this section
        actors.forEach(actor => {
            const actorTasks = tasksByActor[actor];
            let localY = currentY;

            actorTasks.forEach(task => {
                const nodeId = idCounter++;
                const xPos = laneXPositions[actor] + (CONFIG.laneWidth - CONFIG.nodeWidth) / 2;
                
                // Node Style
                const nodeStyle = "rounded=0;whiteSpace=wrap;html=1;strokeWidth=2;fillColor=#FFFFFF;fontFamily=Helvetica;fontSize=12;";

                xml += `
        <mxCell id="${nodeId}" value="${escapeXml(task.name)}" style="${nodeStyle}" vertex="1" parent="1">
          <mxGeometry x="${xPos}" y="${localY}" width="${CONFIG.nodeWidth}" height="${CONFIG.nodeHeight}" as="geometry" />
        </mxCell>`;

                // Connect to previous node of THIS actor (even if it was in previous phase)
                if (lastNodeIdByActor[actor] !== null) {
                    const edgeId = idCounter++;
                    const edgeStyle = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;strokeWidth=1;endArrow=classic;endFill=1;";
                    
                    xml += `
        <mxCell id="${edgeId}" style="${edgeStyle}" edge="1" parent="1" source="${lastNodeIdByActor[actor]}" target="${nodeId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`;
                }

                // Update trackers
                lastNodeIdByActor[actor] = nodeId;
                localY += CONFIG.nodeHeight + CONFIG.verticalGap;
            });
        });

        // Advance global Y for the NEXT section
        // Height = (Nodes * Height) + (Gaps) + SectionPadding
        const sectionHeight = (maxTasksInSection * CONFIG.nodeHeight) + ((maxTasksInSection - 1) * CONFIG.verticalGap);
        currentY += sectionHeight + CONFIG.phaseGap;
    });

    xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
}

// --- Main Execution ---
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.log("Usage: node mermaid-to-drawio.js <input.mmd> <output.drawio>");
    process.exit(1);
}

try {
    const content = fs.readFileSync(inputFile, 'utf8');
    const parsedData = parseMermaid(content);
    const xml = generateDrawioXml(parsedData);
    fs.writeFileSync(outputFile, xml);
    console.log(`✅ Successfully converted '${inputFile}' to '${outputFile}'`);
    console.log(`Open '${outputFile}' in https://app.diagrams.net/`);
} catch (err) {
    console.error("Error:", err.message);
}
