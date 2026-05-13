# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

dry-aged-deps is a CLI tool that filters `npm outdated` output to show only safe, mature dependency updates. It combines age-based filtering (default 7 days) with security vulnerability checks to help avoid rushed releases and supply chain attacks.

## Commands

```bash
# Testing
npm test                                          # Run tests with coverage (80% threshold)
npm run test:watch                                # Watch mode
npm run test:cli                                  # CLI integration tests
npx vitest run test/some-file.test.js             # Run a single test file

# Linting & formatting
npm run lint                                      # ESLint (zero-warning policy)
npm run format                                    # Prettier format
npm run format:check                              # Check formatting
npm run type-check                                # TypeScript type checking (JSDoc-based)

# Validation
npm run validate                                  # lint + tests
npm run prepush                                   # Full pre-push suite (matches CI)

# Running locally
npm run start                                     # Run the CLI
node ./bin/dry-aged-deps.js --min-age=14          # Run with options
```

## Architecture

**Data flow:**

```
bin/dry-aged-deps.js → parseOptions() → npm outdated --json → printOutdated()
  ├── loadPackageJson()         → classify prod vs dev deps
  ├── buildRows()               → fetchVersionTimes() + calculateAgeInDays()
  ├── applyFilters()            → checkVulnerabilities() + filterBySecurity() + filterByAge()
  └── Output handler            → table / JSON / XML formatter
```

- `bin/dry-aged-deps.js` — CLI entry point, parses args and delegates to `printOutdated()`
- `src/print-outdated.js` — Orchestrator: builds rows, applies filters, formats output
- `src/cli-options.js` — CLI argument parsing + config file loading
- `src/build-rows.js` — Fetches npm registry data and constructs dependency row objects
- `src/apply-filters.js` — Combines age and security filtering
- `src/check-vulnerabilities.js` — Runs `npm audit --json` for vulnerability data
- `src/index.js` — Programmatic API (re-exports key functions)

**Exit codes:** 0 = no updates / success, 1 = safe updates found, 2 = error

## Code Conventions

- **ES Modules only** — use `import`/`export`, always include `.js` extensions in relative imports
- **JSDoc types** — TypeScript checks JS via `tsconfig.json` (noEmit, checkJs). Add `@param`/`@returns` JSDoc annotations, not `.ts` files
- **Prettier** — single quotes, semicolons, 120 print width, ES5 trailing commas, LF line endings
- **ESLint constraints** — max complexity 15, max 80 lines/function, max 350 lines/file, max 5 params, max depth 4

## Test Conventions

- **Framework:** Vitest with `globals: true` (describe/it/expect available globally)
- **Coverage:** 80% threshold for lines, statements, functions, branches
- **Traceability:** Tests must reference user stories via JSDoc `@supports prompts/NNN.N-...md REQ-ID` and describe blocks must include the story name. This is enforced by `eslint-plugin-traceability`
- **Mocks:** `test/helpers/` contains CLI helpers and mock data; `test/fixtures/` has fixture projects
- **Test placement:** tests live in `test/` mirroring the `src/` layout. One approved exception per **ADR-0015**: `src/update-packages.test.js` is co-located beside its impl because `@windyroad/tdd`'s test-association hook recognises only same-dir / `__tests__/` mappings (upstream gap tracked as P004). Future new tests for `src/` modules require a fresh ADR or amendment of ADR-0015 — do not co-locate by implicit precedent.

## Commit Messages

Conventional Commits enforced by commitlint + husky pre-commit hook.

- `feat:` — new user-facing functionality only (triggers minor bump)
- `fix:` — bug fixes in user-visible behavior (triggers patch bump)
- `chore:` — deps, tooling, build config (not `feat:` for internal tooling)
- `refactor:`, `test:`, `docs:`, `style:`, `perf:`, `ci:`, `build:` — standard types
- `BREAKING CHANGE:` — only for changes to CLI flags, exit codes, output format, or removal of features

## Workflow Rules

See `.github/instructions/base.instructions.md` for the full base instructions. Key points:

- **Specs before code** — update the spec in `prompts/` and document decisions in `docs/decisions/` (MADR 4.0) before changing code or tests. If directed to make changes that don't conform to specs/decisions, seek clarification and update the docs first.
- **Script centralization** — all dev scripts must be accessed through `package.json` "scripts". Never create standalone scripts in `scripts/` without a corresponding package.json entry.
- **Never bypass hooks** — do not use `--no-verify`. When pre-commit hooks fail, fix issues incrementally (one file at a time), verify each fix, and commit as hooks pass.
- **Renames** — use `git mv` to preserve file history.
- **No silent failures** — avoid `|| echo {}` patterns. Let commands fail so you can address the root cause.
- **No piping to jq** — read full results directly.

## Important Notes

- The `.voder/` directory is AI development state — do not manually edit, must be tracked in git
- User stories live in `prompts/` — each maps to requirement IDs used in traceability annotations
- ADRs are in `docs/decisions/` using MADR 4.0 format
- The pre-push hook runs the full validation suite (lint, types, format, tests, coverage, duplication, audit) — same as CI
- No production dependencies — the tool uses only Node.js built-ins
