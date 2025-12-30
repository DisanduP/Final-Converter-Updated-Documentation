# Troubleshooting Guide

Common issues and solutions for the Mermaid to Draw.io converter.

## Installation Issues

### Playwright Browser Installation
If you encounter browser installation errors:

```bash
npx playwright install
```

### Permission Errors
On macOS/Linux, make sure the script has execute permissions:

```bash
chmod +x converter.js
```

## Conversion Issues

### Unsupported Diagram Syntax
**Error**: "Unsupported diagram type" or parsing errors

**Solution**:
- Check that your Mermaid syntax is valid
- Refer to the [Mermaid documentation](https://mermaid.js.org/)
- Use the provided templates as examples

### Browser Launch Failures
**Error**: "Browser launch failed" or timeout errors

**Solution**:
- Ensure Playwright browsers are installed: `npx playwright install`
- Check system resources (memory, CPU)
- Try running with `--no-sandbox` flag if on Linux

### File Access Errors
**Error**: "Cannot read/write file"

**Solution**:
- Check file permissions
- Ensure input file exists and is readable
- Ensure output directory is writable

## Performance Issues

### Slow Conversion
**Cause**: Large or complex diagrams

**Solutions**:
- Simplify the diagram structure
- Break large diagrams into smaller ones
- Increase system memory
- Use SSD storage for temporary files

### Memory Usage
**Cause**: Multiple large conversions

**Solutions**:
- Process files one at a time
- Close other applications
- Increase Node.js memory limit: `node --max-old-space-size=4096 converter.js`

## Output Issues

### Incorrect Layout
**Problem**: Elements positioned incorrectly in Draw.io

**Solutions**:
- Check Mermaid diagram syntax
- Ensure proper indentation
- Use explicit positioning in complex diagrams

### Missing Elements
**Problem**: Some diagram elements not converted

**Solutions**:
- Verify the diagram type is supported
- Check for syntax errors in Mermaid code
- Report unsupported features as issues

## Platform-Specific Issues

### macOS
- Ensure Xcode command line tools are installed
- Check Gatekeeper settings for unsigned applications

### Windows
- Run command prompt as Administrator
- Ensure antivirus software isn't blocking Playwright

### Linux
- Install required system dependencies
- Check for missing libraries (libnss, libatk, etc.)

## Getting Help

### Debug Mode
Run with verbose output:

```bash
DEBUG=* node converter.js input.mmd output.drawio
```

### Logs
Check the console output for detailed error messages and stack traces.

### Community Support
- Check existing GitHub issues
- Create a new issue with your error details
- Include your Mermaid input and system information

## Common Error Messages

### "Mermaid is not defined"
- Ensure Mermaid.js is loaded in the browser context
- Check internet connection for CDN resources

### "XML parsing error"
- Validate your Mermaid syntax
- Check for special characters that need escaping

### "Timeout exceeded"
- Increase timeout settings
- Simplify the diagram
- Check system performance
