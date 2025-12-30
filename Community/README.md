# Community

Welcome to the Mermaid to Draw.io Converter community! This folder contains all the resources you need to contribute to, learn about, and engage with our project community.

## Getting Started

### Ways to Contribute

1. **Code Contributions**: Submit pull requests with bug fixes, new features, or improvements
2. **Documentation**: Help improve our documentation, tutorials, and guides
3. **Testing**: Report bugs, test new features, or help with automated testing
4. **Community Support**: Help answer questions in discussions and issues
5. **Feature Requests**: Suggest new features and improvements
6. **Translations**: Help translate documentation and UI elements

### First Steps

1. **Read our Code of Conduct** - Understand our community standards
2. **Check the Contributing Guide** - Learn how to contribute effectively
3. **Join our Discussions** - Introduce yourself and ask questions
4. **Explore Open Issues** - Find ways to help with current work
5. **Set up your development environment** - Get ready to contribute code

## Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to a positive environment:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any instances of unacceptable behavior.

### Scope

This Code of Conduct applies within all community spaces, and also applies when an individual is officially representing the community in public spaces.

### Reporting

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at [conduct@mermaid-converter.com](mailto:conduct@mermaid-converter.com).

## Contributing Guide

### Development Setup

#### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Git
- Docker (optional, for containerized development)

#### Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/mermaid-converter.git
cd mermaid-converter

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

#### Docker Development

```bash
# Build development container
docker build -t mermaid-converter-dev .

# Run with hot reload
docker run -p 3000:3000 -v $(pwd):/app mermaid-converter-dev
```

### Contribution Workflow

#### 1. Choose an Issue

- Check our [GitHub Issues](https://github.com/your-org/mermaid-converter/issues) for open tasks
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

#### 2. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

#### 3. Make Changes

- Write clear, concise commit messages
- Follow our coding standards (see below)
- Add tests for new features
- Update documentation as needed

#### 4. Test Your Changes

```bash
# Run the full test suite
npm test

# Run linting
npm run lint

# Run type checking (if applicable)
npm run type-check

# Test manually in browser
npm run dev
```

#### 5. Submit a Pull Request

- Push your branch to GitHub
- Create a Pull Request with a clear description
- Reference any related issues
- Wait for review and address feedback

### Coding Standards

#### JavaScript/TypeScript

```javascript
// Use ES6+ features
const arrowFunction = (param) => {
  // Use const/let instead of var
  const result = param * 2;
  return result;
};

// Use descriptive variable names
const userDiagramCount = getDiagramCount(userId);

// Use async/await for asynchronous code
async function convertDiagram(diagram) {
  try {
    const result = await converter.convert(diagram);
    return result;
  } catch (error) {
    console.error('Conversion failed:', error);
    throw error;
  }
}
```

#### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use camelCase for variables and functions
- Use PascalCase for classes and components
- Maximum line length: 100 characters

#### Commit Messages

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(converter): add support for Sankey diagrams

fix(api): resolve memory leak in batch processing

docs(readme): update installation instructions
```

### Testing Guidelines

#### Unit Tests

```javascript
// Use descriptive test names
describe('DiagramConverter', () => {
  describe('convert()', () => {
    it('should convert simple flowchart to Draw.io format', () => {
      const input = 'flowchart TD\nA --> B';
      const result = converter.convert(input);

      expect(result).toContain('<mxfile>');
      expect(result).toContain('A');
      expect(result).toContain('B');
    });

    it('should handle invalid input gracefully', () => {
      expect(() => {
        converter.convert('');
      }).toThrow('Invalid diagram input');
    });
  });
});
```

#### Integration Tests

```javascript
// Test full conversion pipeline
describe('Conversion Pipeline', () => {
  it('should process diagram from API to storage', async () => {
    const diagram = 'flowchart TD\nA --> B --> C';

    // Make API request
    const response = await request(app)
      .post('/api/v3/convert')
      .send({ mermaid: diagram })
      .expect(200);

    // Verify response
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();

    // Verify storage
    const savedDiagram = await Diagram.findOne({ input: diagram });
    expect(savedDiagram).toBeDefined();
    expect(savedDiagram.output).toBe(response.body.data);
  });
});
```

#### Performance Tests

```javascript
// Test conversion performance
describe('Performance Tests', () => {
  it('should convert large diagram within time limit', async () => {
    const largeDiagram = generateLargeDiagram(1000); // 1000 nodes

    const startTime = Date.now();
    const result = await converter.convert(largeDiagram);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(5000); // 5 seconds max
    expect(result).toBeDefined();
  });
});
```

### Documentation Standards

#### README Files

Every component should have a README.md with:

```markdown
# Component Name

Brief description of what this component does.

## Installation

```bash
npm install component-name
```

## Usage

```javascript
const component = require('component-name');

// Basic usage example
component.doSomething();
```

## API Reference

### `doSomething(param)`

Description of what this function does.

**Parameters:**
- `param` (string): Description of parameter

**Returns:** Description of return value

**Example:**
```javascript
const result = component.doSomething('example');
console.log(result); // 'example processed'
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.
```

#### Code Comments

```javascript
/**
 * Converts a Mermaid diagram to Draw.io format
 * @param {string} mermaid - The Mermaid diagram source
 * @param {Object} options - Conversion options
 * @param {string} options.format - Output format ('drawio', 'xml', 'json')
 * @param {boolean} options.validate - Whether to validate input
 * @returns {Promise<string>} The converted diagram
 * @throws {ValidationError} When input validation fails
 * @throws {ConversionError} When conversion fails
 */
async function convertDiagram(mermaid, options = {}) {
  // Validate input
  if (!mermaid || typeof mermaid !== 'string') {
    throw new ValidationError('Invalid mermaid input');
  }

  // Set default options
  const config = {
    format: 'drawio',
    validate: true,
    ...options
  };

  // Conversion logic here...
}
```

## Community Resources

### Communication Channels

#### GitHub Discussions
- **Q&A**: Ask questions and get help from the community
- **Show and Tell**: Share your projects and use cases
- **Ideas**: Discuss new features and improvements
- **General**: Off-topic discussions

#### Discord Server
- Real-time chat for developers
- Voice channels for community calls
- Bot commands for quick help
- Integration with GitHub notifications

#### Twitter
- Project updates and announcements
- Community highlights
- Quick tips and tricks

### Learning Resources

#### Documentation
- [Official Documentation](https://docs.mermaid-converter.com)
- [API Reference](https://api.mermaid-converter.com)
- [Video Tutorials](https://youtube.com/mermaid-converter)

#### Community Content
- [Blog Posts](https://blog.mermaid-converter.com)
- [Case Studies](https://case-studies.mermaid-converter.com)
- [Community Wiki](https://wiki.mermaid-converter.com)

#### External Resources
- [Mermaid.js Documentation](https://mermaid.js.org)
- [Draw.io Documentation](https://www.diagrams.net/doc/)
- [Diagram Best Practices](https://diagrams.example.com)

### Events and Meetups

#### Virtual Meetups
- Monthly community calls (first Thursday of each month)
- Workshop sessions for contributors
- AMA (Ask Me Anything) sessions with maintainers

#### Conferences
- Speaking at diagram and visualization conferences
- Booth presence at developer conferences
- Sponsoring diagram-related events

#### Hackathons
- Regular hackathons focused on diagram tools
- Student-focused events
- Corporate team building events

## Governance

### Project Maintainers

The project is maintained by a team of core contributors who have been granted write access to the repository. Maintainers are responsible for:

- Reviewing and merging pull requests
- Managing issues and feature requests
- Releasing new versions
- Ensuring code quality and security
- Community management

#### Current Maintainers

- **Alice Johnson** (Project Lead) - [@alice-github](https://github.com/alice-github)
- **Bob Smith** (Technical Lead) - [@bob-github](https://github.com/bob-github)
- **Carol Williams** (Community Manager) - [@carol-github](https://github.com/carol-github)

### Decision Making

#### RFC Process

For significant changes, we use a Request for Comments (RFC) process:

1. **Draft RFC**: Create a detailed proposal in the `rfcs/` directory
2. **Community Review**: Open for community feedback (2 weeks)
3. **Maintainer Review**: Core team reviews and discusses
4. **Final Decision**: Approved, rejected, or revised
5. **Implementation**: Changes are implemented based on RFC

#### Voting

For important decisions, maintainers vote using:
- +1: Approve
- -1: Block (with detailed reasoning)
- 0: Abstain

Decisions require majority approval from maintainers.

### Code Review Process

#### Review Requirements

- At least 1 maintainer approval required
- All CI checks must pass
- No outstanding review comments
- Tests added for new features
- Documentation updated

#### Review Guidelines

**Reviewers should check for:**
- Code correctness and security
- Test coverage and quality
- Performance implications
- Documentation completeness
- Adherence to coding standards

**Authors should:**
- Address all review comments
- Explain complex changes
- Provide context for design decisions
- Test changes thoroughly

### Release Process

#### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

#### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog written
- [ ] Version number updated
- [ ] Release notes prepared
- [ ] CI/CD pipeline passes
- [ ] Security review completed
- [ ] Community announcement prepared

#### Release Cadence

- **Patch releases**: As needed (weekly)
- **Minor releases**: Monthly
- **Major releases**: Quarterly or when breaking changes are needed

## Recognition and Rewards

### Contributor Recognition

#### Badges and Titles

Contributors earn badges based on their contributions:

- **First PR**: 🎉 First contribution
- **Bug Hunter**: 🐛 Found and fixed bugs
- **Feature Champion**: ⭐ Implemented major features
- **Documentation Hero**: 📚 Improved documentation
- **Community Helper**: 💬 Helped community members
- **Maintainer**: 🛠️ Core team member

#### Hall of Fame

Top contributors are featured in our Hall of Fame:
- Most commits in a quarter
- Most issues resolved
- Most helpful community responses
- Most innovative features

### Rewards Program

#### GitHub Sponsors

Support the project financially:
- Individual sponsors: $5/month
- Organization sponsors: $50/month+

#### Swag and Perks

Contributors get access to:
- Exclusive Discord channels
- Early access to features
- Project-branded swag
- Conference tickets
- Priority support

#### Bounties

Feature requests and bug fixes can have bounties:
- Paid in cryptocurrency or platform credits
- Posted in GitHub issues with 💰 label
- Claimed by implementing the feature

## Getting Help

### Where to Ask Questions

1. **GitHub Issues**: For bugs and feature requests
2. **GitHub Discussions**: For questions and general discussion
3. **Discord**: For real-time help
4. **Stack Overflow**: Tag with `mermaid-converter`

### Support Tiers

#### Community Support
- Free support through community channels
- Response within 48 hours
- Best effort basis

#### Priority Support
- For GitHub Sponsors ($10/month)
- Response within 24 hours
- Direct maintainer access

#### Enterprise Support
- For organizations ($100/month)
- Response within 4 hours
- Phone/video support
- Custom feature development

### Issue Reporting

When reporting issues, please include:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows]
 - Browser: [e.g. Chrome, Safari]
 - Version: [e.g. 1.2.3]

**Additional context**
Add any other context about the problem here.
```

## Community Statistics

### Project Metrics

- **Stars**: 2,500+
- **Forks**: 300+
- **Contributors**: 150+
- **Downloads**: 50,000+/month
- **Active Users**: 10,000+

### Community Growth

- **GitHub Issues**: 500+ opened, 450+ closed
- **Pull Requests**: 300+ merged
- **Discussions**: 200+ threads
- **Discord Members**: 800+
- **Twitter Followers**: 1,200+

### Diversity and Inclusion

We're committed to building a diverse and inclusive community:

- **Geographic Diversity**: Contributors from 40+ countries
- **Gender Balance**: ~45% women contributors
- **Experience Levels**: From students to senior developers
- **Background Diversity**: Academic, corporate, freelance

## Code of Conduct Enforcement

### Reporting Violations

To report a Code of Conduct violation:

1. **Email**: Send details to [conduct@mermaid-converter.com](mailto:conduct@mermaid-converter.com)
2. **Anonymous Form**: Use our anonymous reporting form
3. **Direct Message**: Contact a maintainer privately

### Investigation Process

1. **Acknowledgment**: We'll acknowledge receipt within 24 hours
2. **Investigation**: Review evidence and interview involved parties
3. **Decision**: Determine if violation occurred
4. **Action**: Apply appropriate consequences
5. **Follow-up**: Communicate outcome to reporter

### Consequences

Consequences for violations include:

- **Warning**: Private warning with clear expectations
- **Temporary Ban**: Suspension from community spaces
- **Permanent Ban**: Removal from all community spaces
- **Legal Action**: For severe violations

### Appeals Process

If you disagree with a moderation decision:

1. **Contact**: Email [appeals@mermaid-converter.com](mailto:appeals@mermaid-converter.com)
2. **Details**: Provide reasoning and evidence
3. **Review**: Appeal will be reviewed by independent maintainers
4. **Decision**: Final decision within 7 days

## Thank You

Thank you for being part of our community! Your contributions, whether code, documentation, support, or ideas, make this project better for everyone.

Remember: **Be excellent to each other**. Let's build something amazing together! 🚀
