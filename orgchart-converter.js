#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const { create } = require('xmlbuilder2');

// --- CLI SETUP ---
program
  .version('1.2.0')
  .description('Convert Mermaid Org Charts to Clean Draw.io XML')
  .requiredOption('-i, --input <path>', 'Input Mermaid file (.mmd)')
  .option('-o, --output <path>', 'Output Draw.io XML file', 'org_chart.drawio')
  .parse(process.argv);

const options = program.opts();

// --- VISUAL CONFIGURATION ---
const STYLE = {
  nodeWidth: 140,
  nodeHeight: 60,
  levelHeight: 150, // More space for clean line routing
  siblingGap: 60,   
  
  // Depth-based colors (Level 0, 1, 2, 3+)
  colors: [
    { fill: '#dae8fc', stroke: '#6c8ebf' }, // CEO / Level 0
    { fill: '#f5f5f5', stroke: '#666666' }, // Management / Level 1
    { fill: '#d5e8d4', stroke: '#82b366' }, // Staff / Level 2
    { fill: '#fff2cc', stroke: '#d6b656' }  // Junior / Level 3+
  ],

  // Connection Style - Forces lines to start at bottom and end at top
  edgeStyle: 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;strokeColor=#666666;strokeWidth=1;'
};

// --- PARSER ---
function parseMermaid(content) {
  const lines = content.split('\n');
  const nodes = new Map();
  const edges = [];

  lines.forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('%%') || line.startsWith('graph') || line.startsWith('flowchart')) return;

    if (line.includes('-->') || line.includes('---')) {
      const parts = line.split(/-->|---/);
      const fromNode = parseNodeString(parts[0].trim());
      const toNode = parseNodeString(parts[1].trim());

      if (fromNode) {
        if (!nodes.has(fromNode.id)) nodes.set(fromNode.id, { ...fromNode, level: 0 });
        if (fromNode.label && nodes.get(fromNode.id).label === fromNode.id) nodes.get(fromNode.id).label = fromNode.label;
      }
      if (toNode) {
        if (!nodes.has(toNode.id)) nodes.set(toNode.id, { ...toNode, level: 0 });
        if (toNode.label && nodes.get(toNode.id).label === toNode.id) nodes.get(toNode.id).label = toNode.label;
      }
      if (fromNode && toNode) edges.push({ from: fromNode.id, to: toNode.id });
    } else {
      const node = parseNodeString(line);
      if (node && !nodes.has(node.id)) nodes.set(node.id, { ...node, level: 0 });
    }
  });

  return { nodes, edges };
}

function parseNodeString(str) {
  const match = str.match(/([a-zA-Z0-9_]+)\s*[\[\(\{](.*?)[\}\)\]]/);
  if (match) return { id: match[1], label: match[2] };
  const simpleMatch = str.match(/([a-zA-Z0-9_]+)/);
  if (simpleMatch) return { id: simpleMatch[1], label: simpleMatch[1] };
  return null;
}

// --- IMPROVED LAYOUT ENGINE ---
function calculateLayout(graph) {
  const { nodes, edges } = graph;
  const childrenMap = new Map();
  const parentMap = new Map();
  
  edges.forEach(e => {
    if (!childrenMap.has(e.from)) childrenMap.set(e.from, []);
    childrenMap.get(e.from).push(e.to);
    parentMap.set(e.to, e.from);
  });

  const roots = [];
  nodes.forEach((node, id) => {
    if (!parentMap.has(id)) roots.push(id);
  });

  const levels = [];
  const visited = new Set();

  function traverse(id, depth) {
    if (visited.has(id)) return;
    visited.add(id);

    nodes.get(id).level = depth; // Store depth for coloring
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(id);

    const children = childrenMap.get(id) || [];
    children.forEach(childId => traverse(childId, depth + 1));
  }

  roots.forEach(rootId => traverse(rootId, 0));

  levels.forEach((levelNodes, levelIndex) => {
    const totalLevelWidth = levelNodes.length * STYLE.nodeWidth + (levelNodes.length - 1) * STYLE.siblingGap;
    const startX = 500 - (totalLevelWidth / 2); // Centering

    levelNodes.forEach((nodeId, index) => {
      const node = nodes.get(nodeId);
      node.x = startX + (index * (STYLE.nodeWidth + STYLE.siblingGap));
      node.y = 100 + (levelIndex * STYLE.levelHeight);
    });
  });

  return graph;
}

// --- XML GENERATOR ---
function generateDrawio(graph) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('mxfile', { host: 'Electron', type: 'device' })
    .ele('diagram', { name: 'Org Chart', id: 'diagramIdx' })
    .ele('mxGraphModel', { dx: '0', dy: '0', grid: '1', gridSize: '10', guides: '1', tooltips: '1', connect: '1', arrows: '1', fold: '1', page: '1', pageScale: '1', pageWidth: '1169', pageHeight: '827', math: '0', shadow: '0' })
    .ele('root');

  root.ele('mxCell', { id: '0' });
  root.ele('mxCell', { id: '1', parent: '0' });

  // Draw Nodes
  graph.nodes.forEach(node => {
    const colorIdx = Math.min(node.level, STYLE.colors.length - 1);
    const color = STYLE.colors[colorIdx];
    const nodeStyle = `rounded=1;whiteSpace=wrap;html=1;fillColor=${color.fill};strokeColor=${color.stroke};fontStyle=1;fontSize=12;glass=0;dropShadow=0;`;

    root.ele('mxCell', { 
      id: node.id, 
      value: node.label, 
      style: nodeStyle, 
      vertex: '1', 
      parent: '1' 
    }).ele('mxGeometry', { 
      x: String(node.x), 
      y: String(node.y), 
      width: String(STYLE.nodeWidth), 
      height: String(STYLE.nodeHeight), 
      as: 'geometry' 
    });
  });

  // Draw Edges
  graph.edges.forEach((edge, idx) => {
    root.ele('mxCell', { 
      id: `edge_${idx}`, 
      value: '', 
      style: STYLE.edgeStyle, 
      edge: '1', 
      parent: '1', 
      source: edge.from, 
      target: edge.to 
    }).ele('mxGeometry', { relative: '1', as: 'geometry' });
  });

  return root.end({ prettyPrint: true });
}

// --- EXECUTION ---
try {
  const content = fs.readFileSync(options.input, 'utf8');
  let graph = calculateLayout(parseMermaid(content));
  fs.writeFileSync(options.output, generateDrawio(graph));
  console.log(`Successfully generated clean Org Chart: ${options.output}`);
} catch (e) {
  console.error('Error:', e.message);
}
