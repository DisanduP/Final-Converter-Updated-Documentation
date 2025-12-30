# Configuration Guide

Learn how to configure the Mermaid to Draw.io converter for your specific needs.

## Configuration Methods

### Command Line Options

The converter supports various command-line options:

```bash
node converter.js [options] <input> <output>
```

#### Basic Options
- `-h, --help`: Display help information
- `-v, --version`: Display version number
- `--verbose`: Enable verbose output
- `--quiet`: Suppress non-error output

#### Conversion Options
- `--format <type>`: Output format (default: drawio)
  - `drawio`: Draw.io XML format
  - `svg`: Scalable Vector Graphics
  - `png`: Portable Network Graphics
- `--theme <theme>`: Mermaid theme (default: default)
  - `default`, `dark`, `forest`, `neutral`
- `--width <pixels>`: Diagram width (default: auto)
- `--height <pixels>`: Diagram height (default: auto)

#### Advanced Options
- `--timeout <ms>`: Conversion timeout in milliseconds (default: 30000)
- `--retries <count>`: Number of retry attempts (default: 3)
- `--browser <browser>`: Browser to use (default: chromium)
  - `chromium`, `firefox`, `webkit`
- `--headless`: Run browser in headless mode (default: true)

### Configuration File

Create a `.mermaid2drawiorc` file in your project root:

```json
{
  "theme": "dark",
  "format": "drawio",
  "timeout": 45000,
  "browser": "chromium",
  "width": 1200,
  "height": 800,
  "verbose": false
}
```

### Environment Variables

Set environment variables for global configuration:

```bash
export MERMAID_THEME=dark
export MERMAID_FORMAT=drawio
export MERMAID_TIMEOUT=45000
export MERMAID_BROWSER=chromium
export MERMAID_WIDTH=1200
export MERMAID_HEIGHT=800
```

## Theme Configuration

### Built-in Themes

#### Default Theme
```json
{
  "theme": "default"
}
```

#### Dark Theme
```json
{
  "theme": "dark"
}
```

#### Forest Theme
```json
{
  "theme": "forest"
}
```

#### Neutral Theme
```json
{
  "theme": "neutral"
}
```

### Custom Themes

Create custom themes by extending existing ones:

```json
{
  "theme": "default",
  "themeVariables": {
    "primaryColor": "#ff0000",
    "primaryTextColor": "#ffffff",
    "primaryBorderColor": "#cc0000",
    "lineColor": "#ff0000",
    "secondaryColor": "#ffff00",
    "tertiaryColor": "#00ff00"
  }
}
```

## Output Configuration

### Draw.io Format Options

```json
{
  "drawio": {
    "compressed": true,
    "border": 10,
    "background": "#ffffff",
    "grid": true,
    "guides": true
  }
}
```

### Image Format Options

```json
{
  "image": {
    "quality": 90,
    "background": "transparent",
    "scale": 2
  }
}
```

## Browser Configuration

### Browser Selection

```json
{
  "browser": {
    "name": "chromium",
    "headless": true,
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  }
}
```

### Performance Tuning

```json
{
  "performance": {
    "maxConcurrency": 4,
    "memoryLimit": "1GB",
    "timeout": 30000
  }
}
```

## Diagram-Specific Configuration

### Flowchart Options

```json
{
  "flowchart": {
    "useMaxWidth": true,
    "htmlLabels": true,
    "curve": "basis"
  }
}
```

### Sequence Diagram Options

```json
{
  "sequence": {
    "mirrorActors": false,
    "bottomMarginAdj": 10,
    "showSequenceNumbers": false
  }
}
```

### Gantt Chart Options

```json
{
  "gantt": {
    "titleTopMargin": 25,
    "barHeight": 20,
    "barGap": 4,
    "topPadding": 50,
    "leftPadding": 75,
    "gridLineStartPadding": 35,
    "fontSize": 11,
    "fontFamily": "Arial",
    "numberSectionStyles": 4
  }
}
```

## Advanced Configuration

### Custom CSS

Add custom CSS for diagram styling:

```json
{
  "css": ".node { fill: #f9f9f9; } .edge { stroke: #333; }"
}
```

### Plugin Configuration

Enable and configure plugins:

```json
{
  "plugins": [
    {
      "name": "custom-exporter",
      "enabled": true,
      "options": {
        "format": "pdf",
        "quality": "high"
      }
    }
  ]
}
```

## Configuration Precedence

Configuration options are applied in this order (last wins):

1. Default values
2. Configuration file (`.mermaid2drawiorc`)
3. Environment variables
4. Command-line options

## Example Configurations

### Development Configuration

```json
{
  "theme": "dark",
  "verbose": true,
  "timeout": 60000,
  "browser": {
    "headless": false
  }
}
```

### Production Configuration

```json
{
  "theme": "default",
  "format": "drawio",
  "timeout": 30000,
  "performance": {
    "maxConcurrency": 8
  }
}
```

### CI/CD Configuration

```json
{
  "browser": {
    "args": [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  },
  "timeout": 45000,
  "retries": 5
}
```

## Validation

Validate your configuration:

```bash
node converter.js --validate-config .mermaid2drawiorc
```

## Resetting Configuration

To reset to defaults:

```bash
rm .mermaid2drawiorc
unset MERMAID_*
```
