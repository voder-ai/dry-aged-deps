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
- **Test placement:** paired tests are co-located beside their `src/` module per **ADR-0020** — e.g. `src/foo.js` paired with `src/foo.test.js` (or `src/foo.<variant>.test.js` for split test suites). The convention satisfies `@windyroad/tdd`'s test-association hook directly. **Exception**: CLI integration and end-to-end tests remain in `test/` because they don't pair with a single `src/` module (`test/cli.*.test.js`, `test/cli-entrypoint.test.js`, `test/cli.e2e.real-fixture.test.js`, plus cross-cutting tests like `test/formatters.unfixable.test.js`, `test/functional-assessment.test.js`, `test/husky-pre-commit.test.js`, `test/lint-security.test.js`, `test/push-watch.*.test.js`, `test/run-with-timeout.test.js`). `test/helpers/` (CLI helpers + mock data) and `test/fixtures/` (fixture projects) also stay under `test/`. ADR-0020 supersedes ADR-0015's narrow-exception framing.

## Commit Messages

Conventional Commits enforced by commitlint + husky pre-commit hook.

- `feat:` — new user-facing functionality only (triggers minor bump)
- `fix:` — bug fixes in user-visible behavior (triggers patch bump)
- `chore:` — deps, tooling, build config (not `feat:` for internal tooling)
- `refactor:`, `test:`, `docs:`, `style:`, `perf:`, `ci:`, `build:` — standard types
- `BREAKING CHANGE:` — only for changes to CLI flags, exit codes, output format, or removal of features

### Multi-iter feature ship-signal (codified 2026-06-02 from RFC-001 experience)

When a feature lands across multiple iters as `chore:` / `test:` commits (e.g. T1 spec → T2 RED → T3 impl → T4 wire → T5 formatter → T6 exit-code → T7 regression), the release-eligible `feat:` commit follows one of two shapes:

1. **Bundled** — T4+T5+T6 wired-up together as a single `feat:` commit. Use when the iters land in close succession with no intermediate user-visible signal needed.
2. **README-discoverability addition** — a separate `feat:` commit that surfaces the new flag / option / column in the README Options table (or equivalent user-facing surface) once all the pieces are in place. Use when chore-type implementation has already shipped across multiple iters. RFC-001 used this shape via commit `355deee feat(overrides-hygiene): expose --no-overrides-hygiene in README Options table` to ship `dry-aged-deps@2.11.0`.

The `feat:` commit's diff can be small (a README line addition is sufficient); its purpose is to signal "the feature is shipping to users" and trigger the semantic-release minor bump per ADR-0005. Avoid pattern 3 — letting RFC code ship inside the next unrelated `feat:`/`fix:` — because it defers the ship-decision indefinitely and breaks the audit trail between feature work and release.

Track multi-iter feature work in the RFC's `## Tasks` section per ADR-0019; record the chosen ship-signal shape there too so future contributors don't rediscover the rule.

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
