# Developer Guidelines

This document outlines important guidelines and conventions for developers working on the dry-aged-deps project.

## AI Development State (.voder Directory)

**CRITICAL**: The `.voder/` directory contains AI development state and tracking information.

### Rules for .voder Directory

1. **MUST NOT be ignored by git** - This directory must be tracked in version control
2. **MUST NOT be manually edited** - All files in `.voder/` are managed by AI tooling
3. **MUST be committed** - Changes to `.voder/` should be committed along with related code changes
4. **DO NOT interfere** - Let the AI tools manage this directory's contents

### What .voder Contains

The `.voder/` directory tracks:
- Development history and progress
- Implementation plans and status
- Progress logs and metrics
- Last actions taken by AI assistants

This state information is crucial for:
- Maintaining context across development sessions
- Tracking project evolution
- Coordinating between AI and human developers
- Understanding decision history

## Module System

This project uses **ES Modules (ESM)** exclusively. See [docs/decisions/0001-use-es-modules.md](decisions/0001-use-es-modules.md) for the architectural decision rationale.

### Import/Export Conventions

- Use `import/export` syntax, not `require()`
- Always include `.js` extensions in relative imports
- Example: `import { someFunction } from './some-module.js'`

## Code Quality

### Linting

Run linting before committing:
```bash
npm run lint
```

We use ESLint v9+ with flat config format. See [docs/eslint-flat-config.md](eslint-flat-config.md) for details.

### Testing

All code changes should include appropriate tests:
```bash
npm test           # Run tests with coverage
npm run test:cli   # Run CLI-specific tests
```

Tests use vitest and must maintain 80% coverage thresholds.

## Git Workflow

### What NOT to Ignore

The following directories MUST be tracked in git:
- `.voder/` - AI development state (as mentioned above)
- `prompts/` - Project specifications and user stories
- `docs/` - All documentation

### What to Ignore

See `.gitignore` for the complete list. Key items:
- `.cursor/` - AI assistant configuration (local only)
- `.github/instructions/` - AI assistant prompts (local only via symlinks)
- `.github/prompts/` - AI assistant prompts (local only via symlinks)
- `node_modules/` - Dependencies
- `coverage/` - Test coverage reports

## Documentation

### Keep Updated

When making changes, update relevant documentation:
- `docs/api.md` - API documentation
- `docs/architecture.md` - Architecture decisions and patterns
- `docs/decisions/*.md` - ADRs using MADR 4.0 format
- `CHANGELOG.md` - User-facing changes

### Decision Records

Use Markdown Architectural Decision Records (MADR) format for architectural decisions. See existing examples in `docs/decisions/`.

## CI/CD

All changes must pass CI checks:
- Linting
- Tests with coverage
- CLI integration tests
- Security vulnerability scan (npm audit)
- CodeQL analysis

View CI status: `gh run list --limit 5 | cat`

## Dependencies

### Version Management

This tool helps identify outdated dependencies. Practice what we preach:
- Keep dependencies reasonably up-to-date
- Use the tool to check for mature, secure updates
- Document any pinned versions and why

### Security

Run security audits regularly:
```bash
npm audit --audit-level=moderate
```

## Questions?

If you have questions about these guidelines or need clarification, refer to:
- Project documentation in `docs/`
- Existing code for patterns and examples
- ADRs in `docs/decisions/` for architectural context
