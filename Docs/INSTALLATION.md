# Installation Guide

This guide will help you install and set up the Mermaid to Draw.io converter on your system.

## Prerequisites

Before installing the converter, ensure you have the following:

### System Requirements
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 7.0.0 or higher (comes with Node.js)
- **Operating System**: macOS, Windows, or Linux
- **Memory**: At least 512MB RAM (1GB recommended)
- **Storage**: 500MB free space for dependencies

### Browser Dependencies
The converter uses Playwright for browser automation. The following browsers will be installed automatically:
- Chromium
- Firefox
- WebKit (Safari)

## Installation Methods

### Method 1: NPM Global Installation (Recommended)

Install globally to use from anywhere:

```bash
npm install -g mermaid-to-drawio
```

Verify installation:
```bash
mermaid-to-drawio --version
```

### Method 2: Local Installation

Clone the repository and install locally:

```bash
git clone https://github.com/yourusername/mermaid-to-drawio.git
cd mermaid-to-drawio
npm install
```

### Method 3: Manual Download

1. Download the latest release from GitHub
2. Extract the archive
3. Navigate to the extracted directory
4. Run `npm install`

## Post-Installation Setup

### Install Playwright Browsers

The converter requires browser binaries for diagram rendering:

```bash
npx playwright install
```

This will download and install:
- Chromium
- Firefox
- WebKit

### Verify Installation

Test the installation with a simple conversion:

```bash
echo "graph TD; A-->B;" > test.mmd
node converter.js test.mmd test.drawio
```

If successful, you should see a `test.drawio` file created.

## Platform-Specific Instructions

### macOS

#### Using Homebrew
```bash
brew install node
npm install -g mermaid-to-drawio
```

#### Manual Installation
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install the package
3. Follow the general installation steps

### Windows

#### Using Chocolatey
```bash
choco install nodejs
npm install -g mermaid-to-drawio
```

#### Manual Installation
1. Download the Windows installer from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Open Command Prompt or PowerShell
4. Follow the general installation steps

### Linux

#### Using Package Manager (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm
npm install -g mermaid-to-drawio
```

#### Using Package Manager (CentOS/RHEL)
```bash
sudo yum install nodejs npm
npm install -g mermaid-to-drawio
```

#### Manual Installation
1. Download the Linux binaries from [nodejs.org](https://nodejs.org/)
2. Extract and install
3. Follow the general installation steps

## Troubleshooting Installation

### Node.js Version Issues
If you encounter version errors:

```bash
node --version
npm --version
```

Update Node.js if necessary:
```bash
# Using nvm (recommended)
nvm install node
nvm use node

# Or download latest version from nodejs.org
```

### Permission Errors
On Linux/macOS, if you get permission errors:

```bash
# For global installation
sudo npm install -g mermaid-to-drawio

# Or fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Playwright Installation Issues
If browser installation fails:

```bash
# Manual browser installation
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

For corporate environments behind proxies:
```bash
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
npx playwright install
```

### Antivirus Interference
Some antivirus software may block Playwright downloads. Temporarily disable antivirus during installation.

## Updating the Converter

To update to the latest version:

```bash
# If installed globally
npm update -g mermaid-to-drawio

# If installed locally
cd mermaid-to-drawio
git pull
npm install
```

## Uninstalling

To remove the converter:

```bash
# Global uninstall
npm uninstall -g mermaid-to-drawio

# Local uninstall
cd mermaid-to-drawio
rm -rf node_modules
rm package-lock.json
```

## Next Steps

After installation, check out:
- [Usage Examples](../Assets/EXAMPLES.md) - Learn how to use the converter
- [Configuration Guide](CONFIGURATION.md) - Customize the converter
- [Troubleshooting Guide](../Assets/TROUBLESHOOTING.md) - Solve common issues
