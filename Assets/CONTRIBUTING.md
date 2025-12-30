# Contributing to Mermaid to Draw.io Converter Toolkit

## Ways to Contribute

### 🐛 Bug Reports
- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (OS, Node version, etc.)
- **Sample files** that demonstrate the issue

### ✨ Feature Requests
- **Use case description** - what problem are you trying to solve?
- **Proposed solution** - how should it work?
- **Alternatives considered** - other approaches you've thought about
- **Mock examples** - sample syntax or output

### 📖 Documentation Improvements
- **Guidelines updates** - new diagram patterns or best practices
- **Template additions** - useful starting points for common scenarios
- **FAQ updates** - common questions and solutions
- **Examples** - real-world use cases and tutorials

### 🛠️ Code Contributions
- **Converter improvements** - better error handling or performance
- **New diagram support** - additional Mermaid diagram types
- **Tool enhancements** - batch processing, validation, etc.
- **Integration features** - CI/CD, documentation tools

## Development Setup

### Prerequisites
- Node.js 14+ and npm
- Git for version control
- Basic knowledge of JavaScript and Mermaid

### Getting Started
```bash
# Fork and clone the repository
git clone https://github.com/your-username/Final-Converter.git
cd Final-Converter

# Install dependencies
npm install

# Test the toolkit
node converter.js -i sample_flowchart.mmd -o test.drawio
```

### Project Structure
```
├── converter.js              # Main flowchart converter
├── kanban-converter.js       # Kanban board converter
├── piechart-converter.js     # Pie chart converter
├── [other converters...]     # Additional diagram converters
├── Guidelines/               # User documentation
├── Templates/                # Starting templates
├── sample_*.mmd             # Example diagrams
└── package.json             # Dependencies
```

## Testing Your Changes

### Manual Testing
1. **Create test diagrams** with various complexity levels
2. **Test all converters** with your changes
3. **Verify output** in Draw.io (web and desktop)
4. **Check edge cases** - empty diagrams, special characters, large files

### Validation Checklist
- [ ] Syntax errors are handled gracefully
- [ ] Output files are valid Draw.io format
- [ ] Complex diagrams convert without crashes
- [ ] Error messages are helpful and actionable
- [ ] Performance is acceptable for typical use cases

### Cross-Platform Testing
- [ ] Windows 10/11
- [ ] macOS 12+
- [ ] Linux (Ubuntu/Debian)
- [ ] Different Node.js versions (14, 16, 18, 20)

## Code Style Guidelines

### JavaScript Standards
- **ES6+ features** are preferred
- **Async/await** over promises when appropriate
- **Descriptive variable names** - clarity over brevity
- **Comments** for complex logic
- **Error handling** with try/catch blocks

### Example Code Structure
```javascript
/**
 * Converts Mermaid flowchart to Draw.io format
 * @param {string} inputPath - Path to input .mmd file
 * @param {string} outputPath - Path to output .drawio file
 * @returns {Promise<boolean>} - Success status
 */
async function convertFlowchart(inputPath, outputPath) {
    try {
        // Input validation
        if (!inputPath || !outputPath) {
            throw new Error('Input and output paths are required');
        }

        // Conversion logic
        const mermaidContent = await readFile(inputPath);
        const drawioContent = await processMermaid(mermaidContent);
        await writeFile(outputPath, drawioContent);

        return true;
    } catch (error) {
        console.error('Conversion failed:', error.message);
        return false;
    }
}
```

## Documentation Standards

### README Updates
- **Clear descriptions** of new features
- **Usage examples** with actual commands
- **Screenshots/diagrams** when helpful
- **Troubleshooting notes** for common issues

### Guideline Additions
- **Step-by-step instructions** for new diagram types
- **Best practices** based on real usage
- **Common pitfalls** and solutions
- **Advanced techniques** for power users

### Template Creation
- **Comprehensive examples** covering main use cases
- **Comments** explaining customization points
- **Styling examples** showing visual options
- **Validation notes** for syntax requirements

## Submitting Changes

### Commit Guidelines
- **Clear, descriptive messages** - what and why, not how
- **Atomic commits** - one logical change per commit
- **Reference issues** - use #123 for issue numbers
- **Test before committing** - ensure functionality works

### Example Commit Messages
```
feat: add support for state diagrams
fix: resolve memory leak in large flowchart conversion
docs: update kanban guidelines with new patterns
refactor: simplify error handling in converter.js
```

### Pull Request Process
1. **Fork the repository** and create a feature branch
2. **Make your changes** following the guidelines above
3. **Test thoroughly** - manual and automated testing
4. **Update documentation** if needed
5. **Submit a pull request** with clear description
6. **Respond to feedback** and make requested changes

### Pull Request Template
```markdown
## Description
Brief description of the changes and why they're needed.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested on Windows/macOS/Linux
- [ ] Verified with sample diagrams
- [ ] Checked edge cases
- [ ] Performance acceptable

## Screenshots (if applicable)
Add screenshots of new features or UI changes.

## Additional Notes
Any additional context or considerations.
```

## Issue Reporting

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Run command '....'
3. See error

**Expected behavior**
A clear description of what you expected to happen.

**Environment**
- OS: [e.g., Windows 10]
- Node.js version: [e.g., 18.17.0]
- Toolkit version: [e.g., latest]

**Additional context**
Add any other context about the problem here.
```

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Community Guidelines

### Communication
- **Be respectful** and constructive in all interactions
- **Help others** when you can - share knowledge and solutions
- **Stay on topic** - use appropriate channels for discussions
- **Provide context** - explain your setup and goals

### Recognition
Contributors are recognized through:
- **GitHub contributor statistics**
- **Changelog entries** for significant contributions
- **Social media mentions** for major features
- **Community shoutouts** in releases

### Getting Help
- **Check existing issues** before creating new ones
- **Search documentation** - Guidelines/ folder has extensive docs
- **Use discussions** for questions and help
- **Join community** - connect with other users and contributors

## Recognition

We appreciate all contributions, big and small! Contributors may be featured in:
- Release notes and changelogs
- Contributor acknowledgments
- Community spotlights
- Documentation credits

Thank you for helping make the Mermaid to Draw.io Converter Toolkit better for everyone! 🎉
