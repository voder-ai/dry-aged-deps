# User Story Map: Node CLI Development & Publishing

## Purpose

A software developer wants to create a Node.js CLI tool and publish it to npm registry for others to install and use globally.

The goal is to build a robust, maintainable CLI that follows best practices and provides a great user experience.

## Context

Building a CLI involves more than just writing code:

- Project setup and configuration
- CLI-specific patterns (argument parsing, help text, error handling)
- Testing strategies for CLI tools
- Distribution and publishing workflows
- Maintenance and versioning

The developer needs to navigate the entire Software Development Life Cycle (SDLC) from conception to ongoing maintenance.

---

## High-Level SDLC Steps

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SETUP     │ -> │   DEVELOP   │ -> │    TEST     │ -> │   PUBLISH   │ -> │  MAINTAIN   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Step 1: Project Setup

**Value**: Establish foundation for CLI development

- Initialize Node.js project structure
- Configure package.json for CLI distribution
- Set up development tooling and scripts
- Establish project conventions and standards

### Step 2: Core Development

**Value**: Build the CLI functionality

- Implement argument parsing and command structure
- Build core business logic
- Add user-friendly output and error handling
- Create help documentation and usage examples

### Step 3: Testing & Quality

**Value**: Ensure reliability and maintainability

- Unit test core functionality
- Integration test CLI commands
- Test installation and global usage
- Code quality checks and linting

### Step 4: Publishing & Distribution

**Value**: Make CLI available to users

- Prepare for npm publishing
- Publish to npm registry
- Document installation and usage
- Set up versioning strategy

### Step 5: Maintenance & Growth

**Value**: Ongoing support and evolution

- Monitor usage and feedback
- Handle bug reports and feature requests
- Maintain compatibility and security
- Evolve based on user needs

---

## User Journey (Developer Perspective)

### What the Developer Experiences

**Step 1 - Setup**: "I need to bootstrap a CLI project"

```
Goal: Get from idea to runnable project
Tasks: npm init, configure CLI entry point, set up tooling
Output: Working local CLI that can be executed
```

**Step 2 - Development**: "I need to build the CLI functionality"

```
Goal: Implement the core features
Tasks: Parse args, implement commands, handle errors
Output: Feature-complete CLI with good UX
```

**Step 3 - Testing**: "I need to ensure quality and reliability"

```
Goal: Verify everything works correctly
Tasks: Write tests, test edge cases, validate installation
Output: Well-tested, robust CLI
```

**Step 4 - Publishing**: "I need to share this with the world"

```
Goal: Make CLI available via npm install -g
Tasks: Prepare package, publish to npm, document usage
Output: Publicly available CLI tool
```

**Step 5 - Maintenance**: "I need to support and evolve the CLI"

```
Goal: Keep CLI useful and current
Tasks: Fix bugs, add features, update dependencies
Output: Maintained, evolving tool with happy users
```

---

## First 3 Automations Per SDLC Step (WSJF Prioritized)

**Implementation Approach**: Proof-of-concept scripts using existing Node.js frameworks/tools rather than reinventing. Some automations marked as "won't do" due to chicken-and-egg problem.

### Step 1: Project Setup

**Most Frequent Pain Points to Automate**:

1. **npm init with CLI-optimized package.json** (bin entry, scripts, dependencies)
   - _Size: S | Business Value: High | Time Criticality: High | Risk Reduction: Medium | WSJF: 13_
   - **Status: WON'T DO** - Already done manually for dry-aged-deps
2. **bin/ directory creation** with executable entry point and proper shebang
   - _Size: XS | Business Value: High | Time Criticality: High | Risk Reduction: High | WSJF: 15_
   - **Status: WON'T DO** - Already done manually for dry-aged-deps
3. **Git repository initialization** (git init, .gitignore with node_modules, .env, etc.)
   - _Size: XS | Business Value: Medium | Time Criticality: Low | Risk Reduction: Medium | WSJF: 8_
   - **Status: WON'T DO** - Already done manually for dry-aged-deps

### Step 2: Core Development

**Most Frequent Pain Points to Automate**:

1. **Auto-formatting on save** (prettier integration with watch mode)
   - _Size: S | Business Value: High | Time Criticality: High | Risk Reduction: High | WSJF: 15_
   - **Status: DO** - Use VS Code settings + prettier extension
2. **Live linting feedback** (eslint with immediate error highlighting)
   - _Size: S | Business Value: High | Time Criticality: High | Risk Reduction: High | WSJF: 15_
   - **Status: DO** - Use VS Code ESLint extension
3. **Argument parsing boilerplate** (commander.js/yargs scaffolding generation)
   - _Size: M | Business Value: Medium | Time Criticality: Medium | Risk Reduction: Low | WSJF: 5_
   - **Status: MAYBE** - Could use plop.js for command generation

### Step 3: Testing & Quality

**Most Frequent Pain Points to Automate**:

1. **Test running on file changes** (vitest in watch mode with smart detection)
   - _Size: S | Business Value: High | Time Criticality: High | Risk Reduction: High | WSJF: 15_
   - **Status: DO** - Use vitest --watch built-in functionality
2. **CLI integration testing** (automated testing of actual CLI commands and output)
   - _Size: M | Business Value: High | Time Criticality: Medium | Risk Reduction: High | WSJF: 10_
   - **Status: DO** - Use execa + vitest for CLI testing
3. **Code coverage reporting** (automatic coverage collection and threshold enforcement)
   - _Size: S | Business Value: Medium | Time Criticality: Medium | Risk Reduction: Medium | WSJF: 9_
   - **Status: DO** - Use vitest --coverage built-in functionality

### Step 4: Publishing & Distribution

**Most Frequent Pain Points to Automate**:

1. **Semantic versioning** (automatic version bumping based on commit messages)
   - _Size: M | Business Value: Medium | Time Criticality: Low | Risk Reduction: High | WSJF: 6_
   - **Status: DO** - Use semantic-release or changesets
2. **npm authentication** (token management and automated login)
   - _Size: S | Business Value: Low | Time Criticality: Low | Risk Reduction: Medium | WSJF: 4_
   - **Status: DO** - Use GitHub Actions with npm tokens
3. **Package preparation** (files field optimization, README generation)
   - _Size: L | Business Value: Low | Time Criticality: Low | Risk Reduction: Low | WSJF: 2_
   - **Status: MAYBE** - Use existing tools like auto-changelog

### Step 5: Maintenance & Growth

**Most Frequent Pain Points to Automate**:

1. **Dependency vulnerability scanning** (automated security audits and alerts)
   - _Size: M | Business Value: Medium | Time Criticality: Medium | Risk Reduction: High | WSJF: 8_
   - **Status: DO** - Use GitHub Dependabot + npm audit
2. **Dependency updates** (automated minor/patch updates with testing)
   - _Size: L | Business Value: Medium | Time Criticality: Low | Risk Reduction: Medium | WSJF: 3_
   - **Status: DO** - Use renovate or dependabot
3. **Issue triage** (automated labeling and assignment based on content)
   - _Size: L | Business Value: Low | Time Criticality: Low | Risk Reduction: Low | WSJF: 2_
   - **Status: MAYBE** - Use GitHub Actions + probot

**WSJF Scoring:**

- **Size**: XS=1, S=2, M=3, L=5, XL=8
- **Business Value**: Low=1, Medium=2, High=3
- **Time Criticality**: Low=1, Medium=2, High=3
- **Risk Reduction**: Low=1, Medium=2, High=3
- **WSJF = (Business Value + Time Criticality + Risk Reduction) / Size**

**Top Priority Automations by WSJF (Actionable for dry-aged-deps):**

1. **Auto-formatting on save** (WSJF: 15) - VS Code settings + prettier extension
2. **Live linting feedback** (WSJF: 15) - VS Code ESLint extension
3. **Test running on file changes** (WSJF: 15) - Use vitest --watch
4. **CLI integration testing** (WSJF: 10) - Use execa + vitest

**Won't Do (Already Done Manually):**

- Project setup automations - chicken and egg problem for this project
- bin/ directory creation - already exists
- Git initialization - already done

**Implementation Strategy:**

- Use existing mature tools (prettier, eslint, vitest, semantic-release)
- Create helper scripts in scripts/ folder for proof-of-concept
- Focus on development workflow improvements we can actually use

---

## Future Framework Enhancements

After full automation (Release 0.5), could add:

- AI-powered code generation and suggestions
- Cross-platform distribution automation (homebrew, chocolatey, etc.)
- Advanced analytics and user behavior insights
- Plugin ecosystem and community marketplace
- Integration with popular development environments
- Enterprise features (team templates, governance, etc.)
