# Troubleshooting Guide

## Common Issues and Solutions

### Installation Problems

#### "Command not found" when running converters
**Symptoms**: `node: command not found` or `npm: command not found`
**Solutions**:
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Verify installation: `node --version` and `npm --version`
3. Restart terminal/command prompt
4. On macOS/Linux, check PATH: `echo $PATH`

#### Mermaid CLI not found
**Symptoms**: `mmdc: command not found`
**Solutions**:
```bash
# Install globally
npm install -g @mermaid-js/mermaid-cli

# Verify installation
mmdc --version

# If permission errors on macOS/Linux
sudo npm install -g @mermaid-js/mermaid-cli
```

#### Dependencies not installed
**Symptoms**: Module import errors
**Solutions**:
```bash
# Install project dependencies
npm install

# Clear npm cache if issues persist
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### File and Path Issues

#### "File not found" errors
**Symptoms**: `Error: ENOENT: no such file or directory`
**Solutions**:
1. Use absolute paths: `/Users/username/project/input.mmd`
2. Check file exists: `ls -la input.mmd`
3. Ensure correct file extension (.mmd for diagrams, .txt for SWOT)
4. Check file permissions: `chmod 644 input.mmd`

#### Output directory doesn't exist
**Symptoms**: `Error: EACCES: permission denied` or directory creation errors
**Solutions**:
```bash
# Create output directory first
mkdir -p output-directory

# Or use current directory
node converter.js -i input.mmd -o ./output.drawio
```

#### File encoding issues
**Symptoms**: Garbled text or special characters not displaying
**Solutions**:
1. Save files as UTF-8 encoding
2. Avoid special characters in filenames
3. Use plain ASCII for maximum compatibility

### Syntax and Conversion Issues

#### "Invalid Mermaid syntax" errors
**Symptoms**: Parser errors or failed conversions
**Solutions**:
1. Validate syntax in [Mermaid Live Editor](https://mermaid.live)
2. Check for missing semicolons or brackets
3. Ensure proper indentation
4. Verify diagram type syntax (flowchart vs sequence vs etc.)

#### Diagram renders incorrectly
**Symptoms**: Layout problems, missing elements, wrong styling
**Solutions**:
1. Simplify complex diagrams
2. Check for unsupported Mermaid features
3. Try different layout directions (TD, LR, etc.)
4. Manually adjust in Draw.io after conversion

#### Colors or styling not preserved
**Symptoms**: Converted diagram lacks custom colors or themes
**Solutions**:
1. Some advanced styling may not convert perfectly
2. Apply styling manually in Draw.io
3. Use Draw.io themes for consistent branding
4. Check converter-specific limitations

### Performance Issues

#### Conversion takes too long
**Symptoms**: Process hangs or takes >30 seconds
**Solutions**:
1. Reduce diagram complexity (<50 elements)
2. Split large diagrams into smaller ones
3. Close other memory-intensive applications
4. Use batch processing for multiple files

#### Memory errors
**Symptoms**: `JavaScript heap out of memory`
**Solutions**:
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 converter.js -i input.mmd -o output.drawio
```

#### Batch processing fails
**Symptoms**: Script stops on first error
**Solutions**:
```bash
# Add error handling to batch scripts
for file in *.mmd; do
  echo "Converting $file..."
  node converter.js -i "$file" -o "${file%.mmd}.drawio" || echo "Failed: $file"
done
```

### Diagram-Specific Issues

#### Flowchart connection problems
**Symptoms**: Missing arrows or incorrect routing
**Solutions**:
1. Ensure all nodes are properly defined before connections
2. Check for circular references
3. Use explicit connection syntax: `A --> B`
4. Avoid complex nested structures

#### Chart data not displaying
**Symptoms**: Empty charts or missing data points
**Solutions**:
1. Verify data format and ranges
2. Check for consistent data types
3. Ensure proper axis definitions
4. Validate Mermaid chart syntax

#### Sequence diagram timing issues
**Symptoms**: Messages out of order or overlapping
**Solutions**:
1. Define participants in correct order
2. Use appropriate arrow types for message direction
3. Add notes for complex interactions
4. Consider using `autonumber` for message sequencing

#### Mindmap hierarchy problems
**Symptoms**: Incorrect nesting or missing branches
**Solutions**:
1. Use consistent indentation (2 spaces recommended)
2. Ensure root node is properly defined
3. Check for special characters in node names
4. Limit hierarchy depth to 4-5 levels

### Draw.io Integration Issues

#### File won't open in Draw.io
**Symptoms**: Corrupted file or format errors
**Solutions**:
1. Verify `.drawio` extension
2. Check file size (should be >0 bytes)
3. Try opening in Draw.io web version
4. Re-convert with different settings

#### Elements not editable in Draw.io
**Symptoms**: Diagram appears as image or locked
**Solutions**:
1. Ensure XML format is correct
2. Check for conversion errors in output
3. Manually edit XML if needed (advanced)
4. Re-convert from original Mermaid file

### Advanced Troubleshooting

#### Debug mode conversion
```bash
# Add verbose logging (if supported by converter)
node converter.js -i input.mmd -o output.drawio --verbose

# Check intermediate files
ls -la temp-* *.svg *.xml
```

#### Manual conversion steps
If automatic conversion fails:
1. Generate SVG using Mermaid CLI: `mmdc -i input.mmd -o temp.svg`
2. Convert SVG to Draw.io manually using online tools
3. Compare with working sample files

#### Version compatibility
**Symptoms**: Works with some diagrams but not others
**Solutions**:
1. Update to latest Mermaid CLI: `npm update -g @mermaid-js/mermaid-cli`
2. Check Node.js version compatibility
3. Test with provided sample files
4. Report version-specific issues

### Getting Help

#### Diagnostic information to provide:
```bash
# System information
node --version
npm --version
mmdc --version
uname -a

# File information
ls -la input.mmd
head -20 input.mmd
file input.mmd

# Error logs
node converter.js -i input.mmd -o output.drawio 2>&1 | tee error.log
```

#### Support resources:
1. Check converter-specific guidelines in this folder
2. Test with sample files: `sample_*.mmd`
3. Validate Mermaid syntax online
4. Review Draw.io documentation for import issues

#### When to report issues:
- Consistent failures across multiple files
- Performance problems affecting workflow
- Missing features or functionality
- Documentation inaccuracies

### Prevention Best Practices

#### File organization:
```
project/
├── diagrams/          # Input files
├── exports/           # Output files
├── backups/           # Version control
└── logs/             # Error logs
```

#### Regular maintenance:
- Keep Node.js and npm updated
- Clear npm cache monthly
- Backup working configurations
- Test converters with sample files after updates

#### Quality assurance:
- Validate all input files before batch conversion
- Test converted files in Draw.io immediately
- Maintain conversion logs for troubleshooting
- Use version control for diagram files</content>
<parameter name="filePath">/Users/disandup/Desktop/Final Converter Improved /Untitled/Guidelines/Troubleshooting-Guide.md
