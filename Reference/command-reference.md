# Command Reference

This document provides a comprehensive reference for all command-line options and usage patterns of the Mermaid to Draw.io converter.

## Basic Usage

```bash
mermaid-to-drawio [options] <input> [output]
```

## Command-Line Options

### Input/Output Options

- `<input>` - Path to input Mermaid file (.mmd) or stdin
- `[output]` - Path for output Draw.io file (.drawio) or stdout

### General Options

- `-h, --help` - Display help information and exit
- `-v, --version` - Display version number and exit
- `--verbose` - Enable verbose output mode
- `--quiet` - Suppress non-error output
- `--silent` - Suppress all output except errors

### Conversion Options

- `-f, --format <format>` - Output format
  - `drawio` (default) - Draw.io XML format
  - `svg` - Scalable Vector Graphics
  - `png` - Portable Network Graphics
- `-t, --theme <theme>` - Mermaid theme
  - `default` - Default theme
  - `dark` - Dark theme
  - `forest` - Forest theme
  - `neutral` - Neutral theme
- `--width <pixels>` - Diagram width in pixels (default: auto)
- `--height <pixels>` - Diagram height in pixels (default: auto)
- `--scale <factor>` - Scale factor for raster outputs (default: 1)

### Browser Options

- `-b, --browser <browser>` - Browser to use for rendering
  - `chromium` (default) - Google Chromium
  - `firefox` - Mozilla Firefox
  - `webkit` - WebKit (Safari)
- `--headless` - Run browser in headless mode (default: true)
- `--no-headless` - Run browser with visible window
- `--browser-args <args>` - Additional browser arguments (comma-separated)

### Performance Options

- `-c, --concurrency <number>` - Number of concurrent conversions (default: 1)
- `--timeout <milliseconds>` - Conversion timeout (default: 30000)
- `--retries <number>` - Number of retry attempts (default: 3)
- `--memory-limit <size>` - Memory limit (e.g., "512MB", "1GB")

### Input Processing Options

- `--input-format <format>` - Force input format
  - `auto` (default) - Auto-detect
  - `mermaid` - Standard Mermaid
  - `mmd` - Mermaid with frontmatter
- `--validate-input` - Validate input before conversion
- `--strict-mode` - Enable strict validation mode

### Output Options

- `-o, --output-dir <directory>` - Output directory for batch operations
- `--overwrite` - Overwrite existing output files
- `--no-overwrite` - Skip existing files (default)
- `--backup` - Create backup of existing files
- `--compress` - Compress output files
- `--pretty-print` - Pretty-print XML output

### Logging Options

- `-l, --log-level <level>` - Set logging level
  - `error` - Errors only
  - `warn` - Warnings and errors
  - `info` (default) - Info, warnings, and errors
  - `debug` - Debug information
  - `trace` - Detailed trace information
- `--log-file <file>` - Log to file instead of console
- `--no-color` - Disable colored output
- `--json-logs` - Output logs in JSON format

### Configuration Options

- `--config <file>` - Load configuration from file
- `--no-config` - Ignore default configuration files
- `--save-config <file>` - Save current configuration to file
- `--reset-config` - Reset to default configuration

## Usage Examples

### Basic Conversion

```bash
# Convert single file
mermaid-to-drawio diagram.mmd diagram.drawio

# Convert to different format
mermaid-to-drawio diagram.mmd diagram.svg

# Use stdin/stdout
cat diagram.mmd | mermaid-to-drawio - diagram.drawio
mermaid-to-drawio diagram.mmd - > diagram.drawio
```

### Batch Conversion

```bash
# Convert all .mmd files in current directory
mermaid-to-drawio --concurrency 4 *.mmd

# Convert with custom output directory
mermaid-to-drawio --output-dir ./output *.mmd

# Convert recursively
find . -name "*.mmd" -exec mermaid-to-drawio {} \;
```

### Advanced Options

```bash
# Use dark theme with custom size
mermaid-to-drawio --theme dark --width 1200 --height 800 diagram.mmd output.drawio

# Debug mode with verbose output
mermaid-to-drawio --verbose --log-level debug diagram.mmd output.drawio

# Use Firefox with custom arguments
mermaid-to-drawio --browser firefox --browser-args "--no-sandbox,--disable-gpu" diagram.mmd output.drawio

# Convert with timeout and retries
mermaid-to-drawio --timeout 60000 --retries 5 diagram.mmd output.drawio
```

### Configuration Management

```bash
# Save current settings
mermaid-to-drawio --save-config my-config.json

# Load custom configuration
mermaid-to-drawio --config my-config.json diagram.mmd output.drawio

# Reset to defaults
mermaid-to-drawio --reset-config
```

## Environment Variables

The converter respects the following environment variables:

- `MERMAID_CONVERTER_THEME` - Default theme
- `MERMAID_CONVERTER_BROWSER` - Default browser
- `MERMAID_CONVERTER_TIMEOUT` - Default timeout
- `MERMAID_CONVERTER_LOG_LEVEL` - Default log level
- `MERMAID_CONVERTER_CONFIG` - Default config file path
- `MERMAID_CONVERTER_CACHE_DIR` - Cache directory
- `PLAYWRIGHT_BROWSERS_PATH` - Playwright browsers path

## Configuration Files

The converter looks for configuration files in this order:

1. `./.mermaid2drawiorc` (current directory)
2. `~/.mermaid2drawiorc` (home directory)
3. `~/.config/mermaid-to-drawio/config.json`
4. `/etc/mermaid-to-drawio/config.json`

### Configuration File Format (JSON)

```json
{
  "theme": "dark",
  "browser": "chromium",
  "timeout": 30000,
  "concurrency": 4,
  "logLevel": "info",
  "output": {
    "format": "drawio",
    "overwrite": false,
    "compress": false
  },
  "browserOptions": {
    "headless": true,
    "args": ["--no-sandbox"]
  }
}
```

### Configuration File Format (YAML)

```yaml
theme: dark
browser: chromium
timeout: 30000
concurrency: 4
logLevel: info

output:
  format: drawio
  overwrite: false
  compress: false

browserOptions:
  headless: true
  args:
    - --no-sandbox
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - File not found
- `4` - Permission denied
- `5` - Conversion failed
- `6` - Timeout
- `7` - Browser error
- `8` - Memory limit exceeded
- `9` - Configuration error

## File Patterns

### Input Files

- `*.mmd` - Mermaid diagram files
- `*.mermaid` - Alternative Mermaid extension
- `*.txt` - Plain text with Mermaid content
- `-` - Read from stdin

### Output Files

- `*.drawio` - Draw.io XML files
- `*.svg` - SVG vector graphics
- `*.png` - PNG raster graphics
- `-` - Write to stdout

## Wildcard Support

The converter supports shell wildcards for batch processing:

```bash
# All Mermaid files
mermaid-to-drawio *.mmd

# Specific patterns
mermaid-to-drawio flowchart-*.mmd
mermaid-to-drawio **/*.mmd

# Exclude patterns
mermaid-to-drawio *.mmd --exclude "*test*"
```

## Piping and Redirection

### Input Piping

```bash
# From another command
echo "graph TD; A-->B;" | mermaid-to-drawio - output.drawio

# From file via cat
cat diagram.mmd | mermaid-to-drawio - output.drawio

# From curl
curl https://example.com/diagram.mmd | mermaid-to-drawio - output.drawio
```

### Output Redirection

```bash
# To file
mermaid-to-drawio diagram.mmd output.drawio

# To stdout
mermaid-to-drawio diagram.mmd -

# To another command
mermaid-to-drawio diagram.mmd - | gzip > diagram.drawio.gz
```

## Advanced Usage Patterns

### Watch Mode

```bash
# Watch for file changes (requires fswatch or similar)
fswatch -o *.mmd | xargs -n1 -I{} mermaid-to-drawio {}

# With inotifywait (Linux)
while inotifywait -e modify *.mmd; do
  mermaid-to-drawio *.mmd
done
```

### Integration with Build Tools

#### Make

```makefile
.PHONY: convert clean

convert:
	find . -name "*.mmd" -exec mermaid-to-drawio {} \;

clean:
	rm -f *.drawio

watch:
	fswatch -o *.mmd | xargs -n1 make convert
```

#### Package.json Scripts

```json
{
  "scripts": {
    "convert": "mermaid-to-drawio *.mmd",
    "convert:watch": "fswatch -o *.mmd | xargs -n1 npm run convert",
    "clean": "rm -f *.drawio"
  }
}
```

### Docker Usage

```bash
# Run in Docker
docker run --rm -v $(pwd):/data mermaid-converter *.mmd

# With custom configuration
docker run --rm -v $(pwd):/data -e MERMAID_CONVERTER_THEME=dark mermaid-converter diagram.mmd
```

## Troubleshooting

### Common Command Issues

**"Command not found"**
```bash
# Check if installed globally
which mermaid-to-drawio

# Install globally
npm install -g mermaid-to-drawio

# Or use npx
npx mermaid-to-drawio --help
```

**"Permission denied"**
```bash
# Fix permissions
chmod +x $(which mermaid-to-drawio)

# Or reinstall
npm uninstall -g mermaid-to-drawio
npm install -g mermaid-to-drawio
```

**"Browser not found"**
```bash
# Install browsers
npx playwright install

# Specify browser path
export PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers
```

### Debug Commands

```bash
# Verbose output
mermaid-to-drawio --verbose --log-level debug diagram.mmd output.drawio

# Test conversion without output
mermaid-to-drawio --dry-run diagram.mmd

# Validate input only
mermaid-to-drawio --validate-only diagram.mmd

# Show configuration
mermaid-to-drawio --show-config
```

## Performance Tuning

### Memory Optimization

```bash
# Limit memory usage
mermaid-to-drawio --memory-limit 512MB diagram.mmd output.drawio

# Use less memory for simple diagrams
mermaid-to-drawio --browser-args "--memory-pressure-off" diagram.mmd output.drawio
```

### Speed Optimization

```bash
# Increase concurrency for batch processing
mermaid-to-drawio --concurrency 8 *.mmd

# Use faster browser
mermaid-to-drawio --browser chromium --browser-args "--disable-gpu,--no-sandbox" diagram.mmd output.drawio

# Reduce timeout for simple diagrams
mermaid-to-drawio --timeout 10000 diagram.mmd output.drawio
```

## Security Considerations

### Safe Usage

```bash
# Disable network access
mermaid-to-drawio --browser-args "--disable-web-security,--disable-features=VizDisplayCompositor" diagram.mmd output.drawio

# Use sandbox
mermaid-to-drawio --browser-args "--no-sandbox=false" diagram.mmd output.drawio

# Limit file access
mermaid-to-drawio --browser-args "--disable-file-system" diagram.mmd output.drawio
```

### Input Validation

```bash
# Enable strict validation
mermaid-to-drawio --strict-mode --validate-input diagram.mmd output.drawio

# Check file size
mermaid-to-drawio --max-file-size 10MB diagram.mmd output.drawio
```

## See Also

- [Installation Guide](../Docs/INSTALLATION.md) - How to install the converter
- [Configuration Guide](../Docs/CONFIGURATION.md) - Configuration options
- [Examples](../Assets/EXAMPLES.md) - Usage examples
- [Troubleshooting](../Assets/TROUBLESHOOTING.md) - Common issues and solutions
