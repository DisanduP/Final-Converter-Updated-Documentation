#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const { create } = require('xmlbuilder2');
const { differenceInDays, parse, addDays, format, min, max } = require('date-fns');

// CLI Configuration
program
  .version('1.0.0')
  .description('Convert Mermaid Gantt charts to Draw.io XML')
  .requiredOption('-i, --input <path>', 'Input Mermaid file')
  .option('-o, --output <path>', 'Output Draw.io XML file', 'output.drawio')
  .parse(process.argv);

const options = program.opts();

// --- CONFIGURATION ---
const CONFIG = {
  dayWidth: 40,       // Pixels per day
  rowHeight: 40,      // Height of a task bar
  headerHeight: 60,   // Height of the date axis
  sectionWidth: 100,  // Width of the section label column
  barColor: '#ffffff',
  barBorder: '#cccccc'
};

// --- PARSER LOGIC ---
function parseMermaid(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));

  const chart = {
    title: 'Gantt Chart',
    dateFormat: 'yyyy-MM-dd', // Default fallback
    sections: []
  };

  let currentSection = { name: 'default', tasks: [] };

  // Basic Regex for parsing
  // Matches: Task Name : [status] [id], start, duration/end
  const taskRegex = /(.+?)\s*:\s*(?:(done|active|crit),)?\s*(?:(\w+),)?\s*(\d{4}-\d{2}-\d{2})\s*,\s*(\d+[dw]|[\d{4}-\d{2}-\d{2}]+)/;

  lines.forEach(line => {
    if (line.startsWith('gantt')) return;

    if (line.startsWith('title')) {
      chart.title = line.replace('title', '').trim();
      return;
    }

    if (line.startsWith('dateFormat')) {
      // Mapping common mermaid formats to date-fns tokens roughly
      const fmt = line.replace('dateFormat', '').trim();
      chart.dateFormat = fmt.replace(/YYYY/g, 'yyyy').replace(/DD/g, 'dd');
      return;
    }

    if (line.startsWith('section')) {
      if (currentSection.tasks.length > 0) {
        chart.sections.push(currentSection);
      }
      currentSection = { name: line.replace('section', '').trim(), tasks: [] };
      return;
    }

    // Parse Task
    const match = line.match(taskRegex);
    if (match) {
      const name = match[1];
      const startDateRaw = match[4];
      const endOrDuration = match[5];

      let start = new Date(startDateRaw);
      let end;

      // Handle Duration vs End Date
      if (endOrDuration.includes('d')) {
        const days = parseInt(endOrDuration.replace('d', ''));
        end = addDays(start, days);
      } else if (endOrDuration.includes('w')) {
        const weeks = parseInt(endOrDuration.replace('w', ''));
        end = addDays(start, weeks * 7);
      } else {
        end = new Date(endOrDuration); // It's a date
      }

      currentSection.tasks.push({ name, start, end });
    }
  });

  // Push last section
  if (currentSection.tasks.length > 0 || currentSection.name !== 'default') {
    chart.sections.push(currentSection);
  }

  return chart;
}

// --- XML GENERATOR ---
function generateDrawio(chart) {
  // 1. Calculate Bounds
  let minDate = new Date(8640000000000000);
  let maxDate = new Date(-8640000000000000);

  chart.sections.forEach(sec => {
    sec.tasks.forEach(task => {
      if (task.start < minDate) minDate = task.start;
      if (task.end > maxDate) maxDate = task.end;
    });
  });

  // Add buffer
  minDate = addDays(minDate, -1);
  maxDate = addDays(maxDate, 2);
  const totalDays = differenceInDays(maxDate, minDate);
  const totalWidth = CONFIG.sectionWidth + (totalDays * CONFIG.dayWidth);

  // 2. Init XML
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('mxfile', { host: 'Electron', type: 'device' })
    .ele('diagram', { name: 'Page-1', id: 'diagramIdx' })
    .ele('mxGraphModel', { dx: '0', dy: '0', grid: '1', gridSize: '10', guides: '1', tooltips: '1', connect: '1', arrows: '1', fold: '1', page: '1', pageScale: '1', pageWidth: '827', pageHeight: '1169', math: '0', shadow: '0' })
    .ele('root');

  // Standard MxGraph Layers
  root.ele('mxCell', { id: '0' });
  root.ele('mxCell', { id: '1', parent: '0' });

  let yOffset = CONFIG.headerHeight;
  let idCounter = 2;

  // 3. Draw Section Containers & Tasks
  chart.sections.forEach(section => {
    const sectionHeight = section.tasks.length * CONFIG.rowHeight;

    // Draw Section Label (Left Sidebar)
    root.ele('mxCell', {
      id: `sec_${idCounter++}`,
      value: section.name,
      style: 'shape=partialRectangle;whiteSpace=wrap;html=1;left=0;right=0;fillColor=none;top=0;bottom=0;align=left;spacingLeft=10;fontStyle=1;fontSize=14;',
      vertex: '1',
      parent: '1'
    }).ele('mxGeometry', { x: '0', y: String(yOffset), width: String(CONFIG.sectionWidth), height: String(sectionHeight), as: 'geometry' });

    // Draw Section Horizontal Grid Lines
    root.ele('mxCell', {
      id: `grid_${idCounter++}`,
      value: '',
      style: 'endArrow=none;html=1;strokeColor=#d0d0d0;dashed=1;',
      edge: '1',
      parent: '1'
    }).ele('mxGeometry', { width: '50', height: '50', relative: '1', as: 'geometry' })
      .ele('mxPoint', { x: String(CONFIG.sectionWidth), y: String(yOffset + sectionHeight), as: 'sourcePoint' })
      .ele('mxPoint', { x: String(totalWidth), y: String(yOffset + sectionHeight), as: 'targetPoint' });

    // Draw Tasks
    section.tasks.forEach((task, index) => {
      const daysFromStart = differenceInDays(task.start, minDate);
      const durationDays = differenceInDays(task.end, task.start);

      const xPos = CONFIG.sectionWidth + (daysFromStart * CONFIG.dayWidth);
      const width = durationDays * CONFIG.dayWidth;
      const rowY = yOffset + (index * CONFIG.rowHeight);

      // Task Bar
      root.ele('mxCell', {
        id: `task_${idCounter++}`,
        value: task.name,
        style: `rounded=1;whiteSpace=wrap;html=1;fillColor=${CONFIG.barColor};strokeColor=${CONFIG.barBorder};fontColor=#333333;align=center;verticalAlign=middle;`,
        vertex: '1',
        parent: '1'
      }).ele('mxGeometry', {
        x: String(xPos),
        y: String(rowY + 5), // +5 padding
        width: String(width),
        height: String(CONFIG.rowHeight - 10),
        as: 'geometry'
      });
    });

    yOffset += sectionHeight;
  });

  // 4. Draw Timeline Header (Top)
  const headerY = 0;

  // Background for Header
  root.ele('mxCell', {
    id: `header_bg`,
    value: chart.title,
    style: 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=16;',
    vertex: '1',
    parent: '1'
  }).ele('mxGeometry', { x: '0', y: '0', width: String(totalWidth), height: '30', as: 'geometry' });

  // Date Ticks
  for (let d = 0; d <= totalDays; d++) {
    const currentDate = addDays(minDate, d);
    const xPos = CONFIG.sectionWidth + (d * CONFIG.dayWidth);

    // Tick Line
    root.ele('mxCell', {
      id: `tick_${idCounter++}`,
      value: '',
      style: 'endArrow=none;html=1;strokeColor=#b0b0b0;',
      edge: '1',
      parent: '1'
    }).ele('mxGeometry', { width: '50', height: '50', relative: '1', as: 'geometry' })
      .ele('mxPoint', { x: String(xPos), y: '30', as: 'sourcePoint' })
      .ele('mxPoint', { x: String(xPos), y: String(yOffset), as: 'targetPoint' });

    // Date Label
    root.ele('mxCell', {
      id: `lbl_${idCounter++}`,
      value: format(currentDate, 'MM/dd'),
      style: 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=10;fontColor=#666666;',
      vertex: '1',
      parent: '1'
    }).ele('mxGeometry', { x: String(xPos), y: '30', width: String(CONFIG.dayWidth), height: '30', as: 'geometry' });
  }

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
  console.log('Parsing Mermaid file...');
  const chartData = parseMermaid(content);

  console.log(`Found ${chartData.sections.length} sections.`);
  console.log('Generating Draw.io XML...');
  const xml = generateDrawio(chartData);

  fs.writeFileSync(outputPath, xml);
  console.log(`Success! Saved to ${outputPath}`);

} catch (e) {
  console.error('An error occurred:', e.message);
}
