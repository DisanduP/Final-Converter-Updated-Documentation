#!/usr/bin/env node

const fs = require('fs');
const { create } = require('xmlbuilder2');
const { program } = require('commander');

// --- Configuration ---
const COLORS = [
    '#FF6384', // Red/Pink
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#E7E9ED', // Grey
    '#C9CBCF'  // Dark Grey
];

const CHART_SIZE = 300;
const LEGEND_X_OFFSET = 350;
const LEGEND_ITEM_HEIGHT = 30;

async function runConversion(inputFile, outputFile) {
    if (!fs.existsSync(inputFile)) {
        console.error("Error: Input file does not exist.");
        process.exit(1);
    }

    console.log("🚀 Reading Mermaid Pie Chart file...");
    const mermaidContent = fs.readFileSync(inputFile, 'utf8');

    console.log("📊 Parsing syntax and calculating geometry...");
    const pieData = parseMermaidPie(mermaidContent);

    if (pieData.slices.length === 0) {
        console.error("Error: No valid pie chart data found.");
        process.exit(1);
    }

    console.log(`✅ Found title: "${pieData.title}" and ${pieData.slices.length} slices.`);

    // --- XML Construction ---
    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('mxGraphModel').ele('root');
    root.ele('mxCell', { id: '0' });
    root.ele('mxCell', { id: '1', parent: '0' });

    // 1. Add Title
    root.ele('mxCell', {
        id: 'title',
        value: pieData.title,
        style: "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=20;fontStyle=1",
        vertex: "1",
        parent: "1"
    }).ele('mxGeometry', {
        x: "0",
        y: "0",
        width: String(CHART_SIZE + 200), // Center roughly over chart + legend
        height: "40",
        as: "geometry"
    });

    // 2. Generate Pie Slices
    let currentAngle = 0; // 0.0 to 1.0 (where 1.0 is full circle)

    pieData.slices.forEach((slice, index) => {
        const percentage = slice.value / pieData.total;
        const color = COLORS[index % COLORS.length];

        const start = currentAngle;
        const end = currentAngle + percentage;

        // --- TEXT OFFSET LOGIC ---
        // Find the midpoint of the slice in radians
        // Note: Draw.io startAngle 0 is at 12 o'clock, growing clockwise
        const midAnglePercent = start + (percentage / 2);
        const midAngleRad = (midAnglePercent * 2 * Math.PI) - (Math.PI / 2);

        // Distance from center to place the text (e.g., 70% of the radius)
        const radius = CHART_SIZE / 2;
        const labelDist = radius * 0.7;

        // Calculate X and Y offsets from the center of the pie
        const labelX = Math.cos(midAngleRad) * labelDist;
        const labelY = Math.sin(midAngleRad) * labelDist;

        const sliceId = `slice_${index}`;

        const sliceCell = root.ele('mxCell', {
            id: sliceId,
            value: `${Math.round(percentage * 100)}%`,
            // style now includes label position offsets
            style: `shape=mxgraph.basic.pie;whiteSpace=wrap;html=1;startAngle=${start};endAngle=${end};fillColor=${color};strokeColor=#FFFFFF;strokeWidth=2;fontColor=#ffffff;fontSize=10;fontStyle=1;align=center;verticalAlign=middle;`,
            vertex: "1",
            parent: "1"
        });

        sliceCell.ele('mxGeometry', {
            x: "0",
            y: "50",
            width: String(CHART_SIZE),
            height: String(CHART_SIZE),
            as: "geometry"
        })
        // This 'mxPoint' as an offset moves the text relative to its default center position
        .ele('mxPoint', {
            x: String(Math.round(labelX)),
            y: String(Math.round(labelY)),
            as: "offset"
        });

        // 3. Generate Legend Item
        const legendY = 50 + (index * LEGEND_ITEM_HEIGHT);

        // Color Box
        root.ele('mxCell', {
            id: `legend_box_${index}`,
            value: "",
            style: `rounded=1;whiteSpace=wrap;html=1;fillColor=${color};strokeColor=none;`,
            vertex: "1",
            parent: "1"
        }).ele('mxGeometry', {
            x: String(LEGEND_X_OFFSET),
            y: String(legendY),
            width: "20",
            height: "20",
            as: "geometry"
        });

        // Legend Text
        root.ele('mxCell', {
            id: `legend_text_${index}`,
            value: `${slice.label}: ${slice.value}`,
            style: "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=12;",
            vertex: "1",
            parent: "1"
        }).ele('mxGeometry', {
            x: String(LEGEND_X_OFFSET + 30),
            y: String(legendY),
            width: "150",
            height: "20",
            as: "geometry"
        });

        currentAngle += percentage;
    });

    // Write output
    fs.writeFileSync(outputFile, root.end({ prettyPrint: true }));
    console.log(`✅ Success! Pie chart converted and saved to: ${outputFile}`);
}

function parseMermaidPie(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let title = "Pie Chart";
    const slices = [];
    let total = 0;

    lines.forEach(line => {
        // Match Title
        if (line.startsWith('title')) {
            title = line.replace(/^title\s+/, '').trim();
            return;
        }
        if (line.startsWith('pie')) return; // Skip the 'pie' declaration line if it has no title

        // Match Data: "Label" : 123
        // Supports optional quotes around label
        const match = line.match(/"?([^"]+)"?\s*:\s*([\d.]+)/);
        if (match) {
            const label = match[1].trim();
            const value = parseFloat(match[2]);
            if (!isNaN(value)) {
                slices.push({ label, value });
                total += value;
            }
        }
    });

    return { title, slices, total };
}

program
    .requiredOption('-i, --input <file>', 'Input .mmd file containing pie chart')
    .requiredOption('-o, --output <file>', 'Output .drawio file')
    .action((options) => runConversion(options.input, options.output));

program.parse();
