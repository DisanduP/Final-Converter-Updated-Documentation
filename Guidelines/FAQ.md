# Mermaid to Draw.io Converter - FAQ

## Frequently Asked Questions

### Getting Started

**Q: I'm new to Mermaid. Where should I start?**
A: Begin with our [General-Usage.md](General-Usage.md) guide and try the sample files. Use the Mermaid Live Editor (mermaid.live) to experiment with syntax before converting.

**Q: Do I need to install anything special?**
A: Yes, you'll need Node.js and the Mermaid CLI:
```bash
npm install -g @mermaid-js/mermaid-cli
npm install
```

**Q: What's the difference between .mmd and .txt files?**
A: `.mmd` files contain Mermaid syntax for most diagram types. `.txt` files are used only for SWOT analysis in plain text format.

### Common Issues

**Q: My diagram converts but looks different in Draw.io**
A: Some advanced Mermaid styling may not convert perfectly. Manual adjustments in Draw.io are often needed for complex layouts.

**Q: Getting "command not found" errors**
A: Ensure Node.js is installed and the toolkit dependencies are available. Try using absolute paths to the converter files.

**Q: Large diagrams fail to convert**
A: Break complex diagrams into smaller ones, or increase Node.js memory: `node --max-old-space-size=4096 converter.js -i input.mmd -o output.drawio`

### Diagram Types

**Q: Which diagram type should I use for [specific use case]?**
A: Check our diagram-specific guidelines:
- Process flows → Flowcharts
- Task management → Kanban boards
- Data proportions → Pie charts
- Comparisons → Bar charts
- Company structure → Org charts
- Project schedules → Gantt charts
- Event sequences → Timelines
- System interactions → Sequence diagrams
- Knowledge organization → Mindmaps
- Business analysis → SWOT

**Q: Can I combine different diagram types?**
A: Yes! Create separate diagrams and combine them in Draw.io, or use Draw.io's features to create multi-page documents.

### Conversion & Output

**Q: How do I batch convert multiple diagrams?**
A: Use shell scripts or loops:
```bash
# Convert all flowcharts
for file in *.mmd; do
  node converter.js -i "$file" -o "${file%.mmd}.drawio"
done
```

**Q: What formats can I export the final diagrams to?**
A: Draw.io supports PNG, JPEG, SVG, PDF, and HTML exports. Use Draw.io's export menu after conversion.

**Q: Can I automate the conversion process?**
A: Yes, integrate with build scripts, CI/CD pipelines, or create custom batch processing scripts.

### Advanced Usage

**Q: How do I customize the appearance of converted diagrams?**
A: Apply styling in Draw.io after conversion. Some converters support basic Mermaid styling, but advanced customization is done in Draw.io.

**Q: Can I use this toolkit programmatically?**
A: The converters are command-line tools. For programmatic use, you could wrap them in scripts or create custom automation.

**Q: What's the performance impact of large diagrams?**
A: Complex diagrams with many nodes may take longer to convert. Consider splitting very large diagrams or optimizing the Mermaid syntax.

### Troubleshooting

**Q: Conversion succeeds but Draw.io shows errors**
A: Check the Draw.io version and try opening in the web version. Some complex diagrams may need manual cleanup.

**Q: Colors or styling don't match my expectations**
A: Draw.io applies its own default styling. Use Draw.io's styling tools to customize appearance after conversion.

**Q: Getting memory or performance errors**
A: Reduce diagram complexity, close other applications, or increase Node.js memory limits as shown above.

### Integration & Compatibility

**Q: Can I use this with documentation tools like MkDocs or Docusaurus?**
A: Yes! Export diagrams as images and include them in your documentation, or integrate conversion into your build process.

**Q: Does it work with version control systems?**
A: Absolutely! Store your `.mmd` source files in Git. The text-based format works great with version control.

**Q: Can I use this in CI/CD pipelines?**
A: Yes, the command-line interface makes it perfect for automation. Just ensure Node.js and dependencies are available in your pipeline.

### Support & Resources

**Q: Where can I get help?**
A: Check the troubleshooting guide first, then review the specific diagram guidelines. Test with sample files to isolate issues.

**Q: How do I report bugs or request features?**
A: Check if it's a known issue in the troubleshooting guide. For new issues, provide your Mermaid source, converter used, and error messages.

**Q: Can I contribute to the toolkit?**
A: Yes! Test with different diagram types, report issues, or suggest improvements. See our contributing guidelines for details.

### Best Practices

**Q: What's the recommended workflow?**
A: Design in Mermaid Live Editor → Validate syntax → Convert with appropriate tool → Refine in Draw.io → Export for use.

**Q: How do I maintain diagram consistency across projects?**
A: Create templates, establish style guides, and use Draw.io themes for consistent branding.

**Q: Should I store both .mmd and .drawio files?**
A: Store .mmd files as source (text-based, version controllable). Generate .drawio files as needed for editing or export.

### Performance & Scaling

**Q: What's the maximum diagram size supported?**
A: No hard limit, but very large diagrams (>100 nodes) may need optimization or splitting. Test with your specific use case.

**Q: Can I convert diagrams in parallel?**
A: Yes, run multiple converter instances simultaneously for batch processing of different diagram types.

**Q: How do I optimize conversion speed?**
A: Use batch processing, avoid overly complex styling in Mermaid, and ensure adequate system resources.

---

*This FAQ is regularly updated. If your question isn't answered here, check the specific diagram guidelines or troubleshooting guide.*
