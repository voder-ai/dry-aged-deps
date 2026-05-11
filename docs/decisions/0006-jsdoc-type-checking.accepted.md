---
status: "accepted"
date: 2025-11-13
decision-makers: ["Tom Howard"]
consulted: []
informed: []
reassessment-date: 2026-11-13
---

# 0006. Use JSDoc with TypeScript for Type Checking

## Context and Problem Statement

The project uses JavaScript with ES modules (ADR-0001) and has TypeScript installed as a dependency. We need to decide whether and how to use TypeScript for type safety without compromising the simplicity that comes with pure JavaScript.

### Key considerations

1. **Current state**: JavaScript-only codebase with partial JSDoc annotations (29 type comments at the time of the decision).
2. **Project scale**: small, mature codebase (1,343 LOC, 10 modules, 13 features, single contributor).
3. **TypeScript already present**: required as a peer dependency by commitlint tooling.
4. **Existing JSDoc**: already using some type annotations in function signatures.
5. **CLI distribution**: no build step currently — simple npm package deployment.
6. **Stability**: core functionality implemented, not rapidly evolving.

## Decision Drivers

- **Leverage existing investment**: TypeScript is already installed; partial JSDoc coverage already in place.
- **Incremental improvement**: type coverage should be improvable gradually without a migration project.
- **Zero build complexity**: no compilation step means simpler deployment and faster iteration.
- **Bug prevention**: type checking catches parameter mismatches, typos, null/undefined errors.
- **IDE support**: improved autocomplete, inline documentation, refactoring.
- **Minimal CI overhead**: ~2 seconds added for type checking.
- **Simplicity**: maintain JavaScript simplicity while adding safety (80/20 principle).

## Considered Options

1. **JSDoc annotations with TypeScript as a type checker (no compilation)**.
2. **Full TypeScript migration** — convert `.js` to `.ts`, add a build step.
3. **No type checking** — remove TypeScript entirely or leave it unused.
4. **Gradual TypeScript adoption** — allow both `.js` and `.ts` files to coexist.
5. **Runtime type validation** (Zod, Joi, etc.).

## Decision Outcome

Chosen option: **JSDoc annotations with TypeScript as a type checker (not a compiler)**, because TypeScript is already installed, JSDoc coverage already exists, and the project's scale and stability do not warrant a build step.

We will:

- Keep the JavaScript codebase (no `.ts` files).
- Enhance JSDoc coverage for type annotations.
- Use TypeScript's `tsc --noEmit` to validate types.
- Run type checking in CI alongside linting.
- NOT add a build/compilation step.

### Implementation

#### 1. Fix tsconfig.json

```jsonc
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext", // Fixed: must match moduleResolution
    "moduleResolution": "NodeNext",
    "allowJs": true, // Check JavaScript files
    "checkJs": true, // Enable type checking for JS
    "noEmit": true, // Don't compile - just check
    "strict": true, // Enable all strict type checks
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true // Skip checking node_modules types
  },
  "include": ["src/**/*", "bin/**/*"],
  "exclude": ["node_modules", "coverage", "test"]
}
```

#### 2. Add type-checking script

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src bin --ext .js --ext .cjs --max-warnings=0",
    "test": "vitest run --coverage",
    "validate": "npm run lint && npm run typecheck && npm test"
  }
}
```

#### 3. Update CI pipeline

Add type checking step after linting in `.github/workflows/ci-publish.yml`:

```yaml
- name: Lint code
  run: npm run lint

- name: Check types
  run: npm run typecheck

- name: Run tests
  run: npm test
```

#### 4. JSDoc coverage guidelines

**Target coverage:**

- All exported functions: 100% (8 functions).
- Complex internal functions: as needed.
- Simple utility functions: optional.

**JSDoc best practices:**

```javascript
/**
 * Fetches version publish times for an npm package.
 *
 * @param {string} packageName - The name of the npm package
 * @returns {Promise<Record<string, string>>} Map of version to ISO date string
 * @throws {Error} If npm registry is unreachable or package doesn't exist
 */
export async function fetchVersionTimes(packageName) {
  // implementation
}

/**
 * @typedef {Object} VulnerabilityResult
 * @property {number} count - Number of vulnerabilities found
 * @property {string} maxSeverity - Highest severity level
 * @property {Array<Object>} details - Vulnerability details
 */

/**
 * @param {string} packageName
 * @param {string} version
 * @returns {Promise<VulnerabilityResult>}
 */
export async function checkVulnerabilities(packageName, version) {
  // implementation
}
```

#### 5. Gradual enhancement plan

**Phase 1 (immediate):**

- Fix `tsconfig.json`.
- Add `typecheck` script.
- Run typecheck locally to identify issues.
- Fix critical type errors.

**Phase 2 (next sprint):**

- Add `typecheck` to CI pipeline.
- Document all public API functions.
- Fix remaining type errors.

**Phase 3 (ongoing):**

- Add JSDoc to new functions as written.
- Improve coverage during refactoring.
- Consider stricter TypeScript options.

## Consequences

### Good

- **Bug prevention**: type checking catches errors before runtime.
- **Better documentation**: JSDoc serves a dual purpose (docs + types).
- **IDE support**: enhanced autocomplete, parameter hints, and refactoring.
- **No build step**: maintains deployment simplicity.
- **Low migration cost**: enhance existing annotations incrementally.
- **Team onboarding**: types help new contributors understand interfaces.
- **Refactoring safety**: the type checker validates changes across modules.

### Neutral

- **Learning curve**: developers need to understand JSDoc syntax.
- **Tooling setup**: requires proper `tsconfig.json` configuration.

### Bad

- **Slightly more verbose**: JSDoc type annotations are longer than plain comments.
- **CI time**: adds ~2 seconds to the pipeline for type checking.
- **Not full TypeScript**: cannot use advanced TypeScript features (generics, mapped types, etc.).
- **JSDoc limitations**: type annotations can be awkward for complex types.
- **Maintenance**: need to keep JSDoc in sync with implementation.

## Confirmation

This decision is implemented when:

1. `tsconfig.json` exists with `checkJs`, `allowJs`, `noEmit`, and `strict` enabled, scoped to `src/` and `bin/`.
2. `npm run typecheck` runs `tsc --noEmit` and passes.
3. `npm run validate` includes `typecheck`.
4. The CI workflow runs `npm run typecheck`.
5. All exported functions in `src/` and `bin/` have JSDoc parameter and return-type annotations.

## Pros and Cons of the Options

### Option 1 — JSDoc + TypeScript as type checker (chosen)

- Good: leverages existing TypeScript install and partial JSDoc coverage.
- Good: no build step; preserves ADR-0001's simplicity.
- Good: low migration cost; can be improved incrementally.
- Bad: cannot use advanced TypeScript-only features.

### Option 2 — Full TypeScript migration

- Good: full type safety with advanced features.
- Good: industry standard for large projects.
- Good: better type inference.
- Bad: requires `.js` → `.ts` migration (significant effort).
- Bad: adds build-step complexity.
- Bad: overkill for 1,343 LOC with a single contributor.
- Bad: goes against ADR-0001 (ES modules for simplicity).
- Rejection reason: cost/benefit ratio unfavourable for project scale and maturity.

### Option 3 — No type checking

- Good: simplest possible setup.
- Good: no type-checking overhead.
- Good: faster development iteration.
- Bad: misses the opportunity for free safety.
- Bad: TypeScript is already installed (needed by commitlint).
- Bad: no IDE type hints.
- Bad: harder to catch bugs early.
- Rejection reason: TypeScript is already present; JSDoc annotations provide value at minimal cost.

### Option 4 — Gradual TypeScript with `allowJs`

- Good: can migrate gradually file by file.
- Good: full TypeScript features available.
- Bad: two languages in the codebase (complexity).
- Bad: still requires a build step for `.ts` files.
- Bad: unclear migration path/completion criteria.
- Rejection reason: adds complexity without clear benefit over the JSDoc approach.

### Option 5 — Runtime type validation (Zod, Joi)

- Good: validates actual runtime values.
- Good: catches data issues at boundaries.
- Bad: adds runtime overhead.
- Bad: requires additional dependencies.
- Bad: different approach (runtime vs compile-time).
- Bad: better suited for API validation than internal code.
- Rejection reason: addresses a different problem; can be added later if needed for input validation.

## Reassessment Criteria

Reassess this decision when:

- The project grows beyond 5,000 LOC or gains multiple active contributors.
- A team request emerges for full TypeScript migration.
- Major refactoring is undertaken (a good time to migrate if justified).
- Every 12 months, or with significant codebase changes.
- JSDoc proves too limiting for complex types in practice.

## Related Decisions

- **ADR-0001**: Use ES Modules — TypeScript type checking preserves ES module simplicity.
- **ADR-0005**: Semantic Release Version Management — no build artifacts to version-control.

## References

- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [JSDoc Official Documentation](https://jsdoc.app/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html)
