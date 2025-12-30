# Error Codes Reference

This document provides a comprehensive reference for all error codes, messages, and troubleshooting steps for the Mermaid to Draw.io converter.

## Error Code Categories

### System Errors (1000-1999)

#### E1001: File Not Found
**Message:** `Input file not found: {filePath}`

**Description:** The specified input file does not exist or cannot be accessed.

**Causes:**
- Incorrect file path
- File was moved or deleted
- Permission issues
- Network drive disconnection

**Solutions:**
- Verify the file path is correct
- Check file permissions: `ls -la {filePath}`
- Ensure network drives are accessible
- Use absolute paths instead of relative paths

#### E1002: Permission Denied
**Message:** `Permission denied accessing file: {filePath}`

**Description:** The application lacks permission to read the input file or write to the output location.

**Causes:**
- Insufficient file permissions
- Running as wrong user
- File locked by another process

**Solutions:**
- Check file permissions: `chmod 644 {filePath}`
- Change ownership: `chown $USER {filePath}`
- Run with appropriate user permissions
- Close files in other applications

#### E1003: Directory Not Writable
**Message:** `Output directory not writable: {directory}`

**Description:** Cannot write to the specified output directory.

**Causes:**
- Directory doesn't exist
- No write permissions
- Disk full
- Directory is read-only

**Solutions:**
- Create directory: `mkdir -p {directory}`
- Fix permissions: `chmod 755 {directory}`
- Check disk space: `df -h`
- Verify filesystem is not read-only

#### E1004: Disk Full
**Message:** `Insufficient disk space for output file`

**Description:** Not enough disk space to create the output file.

**Causes:**
- Disk storage full
- Quota exceeded
- Temporary directory full

**Solutions:**
- Free up disk space
- Change output location
- Check quotas: `quota -v`
- Clear temporary files: `rm -rf /tmp/*`

### Configuration Errors (2000-2999)

#### E2001: Invalid Configuration
**Message:** `Invalid configuration option: {option}`

**Description:** A configuration option has an invalid value or format.

**Causes:**
- Typos in configuration files
- Unsupported values
- Malformed JSON/YAML

**Solutions:**
- Check configuration file syntax
- Verify option values against documentation
- Use `--validate-config` flag
- Reset to defaults: `--reset-config`

#### E2002: Missing Required Option
**Message:** `Required configuration option missing: {option}`

**Description:** A required configuration option is not provided.

**Causes:**
- Incomplete configuration
- Missing environment variables
- Outdated configuration format

**Solutions:**
- Add missing options to configuration
- Set required environment variables
- Update configuration to latest format
- Check documentation for required options

#### E2003: Configuration File Not Readable
**Message:** `Cannot read configuration file: {filePath}`

**Description:** The configuration file exists but cannot be read.

**Causes:**
- File corruption
- Encoding issues
- Permission problems

**Solutions:**
- Check file integrity
- Verify file encoding (should be UTF-8)
- Fix file permissions
- Recreate configuration file

### Input Validation Errors (3000-3999)

#### E3001: Invalid Mermaid Syntax
**Message:** `Invalid Mermaid syntax: {details}`

**Description:** The input Mermaid code contains syntax errors.

**Causes:**
- Typos in diagram code
- Unsupported Mermaid features
- Malformed diagram structure

**Solutions:**
- Validate syntax at [Mermaid Live Editor](https://mermaid.live)
- Check for common syntax errors
- Use provided templates as examples
- Enable strict mode for detailed errors

#### E3002: Unsupported Diagram Type
**Message:** `Unsupported diagram type: {type}`

**Description:** The diagram type is not supported by the converter.

**Causes:**
- Using unsupported Mermaid diagram types
- Custom diagram types
- Experimental features

**Solutions:**
- Check supported diagram types in documentation
- Convert to supported format
- Request support for new diagram types
- Use alternative conversion methods

#### E3003: Diagram Too Large
**Message:** `Diagram exceeds maximum size limit: {size} > {limit}`

**Description:** The input diagram is too large to process.

**Causes:**
- Very complex diagrams
- Large embedded content
- Memory constraints

**Solutions:**
- Simplify the diagram
- Split into smaller diagrams
- Increase memory limits
- Use batch processing for large sets

#### E3004: Empty Input
**Message:** `Input diagram is empty or contains no valid content`

**Description:** The input file or string is empty or contains no processable content.

**Causes:**
- Empty files
- Only comments or whitespace
- Invalid file format

**Solutions:**
- Verify input file contents
- Check for hidden characters
- Ensure correct file encoding
- Provide valid Mermaid code

### Browser Errors (4000-4999)

#### E4001: Browser Launch Failed
**Message:** `Failed to launch browser: {browser}`

**Description:** The browser could not be started for diagram rendering.

**Causes:**
- Browser not installed
- Missing dependencies
- System resource constraints
- Browser crashes

**Solutions:**
- Install browser: `npx playwright install`
- Check system resources (RAM, CPU)
- Update browser dependencies
- Try different browser: `--browser firefox`

#### E4002: Browser Timeout
**Message:** `Browser operation timed out after {timeout}ms`

**Description:** The browser took too long to render the diagram.

**Causes:**
- Complex diagrams
- Network issues
- System performance
- Browser hangs

**Solutions:**
- Increase timeout: `--timeout 60000`
- Simplify diagram
- Check system performance
- Restart browser processes

#### E4003: Browser Memory Error
**Message:** `Browser exceeded memory limit`

**Description:** The browser process used too much memory.

**Causes:**
- Large diagrams
- Memory leaks
- System memory constraints

**Solutions:**
- Increase memory limits
- Process smaller diagrams
- Free system memory
- Use browser memory optimization flags

#### E4004: Browser Crash
**Message:** `Browser process crashed during conversion`

**Description:** The browser process terminated unexpectedly.

**Causes:**
- System instability
- Browser bugs
- Resource exhaustion
- Corrupted browser installation

**Solutions:**
- Restart the conversion
- Update browser: `npx playwright install --force`
- Check system stability
- Use different browser

### Conversion Errors (5000-5999)

#### E5001: Conversion Failed
**Message:** `Diagram conversion failed: {details}`

**Description:** The conversion process failed for unspecified reasons.

**Causes:**
- Rendering errors
- Layout calculation failures
- Output generation errors

**Solutions:**
- Check detailed error logs
- Try with different options
- Simplify the diagram
- Report the issue with diagram sample

#### E5002: Layout Calculation Error
**Message:** `Failed to calculate diagram layout`

**Description:** The automatic layout algorithm failed.

**Causes:**
- Complex diagram structures
- Conflicting layout constraints
- Unsupported layout patterns

**Solutions:**
- Manually adjust diagram structure
- Use explicit positioning
- Break into sub-diagrams
- Check for layout conflicts

#### E5003: Rendering Error
**Message:** `Failed to render diagram elements`

**Description:** Some diagram elements could not be rendered.

**Causes:**
- Unsupported element types
- Font rendering issues
- Graphics rendering failures

**Solutions:**
- Check for unsupported elements
- Verify font availability
- Update graphics drivers
- Use simpler element types

#### E5004: Output Generation Error
**Message:** `Failed to generate output file`

**Description:** The final output file could not be created.

**Causes:**
- Output format issues
- File system errors
- Encoding problems

**Solutions:**
- Check output directory permissions
- Try different output formats
- Verify file system integrity
- Use different file paths

### Network Errors (6000-6999)

#### E6001: Network Timeout
**Message:** `Network request timed out`

**Description:** A network request (for CDN resources) timed out.

**Causes:**
- Slow internet connection
- Firewall blocking requests
- CDN service issues

**Solutions:**
- Check internet connection
- Configure proxy settings
- Allow CDN domains through firewall
- Use offline mode if available

#### E6002: CDN Unavailable
**Message:** `CDN resources unavailable: {url}`

**Description:** Required CDN resources could not be loaded.

**Causes:**
- Network connectivity issues
- CDN service outages
- Firewall restrictions

**Solutions:**
- Check network connectivity
- Verify CDN status
- Configure local resource serving
- Use cached resources

### Validation Errors (7000-7999)

#### E7001: Output Validation Failed
**Message:** `Generated output failed validation: {details}`

**Description:** The generated Draw.io file failed validation checks.

**Causes:**
- Conversion bugs
- Unsupported features
- Output corruption

**Solutions:**
- Enable validation: `--validate-output`
- Check for conversion warnings
- Report validation failures
- Use alternative conversion methods

#### E7002: Schema Validation Error
**Message:** `Output does not match Draw.io schema: {field}`

**Description:** The output XML doesn't conform to Draw.io's schema.

**Causes:**
- Schema changes
- Conversion errors
- Unsupported diagram features

**Solutions:**
- Update to latest version
- Check for schema updates
- Report schema issues
- Use compatible diagram types

## Error Handling Strategies

### Retry Logic

```javascript
async function convertWithRetry(mermaidCode, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await convert(mermaidCode);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

      console.log(`Attempt ${attempt} failed, retrying...`);
    }
  }
}
```

### Error Classification

```javascript
function classifyError(error) {
  if (error.code?.startsWith('E1')) return 'system';
  if (error.code?.startsWith('E2')) return 'configuration';
  if (error.code?.startsWith('E3')) return 'input';
  if (error.code?.startsWith('E4')) return 'browser';
  if (error.code?.startsWith('E5')) return 'conversion';
  if (error.code?.startsWith('E6')) return 'network';
  if (error.code?.startsWith('E7')) return 'validation';

  return 'unknown';
}
```

### Graceful Degradation

```javascript
async function convertWithFallback(mermaidCode) {
  const strategies = [
    { theme: 'default', browser: 'chromium' },
    { theme: 'default', browser: 'firefox' },
    { theme: 'neutral', browser: 'chromium' },
    { timeout: 60000, retries: 5 }
  ];

  for (const options of strategies) {
    try {
      return await convert(mermaidCode, options);
    } catch (error) {
      console.warn(`Strategy failed:`, options, error.message);
    }
  }

  throw new Error('All conversion strategies failed');
}
```

## Logging and Debugging

### Enable Debug Logging

```bash
# Command line
mermaid-to-drawio --verbose --log-level debug input.mmd output.drawio

# Environment variable
export MERMAID_CONVERTER_LOG_LEVEL=debug
```

### Log Analysis

```bash
# Search for specific errors
grep "E[0-9]" conversion.log

# Count error types
grep "E[0-9]" conversion.log | cut -d' ' -f3 | sort | uniq -c

# Find error patterns
grep "ERROR" conversion.log | tail -20
```

### Debug Mode

```javascript
const converter = new Converter({
  debug: true,
  logging: {
    level: 'trace',
    file: 'debug.log'
  }
});
```

## Common Error Patterns

### Memory Issues

**Symptoms:** OutOfMemoryError, browser crashes, slow performance

**Solutions:**
- Reduce diagram complexity
- Increase system memory
- Use `--memory-limit` option
- Process in smaller batches

### Timeout Issues

**Symptoms:** Conversion hangs, timeout errors

**Solutions:**
- Increase timeout values
- Simplify diagrams
- Check system performance
- Use faster browser settings

### File System Issues

**Symptoms:** Permission errors, file not found

**Solutions:**
- Check file permissions
- Use absolute paths
- Verify disk space
- Close conflicting applications

### Network Issues

**Symptoms:** CDN errors, slow downloads

**Solutions:**
- Check internet connectivity
- Configure proxy settings
- Allow required domains
- Use offline resources

## Error Reporting

### Bug Report Template

When reporting errors, please include:

1. **Error Code and Message**
2. **Input Diagram** (anonymized if sensitive)
3. **Command Used**
4. **System Information**
   - OS and version
   - Node.js version
   - Converter version
   - Browser versions
5. **Full Error Log**
6. **Steps to Reproduce**

### Diagnostic Commands

```bash
# System information
uname -a
node --version
npm --version

# Converter information
mermaid-to-drawio --version

# Browser information
npx playwright --version

# Disk space
df -h

# Memory information
free -h
```

## Prevention Strategies

### Input Validation

```javascript
function validateInput(mermaidCode) {
  // Check size
  if (mermaidCode.length > 100000) {
    throw new Error('Diagram too large');
  }

  // Check for potentially problematic content
  if (mermaidCode.includes('<script>')) {
    throw new Error('Potentially unsafe content detected');
  }

  // Validate basic syntax
  if (!mermaidCode.includes('graph ') && !mermaidCode.includes('sequenceDiagram')) {
    throw new Error('No valid diagram type detected');
  }
}
```

### Health Checks

```javascript
async function healthCheck() {
  try {
    // Test basic conversion
    await convert('graph TD; A-->B;');

    // Test browser availability
    const browser = await playwright.chromium.launch();
    await browser.close();

    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

### Monitoring

```javascript
const converter = new Converter();

converter.on('error', (error) => {
  // Log to monitoring system
  monitoring.captureException(error);

  // Send alert for critical errors
  if (error.code?.startsWith('E4') || error.code?.startsWith('E5')) {
    alerts.send('Conversion system error', error.message);
  }
});
```

## Recovery Procedures

### Automatic Recovery

```javascript
async function convertWithRecovery(mermaidCode) {
  try {
    return await convert(mermaidCode);
  } catch (error) {
    // Log the error
    logger.error('Conversion failed', error);

    // Attempt recovery based on error type
    if (error.code === 'E4001') {
      // Browser issue - try different browser
      return await convert(mermaidCode, { browser: 'firefox' });
    }

    if (error.code === 'E4002') {
      // Timeout - increase timeout
      return await convert(mermaidCode, { timeout: 60000 });
    }

    // If recovery fails, rethrow
    throw error;
  }
}
```

### Manual Recovery Steps

1. **Check System Resources**
   ```bash
   top
   free -h
   df -h
   ```

2. **Restart Services**
   ```bash
   # Kill hanging processes
   pkill -f mermaid-to-drawio

   # Restart browser processes
   pkill -f chromium
   ```

3. **Clear Caches**
   ```bash
   # Clear npm cache
   npm cache clean --force

   # Clear browser cache
   rm -rf ~/.cache/playwright
   ```

4. **Reinstall Dependencies**
   ```bash
   npm install
   npx playwright install --force
   ```

## See Also

- [Troubleshooting Guide](../Assets/TROUBLESHOOTING.md)
- [Command Reference](command-reference.md)
- [API Reference](api-reference.md)
- [Performance Guide](../Docs/PERFORMANCE.md)
