#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const { create } = require('xmlbuilder2');

// --- CLI CONFIGURATION ---
program
  .version('1.0.0')
  .description('Convert Mermaid Timeline to Draw.io XML')
  .requiredOption('-i, --input <path>', 'Input Mermaid file')
  .option('-o, --output <path>', 'Output Draw.io XML file', 'timeline.drawio')
  .parse(process.argv);

const options = program.opts();

// --- VISUAL CONFIGURATION ---
const CONFIG = {
  timelineSpacing: 200,    // Horizontal space between years
  timelineCenterY: 300,    // Vertical position of the main line
  eventOffset: 100,        // Distance from line to first box
  stackGap: 60,            // Distance between stacked boxes
  
  // Colors
  colors: {
    line: '#333333', 
    dotFill: '#000000',
    eventFill: '#ffffff', 
    eventStroke: '#cccccc'
  }
};

// --- PARSER ---
function parseTimeline(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
  const chart = { title: 'Timeline', points: [] };
  
  lines.forEach(line => {
    // Skip 'timeline' keyword or config lines
    if (line.toLowerCase().startsWith('timeline')) return;
    
    // Grab Title
    if (line.toLowerCase().startsWith('title')) { 
      chart.title = line.substring(5).trim(); 
      return; 
    }
    
    // Parse: Year : Event 1 : Event 2
    const parts = line.split(':').map(p => p.trim());
    if (parts.length > 0) {
      const period = parts[0];
      const events = parts.slice(1);
      
      // Only add if it actually looks like data
      if (period) {
        chart.points.push({ period, events });
      }
    }
  });

  return chart;
}

// --- XML GENERATOR ---
function generateDrawio(chart) {
  // Initialize XML
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('mxfile', { host: 'Electron', type: 'device' })
    .ele('diagram', { name: 'Page-1', id: 'diagramIdx' })
    .ele('mxGraphModel', { dx: '0', dy: '0', grid: '1', gridSize: '10', guides: '1', tooltips: '1', connect: '1', arrows: '1', fold: '1', page: '1', pageScale: '1', pageWidth: '1169', pageHeight: '827', math: '0', shadow: '0' })
    .ele('root');

  // Base Layers
  root.ele('mxCell', { id: '0' });
  root.ele('mxCell', { id: '1', parent: '0' });

  // Draw Title
  root.ele('mxCell', { id: 'title', value: chart.title, style: 'text;fontSize=24;fontStyle=1;align=center;', vertex: '1', parent: '1' })
      .ele('mxGeometry', { x: '100', y: '50', width: '400', height: '50', as: 'geometry' });

  let xPos = 100;
  let idCounter = 100;
  let previousDotId = null; 

  chart.points.forEach((point, index) => {
    const isUp = index % 2 === 0; // Alternate Up/Down
    
    // 1. Draw The Dot (The anchor for the year)
    const dotId = `dot_${idCounter++}`;
    root.ele('mxCell', { 
      id: dotId, 
      value: '', 
      style: `ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=${CONFIG.colors.dotFill};`, 
      vertex: '1', 
      parent: '1' 
    }).ele('mxGeometry', { x: String(xPos - 5), y: String(CONFIG.timelineCenterY - 5), width: '10', height: '10', as: 'geometry' });

    // 2. Draw The Line (Connect to previous dot)
    if (previousDotId) {
      root.ele('mxCell', { 
        id: `line_${idCounter++}`, 
        value: '', 
        style: `endArrow=none;html=1;strokeWidth=3;strokeColor=${CONFIG.colors.line};`, 
        edge: '1', 
        parent: '1', 
        source: previousDotId, 
        target: dotId 
      }).ele('mxGeometry', { relative: '1', as: 'geometry' });
    }
    previousDotId = dotId;

    // 3. Draw Year Label
    root.ele('mxCell', { 
      id: `lbl_${idCounter++}`, 
      value: point.period, 
      style: 'text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=14;', 
      vertex: '1', 
      parent: '1' 
    }).ele('mxGeometry', { x: String(xPos - 30), y: String(CONFIG.timelineCenterY + (isUp ? 15 : -35)), width: '60', height: '20', as: 'geometry' });

    // 4. Draw Events (Stacked & Chained)
    let previousNodeId = dotId; // Start chain at the dot

    point.events.forEach((eventText, evtIdx) => {
      const boxId = `evt_${idCounter++}`;
      
      // Calculate Y Position
      // If Up: CenterY - Offset - (Index * Gap)
      // If Down: CenterY + Offset + (Index * Gap)
      const stackOffset = evtIdx * CONFIG.stackGap;
      const yPos = isUp 
        ? CONFIG.timelineCenterY - CONFIG.eventOffset - stackOffset 
        : CONFIG.timelineCenterY + CONFIG.eventOffset + stackOffset;

      // Determine Connection Style
      // This ensures lines stop at the edge of the box (entryY/exitY)
      let connStyle = 'endArrow=none;html=1;dashed=1;strokeColor=#666666;entryX=0.5;';
      
      if (evtIdx === 0) {
        // First box connects to Dot
        // If Up, enter box at Bottom (1). If Down, enter box at Top (0).
        connStyle += `entryY=${isUp ? '1' : '0'};`;
      } else {
        // Subsequent boxes connect to Previous Box
        // If Up: Exit prev Top (0) -> Enter current Bottom (1)
        // If Down: Exit prev Bottom (1) -> Enter current Top (0)
        connStyle += isUp 
          ? 'exitX=0.5;exitY=0;entryY=1;' 
          : 'exitX=0.5;exitY=1;entryY=0;';
      }

      // Draw Connector
      root.ele('mxCell', { 
        id: `conn_${idCounter++}`, 
        value: '', 
        style: connStyle, 
        edge: '1', 
        parent: '1', 
        source: previousNodeId, 
        target: boxId 
      }).ele('mxGeometry', { relative: '1', as: 'geometry' });

      // Draw Event Box
      root.ele('mxCell', { 
        id: boxId, 
        value: eventText, 
        style: `rounded=1;whiteSpace=wrap;html=1;fillColor=${CONFIG.colors.eventFill};strokeColor=${CONFIG.colors.eventStroke};shadow=1;fontStyle=0;`, 
        vertex: '1', 
        parent: '1' 
      }).ele('mxGeometry', { x: String(xPos - 60), y: String(yPos), width: '120', height: '50', as: 'geometry' });

      // Update previous node for chaining
      previousNodeId = boxId;
    });

    xPos += CONFIG.timelineSpacing;
  });

  return root.end({ prettyPrint: true });
}

// --- MAIN EXECUTION ---
try {
  const inputPath = options.input;
  const outputPath = options.output;

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File ${inputPath} not found.`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputPath, 'utf8');
  console.log(`Parsing Timeline from ${inputPath}...`);
  
  const chartData = parseTimeline(content);
  console.log(`Found ${chartData.points.length} time points.`);
  
  const xml = generateDrawio(chartData);

  fs.writeFileSync(outputPath, xml);
  console.log(`Success! Saved to ${outputPath}`);

} catch (e) {
  console.error('An error occurred:', e.message);
  process.exit(1);
}
