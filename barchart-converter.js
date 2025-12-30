#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const { create } = require('xmlbuilder2');

// --- CLI CONFIGURATION ---
program
  .version('1.1.0')
  .description('Convert Mermaid Bar Charts to Draw.io XML with Gridlines')
  .requiredOption('-i, --input <path>', 'Input Mermaid file')
  .option('-o, --output <path>', 'Output Draw.io XML file', 'barchart.drawio')
  .parse(process.argv);

const options = program.opts();

// --- VISUAL CONFIGURATION ---
const CONFIG = {
  chartHeight: 400,     // Max height of the bars in pixels
  barWidth: 60,         // Width of each bar
  barGap: 40,           // Space between bars
  leftPadding: 80,      // Space for Y-axis labels
  bottomPadding: 60,    // Space for X-axis labels
  
  // Colors
  colors: {
    axis: '#333333',
    gridLine: '#e6e6e6', // Faint grey for gridlines
    barFill: '#e0e0e0',
    barStroke: '#999999',
    text: '#000000'
  }
};

// --- HELPER: Calculate "Nice" Step Size for Axis ---
// e.g., if max is 61.5, we want steps of 10 (0, 10, 20...)
function calculateAxisStep(maxValue) {
  if (maxValue === 0) return 1;
  
  // Target roughly 5-8 ticks
  const roughStep = maxValue / 6; 
  
  // Calculate magnitude of the step (power of 10)
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalizedStep = roughStep / magnitude;

  let niceStep;
  if (normalizedStep < 1.5) niceStep = 1;
  else if (normalizedStep < 3) niceStep = 2;
  else if (normalizedStep < 7) niceStep = 5;
  else niceStep = 10;

  return niceStep * magnitude;
}

// --- PARSER ---
function parseBarChart(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
  
  const chart = {
    title: 'Bar Chart',
    xAxis: [],
    data: [],
    yTitle: ''
  };

  lines.forEach(line => {
    if (line.startsWith('title')) {
      chart.title = line.replace('title', '').replace(/"/g, '').trim();
    } else if (line.startsWith('x-axis')) {
      const match = line.match(/\[(.*?)\]/);
      if (match) chart.xAxis = match[1].split(',').map(s => s.trim().replace(/"/g, ''));
    } else if (line.startsWith('y-axis')) {
      const parts = line.split('"');
      if (parts.length > 1) chart.yTitle = parts[1];
    } else if (line.startsWith('bar')) {
      const match = line.match(/\[(.*?)\]/);
      if (match) chart.data = match[1].split(',').map(s => parseFloat(s.trim()));
    }
  });

  return chart;
}

// --- XML GENERATOR ---
function generateDrawio(chart) {
  // 1. Calculations
  const maxVal = Math.max(...chart.data);
  const stepSize = calculateAxisStep(maxVal);
  
  // Calculate max axis value (round up to next step)
  const maxAxisVal = Math.ceil((maxVal * 1.1) / stepSize) * stepSize;

  const count = chart.data.length;
  const totalChartWidth = (count * CONFIG.barWidth) + ((count - 1) * CONFIG.barGap) + 100;
  const originX = CONFIG.leftPadding;
  const originY = CONFIG.chartHeight + 100; // Y-coordinate of the X-axis line
  
  // Scale: pixels per unit value
  // We use maxAxisVal to ensure the top tick fits in the height
  const scale = CONFIG.chartHeight / maxAxisVal; 

  // 2. Initialize XML
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('mxfile', { host: 'Electron', type: 'device' })
    .ele('diagram', { name: 'Page-1', id: 'diagramIdx' })
    .ele('mxGraphModel', { dx: '0', dy: '0', grid: '1', gridSize: '10', guides: '1', tooltips: '1', connect: '1', arrows: '1', fold: '1', page: '1', pageScale: '1', pageWidth: '1169', pageHeight: '827', math: '0', shadow: '0' })
    .ele('root');

  root.ele('mxCell', { id: '0' });
  root.ele('mxCell', { id: '1', parent: '0' });

  let idCounter = 100;

  // 3. Draw Gridlines & Y-Axis Labels (NEW SECTION)
  // We iterate from 0 to maxAxisVal by stepSize
  for (let val = 0; val <= maxAxisVal; val += stepSize) {
    const yPos = originY - (val * scale);
    
    // Gridline (skip for 0 as that's the X-axis)
    if (val > 0) {
      root.ele('mxCell', { 
        id: `grid_${idCounter++}`, 
        value: '', 
        style: `endArrow=none;html=1;strokeColor=${CONFIG.colors.gridLine};strokeWidth=1;`, 
        edge: '1', 
        parent: '1' 
      })
      .ele('mxGeometry', { relative: '1', as: 'geometry' })
      .ele('mxPoint', { x: String(originX), y: String(yPos), as: 'sourcePoint' })
      .ele('mxPoint', { x: String(originX + totalChartWidth), y: String(yPos), as: 'targetPoint' });
    }

    // Y-Axis Label (0, 10, 20...)
    root.ele('mxCell', { 
      id: `ylab_${idCounter++}`, 
      value: String(val), 
      style: 'text;html=1;align=right;verticalAlign=middle;fontStyle=0;fontSize=11;', 
      vertex: '1', 
      parent: '1' 
    }).ele('mxGeometry', { 
      x: String(originX - 40), 
      y: String(yPos - 10), 
      width: '30', 
      height: '20', 
      as: 'geometry' 
    });
  }

  // 4. Draw Title
  root.ele('mxCell', { id: 'title', value: chart.title, style: 'text;fontSize=24;fontStyle=1;align=center;', vertex: '1', parent: '1' })
      .ele('mxGeometry', { x: String(originX), y: '20', width: String(totalChartWidth), height: '40', as: 'geometry' });

  // 5. Draw Axes Lines
  // Y-Axis Line
  root.ele('mxCell', { id: 'axis_y', value: '', style: `endArrow=classic;html=1;strokeWidth=2;strokeColor=${CONFIG.colors.axis};`, edge: '1', parent: '1' })
    .ele('mxGeometry', { relative: '1', as: 'geometry' })
    .ele('mxPoint', { x: String(originX), y: String(originY), as: 'sourcePoint' })
    .ele('mxPoint', { x: String(originX), y: String(originY - CONFIG.chartHeight - 30), as: 'targetPoint' });

  // X-Axis Line
  root.ele('mxCell', { id: 'axis_x', value: '', style: `endArrow=classic;html=1;strokeWidth=2;strokeColor=${CONFIG.colors.axis};`, edge: '1', parent: '1' })
    .ele('mxGeometry', { relative: '1', as: 'geometry' })
    .ele('mxPoint', { x: String(originX), y: String(originY), as: 'sourcePoint' })
    .ele('mxPoint', { x: String(originX + totalChartWidth), y: String(originY), as: 'targetPoint' });

  // Y-Axis Title (Rotated)
  if (chart.yTitle) {
    root.ele('mxCell', { id: 'lbl_y_title', value: chart.yTitle, style: 'text;html=1;align=center;verticalAlign=middle;rotation=-90;fontStyle=1;', vertex: '1', parent: '1' })
      .ele('mxGeometry', { x: String(originX - 70), y: String(originY - (CONFIG.chartHeight/2)), width: '40', height: '40', as: 'geometry' });
  }

  // 6. Draw Bars & Labels
  chart.data.forEach((val, index) => {
    const barHeight = val * scale;
    const xPos = originX + 20 + (index * (CONFIG.barWidth + CONFIG.barGap));
    const yPos = originY - barHeight;
    const catName = chart.xAxis[index] || `Item ${index+1}`;

    // Bar
    root.ele('mxCell', { 
      id: `bar_${idCounter++}`, 
      value: '', 
      style: `rounded=0;whiteSpace=wrap;html=1;fillColor=${CONFIG.colors.barFill};strokeColor=${CONFIG.colors.barStroke};`, 
      vertex: '1', 
      parent: '1' 
    }).ele('mxGeometry', { 
      x: String(xPos), 
      y: String(yPos), 
      width: String(CONFIG.barWidth), 
      height: String(barHeight), 
      as: 'geometry' 
    });

    // Value Label (Top of bar)
    root.ele('mxCell', { 
      id: `val_${idCounter++}`, 
      value: String(val), 
      style: 'text;html=1;align=center;verticalAlign=middle;fontStyle=1;', 
      vertex: '1', 
      parent: '1' 
    }).ele('mxGeometry', { 
      x: String(xPos), 
      y: String(yPos - 20), 
      width: String(CONFIG.barWidth), 
      height: '20', 
      as: 'geometry' 
    });

    // X-Axis Category Label (Bottom)
    root.ele('mxCell', { 
      id: `cat_${idCounter++}`, 
      value: catName, 
      style: 'text;html=1;align=center;verticalAlign=top;fontStyle=0;', 
      vertex: '1', 
      parent: '1' 
    }).ele('mxGeometry', { 
      x: String(xPos), 
      y: String(originY + 5), 
      width: String(CONFIG.barWidth), 
      height: '30', 
      as: 'geometry' 
    });
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
  console.log('Parsing Bar Chart...');
  
  const chartData = parseBarChart(content);
  console.log(`Found ${chartData.data.length} bars. Max value: ${Math.max(...chartData.data)}`);
  
  const xml = generateDrawio(chartData);

  fs.writeFileSync(outputPath, xml);
  console.log(`Success! Saved to ${outputPath}`);
  console.log('Features added: Horizontal gridlines, Y-axis labels, Baseline Zero.');

} catch (e) {
  console.error('An error occurred:', e.message);
  process.exit(1);
}