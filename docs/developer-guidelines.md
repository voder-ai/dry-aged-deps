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

Run linting with zero-warning policy before committing:

```bash
npm run lint
```

- The `lint` script enforces zero ESLint warnings via `--max-warnings=0`.

We use ESLint v9+ with flat config format. See [docs/eslint-flat-config.md](eslint-flat-config.md) for details.

**Modern ESLint Best Practices:**

- ESLint v9+ with flat config does **NOT** need the `--ext` option or directory arguments
- Run ESLint from the project root without specifying directories: `eslint`
- File selection is managed entirely through the `eslint.config.js` configuration
- The flat config uses glob patterns to specify which files to lint
- This approach is simpler, more maintainable, and aligns with ESLint's current architecture

Example:

```bash
# Modern approach (ESLint v9+ flat config)
eslint --max-warnings 0

# Deprecated approach (avoid)
eslint --ext .js src bin --max-warnings 0
```

### Testing

All code changes should include appropriate tests:

```bash
npm test           # Run tests with coverage
npm run test:cli   # Run CLI-specific tests
npm run typecheck  # Run type-checking with TypeScript
npm run validate   # Run linting and tests together
```

Tests use vitest and must maintain 80% coverage thresholds.

## Git Workflow

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) format, enforced by commitlint.

#### Commit Types

- `feat:` - New feature that adds user-visible functionality (triggers minor version bump)
- `fix:` - Bug fix (triggers patch version bump)
- `chore:` - Changes that don't modify src or test files (e.g., dependency updates, build config)
- `refactor:` - Code changes that neither fix bugs nor add features
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `test:` - Adding or updating tests
- `perf:` - Performance improvements
- `ci:` - CI/CD configuration changes
- `build:` - Changes to build system or external dependencies
- `revert:` - Reverts a previous commit

#### When to Use `feat:`

Use `feat:` **ONLY** when adding new user-facing functionality or CLI options. Examples:

- ✅ `feat: add --json output format`
- ✅ `feat: support config file for default options`
- ❌ `feat: enable TypeScript type checking` (use `chore:` - internal tooling)
- ❌ `feat: add ESLint rule` (use `chore:` - developer tooling)

#### When to Use `BREAKING CHANGE:`

Add `BREAKING CHANGE:` in the commit body or footer **ONLY** when:

- Removing or renaming a CLI flag/option
- Changing the default behavior of existing functionality
- Removing support for a documented feature
- Changing exit codes in a way that breaks existing scripts
- Changing output format in a backwards-incompatible way

**NEVER use `BREAKING CHANGE:` for:**

- ❌ Linting rule changes (internal developer tooling)
- ❌ Adding stricter type checking (internal developer tooling)
- ❌ Refactoring code without changing external behavior
- ❌ Updating dependencies (unless they change user-facing behavior)
- ❌ Test changes
- ❌ Documentation updates

Examples:

```
# CORRECT - Breaking change
feat: change --min-age to require integer value

BREAKING CHANGE: --min-age now only accepts integers, not floats

# WRONG - Not a breaking change
refactor: enable strict TypeScript checking

BREAKING CHANGE: Added strict null checks
```

### What NOT to Ignore

- `.voder/` - AI development state (as mentioned above)
- `prompts/` - Project specifications and user stories
- `docs/` - All documentation

### What to Ignore

- `.cursor/` - AI assistant configuration (local only)
- `.github/instructions/` - AI assistant prompts (local only via symlinks)
- `.github/prompts/` - AI assistant prompts (local only via symlinks)
- `node_modules/` - Dependencies
- `coverage/` - Test coverage reports
- Husky pre-commit hook runs commitlint locally

### Pre-push Hook

A Husky pre-push hook is configured to run the following commands before allowing a push (matching the CI pipeline):

```sh
npx --no-install commitlint --from=HEAD~1 --to=HEAD        # Commit message linting
npm run lint                                              # Lint code
npm run type-check                                        # TypeScript type checking
npm run format:check                                      # Prettier formatting check
npm test                                                  # Unit tests with coverage
npm run check:lockfile                                    # Lockfile drift check
npm run check:duplication                                 # Duplicate code detection
npm run test:cli                                          # CLI integration tests
npm run test:cli -- test/cli.e2e.real-fixture.test.js     # E2E CLI test
npm run audit:ci                                          # Vulnerability scan
```

Ensure the hook is installed by running:

```bash
npm run prepare
```

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

The CI pipeline includes a commit message lint step that verifies commit messages adhere to Conventional Commits. A pull request template is provided at `.github/pull_request_template.md`; please follow this template when creating PRs.

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
