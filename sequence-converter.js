#!/usr/bin/env node

const fs = require('fs');

/**
 * Escapes XML entities in text content
 */
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

/**
 * Parses Mermaid sequence diagram code into a structured object.
 */
function parseMermaidSequence(mermaidCode) {
    const lines = mermaidCode.split('\n').map(line => line.trim()).filter(line => line);
    const participants = [];
    const messages = [];
    const notes = [];
    const loops = [];
    
    let currentLoop = null;
    let loopStack = [];

    lines.forEach((line) => {
        // Parse Participants
        if (line.startsWith('participant ')) {
            const match = line.match(/participant\s+(.+)/);
            if (match) {
                const parts = match[1].split(/\s+as\s+/);
                const id = parts[0].trim();
                const label = (parts[1] || id).trim();
                participants.push({ id, label });
            }
        } 
        // Parse Notes
        else if (line.startsWith('Note ')) {
            const match = line.match(/Note (over|right of|left of) (.+): (.+)/);
            if (match) {
                const [, position, targets, text] = match;
                notes.push({ position, targets, text });
            }
        } 
        // Parse Loops (Start)
        else if (line.startsWith('loop ')) {
            const match = line.match(/loop (.+)/);
            if (match) {
                currentLoop = {
                    text: match[1],
                    messages: [], // We track which messages are inside for sizing
                    startIndex: messages.length
                };
                loopStack.push(currentLoop);
            }
        } 
        // Parse Loops (End)
        else if (line === 'end') {
            if (loopStack.length > 0) {
                const completedLoop = loopStack.pop();
                completedLoop.endIndex = messages.length - 1;
                loops.push(completedLoop);
                currentLoop = loopStack.length > 0 ? loopStack[loopStack.length - 1] : null;
            }
        } 
        // Parse Messages (Arrows)
        // Matches: A->B: Text, A-->>B: Text, etc.
        else if (line.match(/(.+?)\s*(-{1,2}>{0,2}|-x)\s*(.+?): (.+)/)) {
            const match = line.match(/(.+?)\s*(-{1,2}>{0,2}|-x)\s*(.+?): (.+)/);
            if (match) {
                const [, from, arrow, to, text] = match;
                
                // Determine Arrow Style based on syntax
                let style = 'html=1;verticalAlign=bottom;endArrow=';
                const isDashed = arrow.includes('--');
                const isSolid = !isDashed;
                
                if (arrow.includes('>>')) {
                    // Open arrow (Async/Reply)
                    style += 'open;'; 
                } else if (arrow.includes('>')) {
                    // Solid Block Arrow (Sync request)
                    style += 'block;';
                } else if (arrow.includes('x')) {
                    // Destroy/Lost
                    style += 'diamond;';
                }

                if (isDashed) style += 'dashed=1;';
                style += 'curved=0;rounded=0;'; // Keep lines straight

                const message = { from, to, text, style };
                messages.push(message);
                
                if (currentLoop) {
                    currentLoop.messages.push(message);
                }
            }
        }
    });

    // Auto-detect participants if they weren't explicitly defined
    const allActors = new Set();
    messages.forEach(m => { allActors.add(m.from); allActors.add(m.to); });
    allActors.forEach(actor => {
        if (!participants.find(p => p.id === actor)) {
            participants.push({ id: actor, label: actor });
        }
    });

    return { participants, messages, notes, loops };
}

/**
 * Generates the Draw.io XML structure.
 */
function generateDrawioXML(participants, messages, notes, loops) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Mermaid-Converter" version="21.0.0">
  <diagram name="Sequence Diagram" id="diagram_${Date.now()}">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="800" pageHeight="400" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>`;

    // Calculate diagram dimensions
    const diagramHeight = Math.max(400, (messages.length * 60) + 200);
    const spacing = 200; 
    let x = 80;
    let y = 40;

    // 1. Draw Participants (Lifelines)
    // We use shape=umlLifeline so the box and line are ONE object (draggable together)
    participants.forEach((p) => {
        xml += `
        <mxCell id="${p.id}" value="${escapeXml(p.label)}" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;portConstraint=eastwest;newEdgeStyle={&quot;curved&quot;:0,&quot;rounded&quot;:0};size=40;" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="100" height="${diagramHeight}" as="geometry"/>
        </mxCell>`;
        x += spacing;
    });

    // 2. Draw Loops (Frames)
    // Draw these BEFORE messages so they appear in the background (Z-index)
    loops.forEach((loop, index) => {
        if (loop.startIndex <= loop.endIndex) {
            const firstMsgIndex = loop.startIndex;
            const lastMsgIndex = loop.endIndex;
            
            // Calculate which participants are involved in this loop
            const involvedParticipants = new Set();
            for(let i = firstMsgIndex; i <= lastMsgIndex; i++) {
                involvedParticipants.add(messages[i].from);
                involvedParticipants.add(messages[i].to);
            }

            // Find min and max X to wrap the loop box around relevant lifelines
            let minX = 99999;
            let maxX = 0;
            
            participants.forEach((p, i) => {
                if (involvedParticipants.has(p.id)) {
                    const pX = 80 + (i * spacing);
                    if (pX < minX) minX = pX;
                    if (pX > maxX) maxX = pX;
                }
            });

            // Adjust box dimensions
            const leftX = minX + 50 - 60; // Center of lifeline - padding
            const width = (maxX - minX) + 120;
            const topY = 110 + firstMsgIndex * 60 - 25;
            const height = ((lastMsgIndex - firstMsgIndex + 1) * 60) + 30;
            
            // shape=umlFrame is the standard "Alt/Loop" box in Draw.io
            xml += `
        <mxCell id="loop${index}" value="${escapeXml(loop.text)}" style="shape=umlFrame;whiteSpace=wrap;html=1;width=60;height=30;boundedLbl=1;verticalAlign=middle;align=left;spacingLeft=5;fillColor=none;strokeColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${leftX}" y="${topY}" width="${width}" height="${height}" as="geometry"/>
        </mxCell>`;
        }
    });

    // 3. Draw Messages
    let msgY = 110;
    messages.forEach((msg, index) => {
        const fromIndex = participants.findIndex(p => p.id === msg.from);
        const toIndex = participants.findIndex(p => p.id === msg.to);
        
        if (fromIndex !== -1 && toIndex !== -1) {
            // Determine X coordinates for start and end
            const fromX = 80 + (fromIndex * spacing) + 50;
            const toX = 80 + (toIndex * spacing) + 50;
            
            xml += `
        <mxCell id="msg${index + 2}" value="${escapeXml(msg.text)}" style="${msg.style}" edge="1" parent="1" source="${msg.from}" target="${msg.to}">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="${fromX}" y="${msgY}" as="sourcePoint"/>
            <mxPoint x="${toX}" y="${msgY}" as="targetPoint"/>
             <Array as="points">
              <mxPoint x="${fromX}" y="${msgY}"/>
              <mxPoint x="${toX}" y="${msgY}"/>
            </Array>
          </mxGeometry>
        </mxCell>`;
            msgY += 60;
        }
    });

    // 4. Draw Notes
    // Note logic is simplified: 'over' spans participants, 'right of' goes to the side
    let noteY = 110;
    notes.forEach((note, index) => {
        let noteX, noteWidth;
        
        if (note.position === 'over') {
            const targetIds = note.targets.split(',').map(t => t.trim());
            const firstIndex = participants.findIndex(p => p.id === targetIds[0]);
            // If comma separated "over A,B", find last one. If just "over A", last is same as first.
            const lastIndex = targetIds.length > 1 
                ? participants.findIndex(p => p.id === targetIds[targetIds.length - 1]) 
                : firstIndex;

            if (firstIndex !== -1 && lastIndex !== -1) {
                noteX = 80 + (firstIndex * spacing); // Start at left lifeline
                // Width spans to the right lifeline + width of box
                noteWidth = ((lastIndex - firstIndex) * spacing) + 100;
            }
        } else if (note.position === 'right of') {
            const targetIndex = participants.findIndex(p => p.id === note.targets.trim());
            if (targetIndex !== -1) {
                noteX = 80 + (targetIndex * spacing) + 60; // Offset to right of lifeline
                noteWidth = 100;
            }
        } else if (note.position === 'left of') {
            const targetIndex = participants.findIndex(p => p.id === note.targets.trim());
            if (targetIndex !== -1) {
                noteX = 80 + (targetIndex * spacing) - 110; // Offset to left
                noteWidth = 100;
            }
        }

        if (noteX !== undefined) {
            // Ensure note doesn't overlap perfectly with a message
            // We use the index to approximate Y position, assuming notes are somewhat interleaved in source
            // Ideally, we'd track Y more precisely during the parse phase.
            // For now, we place them and let user adjust if needed, or increment msgY.
            
            xml += `
        <mxCell id="note${index}" value="${escapeXml(note.text)}" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="${noteX}" y="${noteY + 30}" width="${noteWidth}" height="40" as="geometry"/>
        </mxCell>`;
        }
        noteY += 60;
    });

    xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
}

// --- CLI Execution ---
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log("Usage: node seq2drawio.js <input_mermaid_file> [output_drawio_file]");
        console.log("Example: node seq2drawio.js sequence.mmd output.xml");
        process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace(/\.[^/.]+$/, '') + '_diagram.drawio.xml';

    if (!fs.existsSync(inputFile)) {
        console.error(`Error: File '${inputFile}' not found.`);
        process.exit(1);
    }

    console.log(`🚀 Reading ${inputFile}...`);
    const mermaidCode = fs.readFileSync(inputFile, 'utf8');

    console.log(`⚙️  Converting...`);
    const { participants, messages, notes, loops } = parseMermaidSequence(mermaidCode);
    const xml = generateDrawioXML(participants, messages, notes, loops);

    fs.writeFileSync(outputFile, xml);
    console.log(`✅ Success! Diagram saved to ${outputFile}`);
}
