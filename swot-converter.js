#!/usr/bin/env node

const fs = require('fs-extra');
const { program } = require('commander');
const { create } = require('xmlbuilder2');

program
  .version('3.0.0 (SWOT Special Edition)')
  .requiredOption('-i, --input <path>', 'Input text file (.txt or .mmd)')
  .option('-o, --output <path>', 'Output Draw.io file', 'swot_pro.drawio')
  .parse(process.argv);

const options = program.opts();

// --- 1. The New List-Based Parser ---
// It expects headers like "quadrant-1 Title" followed by lines starting with "-"
function parseSwotList(lines) {
  // Initialize structure for 4 quadrants.
  // Q1: TL, Q2: TR, Q3: BL, Q4: BR (Standard matrix setup)
  const data = {
    1: { title: 'Strengths', items: [] },
    2: { title: 'Weaknesses', items: [] },
    3: { title: 'Opportunities', items: [] },
    4: { title: 'Threats', items: [] }
  };

  let currentQ = 0;

  lines.forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    // Detect Headers
    if (cleanLine.toLowerCase().startsWith('quadrant-1')) {
        currentQ = 1; data[1].title = cleanLine.substring(10).trim() || data[1].title;
    } else if (cleanLine.toLowerCase().startsWith('quadrant-2')) {
        currentQ = 2; data[2].title = cleanLine.substring(10).trim() || data[2].title;
    } else if (cleanLine.toLowerCase().startsWith('quadrant-3')) {
        currentQ = 3; data[3].title = cleanLine.substring(10).trim() || data[3].title;
    } else if (cleanLine.toLowerCase().startsWith('quadrant-4')) {
        currentQ = 4; data[4].title = cleanLine.substring(10).trim() || data[4].title;
    } 
    // Detect List Items (must start with a hyphen)
    else if (cleanLine.startsWith('-') && currentQ > 0) {
        // Remove hyphen and trim
        data[currentQ].items.push(cleanLine.substring(1).trim());
    }
  });

  return data;
}

// --- 2. The "Pro Style" XML Generator ---
function generateProSwotXml(swotData) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('mxfile', { host: 'SWOT-Pro-CLI' })
      .ele('diagram', { name: 'SWOT Analysis' })
        .ele('mxGraphModel', { grid: '1', gridSize: '10', guides: '1', tooltips: '1', connect: '1', arrows: '1', fold: '1', page: '1', pageScale: '1', pageWidth: '850', pageHeight: '1100', background: '#ffffff' })
          .ele('root');

  root.ele('mxCell', { id: '0' });
  root.ele('mxCell', { id: '1', parent: '0' });

  // --- Layout Constants ---
  const containerWidth = 280;
  const containerHeight = 350; // Fixed height for uniform look
  const gapX = 40; // Gap between columns
  const gapY = 40; // Gap between rows
  const startX = 80;
  const startY = 80;

  const itemHeight = 40;
  const itemGap = 10;
  const itemMarginX = 20; // Left/Right margin inside container
  const titleTopMargin = 40; // Space below container title before items start

  // Define base positions for the 2x2 grid
  const positions = {
    1: { x: startX, y: startY },                                      // Top-Left
    2: { x: startX + containerWidth + gapX, y: startY },              // Top-Right
    3: { x: startX, y: startY + containerHeight + gapY },             // Bottom-Left
    4: { x: startX + containerWidth + gapX, y: startY + containerHeight + gapY } // Bottom-Right
  };

  // STYLES matching your screenshot (Thick borders, clean white, rounded items)
  const containerStyle = 'whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;verticalAlign=top;fontStyle=1;fontSize=14;spacingTop=10;';
  const itemStyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=1;fontSize=12;';

  let cellIdCounter = 2;

  // Loop through quadrants 1 to 4
  [1, 2, 3, 4].forEach(qNum => {
      const qData = swotData[qNum];
      const pos = positions[qNum];
      const containerId = `q${qNum}_container`;

      // 1. Draw the Container Box
      root.ele('mxCell', {
          id: containerId,
          value: qData.title, // Title at the top
          parent: '1',
          vertex: '1',
          style: containerStyle
      }).ele('mxGeometry', { x: pos.x, y: pos.y, width: containerWidth, height: containerHeight, as: 'geometry' });

      // 2. Draw the Stacked Items inside
      let currentItemY = pos.y + titleTopMargin;
      const itemWidth = containerWidth - (itemMarginX * 2);

      qData.items.forEach((itemText, index) => {
          root.ele('mxCell', {
              id: `q${qNum}_item_${index}`,
              value: itemText,
              parent: '1', // Note: Parent is the layer '1', not the container box, for easier editing in draw.io
              vertex: '1',
              style: itemStyle
          }).ele('mxGeometry', { 
              x: pos.x + itemMarginX, 
              y: currentItemY, 
              width: itemWidth, 
              height: itemHeight, 
              as: 'geometry' 
          });

          // Increment Y position for next item
          currentItemY += itemHeight + itemGap;
      });
  });

  return root.end({ prettyPrint: true });
}

// --- 3. Main Execution ---
(async () => {
  try {
    const raw = await fs.readFile(options.input, 'utf8');
    const lines = raw.split('\n');
    
    console.log('Parsing SWOT list format...');
    const parsedData = parseSwotList(lines);

    console.log('Generating high-quality XML layout...');
    const xml = generateProSwotXml(parsedData);

    await fs.writeFile(options.output, xml);
    console.log(`✅ Professional SWOT saved to ${options.output}`);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
