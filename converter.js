#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const { create } = require('xmlbuilder2');
const cheerio = require('cheerio');
const { graphlib, layout } = require('dagre');
const { program } = require('commander');

async function runConversion(inputFile, outputFile) {
    if (!fs.existsSync(inputFile)) {
        console.error("Error: Input file does not exist.");
        process.exit(1);
    }

    console.log("🚀 Reading Mermaid file...");

    // Read the Mermaid file
    const mermaidContent = fs.readFileSync(inputFile, 'utf8');

    console.log("📊 Parsing Mermaid syntax and computing Dagre layout...");

    // Parse Mermaid and create Dagre layout
    const { nodes, edges } = parseMermaidAndLayout(mermaidContent);

    console.log(`✅ Parsed ${nodes.length} nodes and ${edges.length} edges`);

    // Apply professional styling to nodes
    nodes.forEach(node => {
        let style = "whiteSpace=wrap;html=1;fontSize=12;fillColor=#ffffff;strokeColor=#000000;rounded=1;";
        if (node.shape === 'diamond') {
            // FIX: Add 'perimeter=rhombusPerimeter' so arrows touch the angled edges properly
            style = "shape=rhombus;perimeter=rhombusPerimeter;whiteSpace=wrap;html=1;fontSize=12;";
        } else if (node.shape === 'round') {
            style = "shape=ellipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;";
        }
        node.style = style;
    });

    console.log(`📝 Final diagram: ${nodes.length} nodes and ${edges.length} edges`);
    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('mxGraphModel').ele('root');
    root.ele('mxCell', { id: '0' });
    root.ele('mxCell', { id: '1', parent: '0' });

    // Add nodes
    nodes.forEach(n => {
        root.ele('mxCell', {
            id: n.id,
            value: n.label,
            style: n.style,
            vertex: "1",
            parent: "1"
        }).ele('mxGeometry', {
            x: n.x,
            y: n.y,
            width: n.w,
            height: n.h,
            as: "geometry"
        });
    });

    // Add edges
    edges.forEach(e => {
        const edgeCell = root.ele('mxCell', {
            id: e.id,
            value: e.label,
            style: e.style,
            edge: "1",
            parent: "1",
            source: e.source,
            target: e.target
        });

        const geo = edgeCell.ele('mxGeometry', { relative: "1", as: "geometry" });
        
        // FIX: Only add intermediate waypoints.
        // Skipping points[0] and points[last] ensures the line snaps
        // to the outside border of your source and target nodes.
        if (e.points && e.points.length > 2) {
            const array = geo.ele('Array', { as: "points" });
            // i = 1 starts after the source center; length - 1 stops before the target center
            for (let i = 1; i < e.points.length - 1; i++) {
                array.ele('mxPoint', { x: e.points[i].x, y: e.points[i].y });
            }
        }
    });

    // Write output
    fs.writeFileSync(outputFile, root.end({ prettyPrint: true }));

    console.log(`✅ Success! Diagram converted and saved to: ${outputFile}`);
}

function parseMermaidAndLayout(mermaidText) {
    // Parse Mermaid flowchart syntax
    const lines = mermaidText.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('graph'));

    const nodes = new Map();
    const edges = [];

    // --- Pass 1: Extract Nodes (Keep this as is) ---
    lines.forEach(line => {
        // Match node definitions like A[Label] or B{Decision}
        const nodeMatches = line.match(/(\w+)\[([^\]]+)\]|\w+\{([^}]+)\}|\w+\(([^)]+)\)/g);
        if (nodeMatches) {
            nodeMatches.forEach(match => {
                const nodeMatch = match.match(/(\w+)(?:\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\))/);
                if (nodeMatch) {
                    const [_, id, rectLabel, diamondLabel, roundLabel] = nodeMatch;
                    const label = rectLabel || diamondLabel || roundLabel || id;
                    const shape = diamondLabel ? 'diamond' : roundLabel ? 'round' : 'rect';

                    if (!nodes.has(id)) {
                        nodes.set(id, {
                            id,
                            label,
                            shape,
                            width: shape === 'diamond' ? 160 : 140,
                            height: shape === 'diamond' ? 100 : 70
                        });
                    }
                }
            });
        }
    });

    // --- Pass 2: Extract Edges (UPDATED) ---
    lines.forEach(line => {
        // 1. Sanitize the line: Remove node labels like [Text], {Text}, (Text)
        // This turns "A[Start] --> B{End}" into "A --> B" so the regex can find it.
        const cleanLine = line
            .replace(/\[[^\]]+\]/g, '') // Remove [ ]
            .replace(/\{[^}]+\}/g, '') // Remove { }
            .replace(/\([^)]+\)/g, ''); // Remove ( )

        // 2. Match edges (Supports --> and -.-> and ==>)
        // We use [-=.] to support dotted lines and thick lines too
        const edgeMatches = cleanLine.match(/(\w+)\s*[-=.]{1,3}>(?:\s*\|\s*([^|]+)\s*\|\s*)?\s*(\w+)/g);
        
        if (edgeMatches) {
            edgeMatches.forEach(match => {
                // Re-run regex on the specific match to extract groups
                const edgeMatch = match.match(/(\w+)\s*[-=.]{1,3}>(?:\s*\|\s*([^|]+)\s*\|\s*)?\s*(\w+)/);
                if (edgeMatch) {
                    const [_, source, label, target] = edgeMatch;
                    edges.push({
                        source,
                        target,
                        label: label || '' // Keeps your Yes/No fix
                    });
                }
            });
        }
    });

    // --- Dagre Layout Setup (With your Label Fix included) ---
    const g = new graphlib.Graph();
    g.setGraph({
        rankdir: 'TB',
        nodesep: 120, // Increase horizontal distance between nodes
        ranksep: 120, // Increase vertical distance between rows
        edgesep: 80,  // CRITICAL: Increase space between parallel/adjacent arrows
        align: 'UL'
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    nodes.forEach(node => {
        g.setNode(node.id, {
            label: node.label,
            width: node.width,
            height: node.height,
            shape: node.shape
        });
    });

    // Add edges (Pass label to Dagre so we can retrieve it later)
    edges.forEach(edge => {
        g.setEdge(edge.source, edge.target, { label: edge.label, weight: 1 });
    });

    layout(g);

    // Extract positioned nodes
    const positionedNodes = [];
    g.nodes().forEach(nodeId => {
        const node = g.node(nodeId);
        // Safety check: if a node appears in an edge but wasn't defined in Pass 1, create a default
        const originalNode = nodes.get(nodeId) || { shape: 'rect', label: nodeId };
        
        positionedNodes.push({
            id: nodeId,
            label: node.label,
            x: node.x - node.width / 2,
            y: node.y - node.height / 2,
            w: node.width,
            h: node.height,
            shape: originalNode.shape
        });
    });

    // Extract edges with waypoints AND labels
    const positionedEdges = [];
    g.edges().forEach((edge, i) => {
        const edgeData = g.edge(edge);
        
        positionedEdges.push({
            id: `edge_${i}`,
            source: edge.v,
            target: edge.w,
            points: edgeData.points || [],
            label: edgeData.label || "", // <--- Retain your label fix
            style: "edgeStyle=orthogonalEdgeStyle;rounded=1;curved=1;html=1;endArrow=classic;strokeWidth=2;labelBackgroundColor=#ffffff;spacing=10;"
        });
    });

    return { nodes: positionedNodes, edges: positionedEdges };
}

program
    .requiredOption('-i, --input <file>', 'Input .mmd')
    .requiredOption('-o, --output <file>', 'Output .drawio')
    .action((options) => runConversion(options.input, options.output));

program.parse();

program.parse();