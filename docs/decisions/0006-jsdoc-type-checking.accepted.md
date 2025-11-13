# 0006. Use JSDoc with TypeScript for Type Checking

Date: 2025-11-13

## Status

Accepted

## Context

The project uses JavaScript with ES modules and has TypeScript installed as a dependency. We need to decide whether and how to use TypeScript for type safety without compromising the simplicity that comes with pure JavaScript.

### Key Considerations

1. **Current State**: JavaScript-only codebase with partial JSDoc annotations (29 type comments)
2. **Project Scale**: Small, mature codebase (1,343 LOC, 10 modules, 13 features, single contributor)
3. **TypeScript Already Present**: Required as peer dependency by commitlint tooling
4. **Existing JSDoc**: Already using some type annotations in function signatures
5. **CLI Distribution**: No build step currently - simple npm package deployment
6. **Stability**: Core functionality implemented, not rapidly evolving

### Type Safety Options

1. **No type checking** - Remove TypeScript entirely or leave it unused
2. **JSDoc with TypeScript linting** - Use TypeScript to check JavaScript with JSDoc annotations
3. **Full TypeScript migration** - Convert .js files to .ts, add build step
4. **Gradual TypeScript adoption** - Allow both .js and .ts files coexist

## Decision

**Use JSDoc annotations with TypeScript as a type checker (not a compiler).**

We will:

- Keep the JavaScript codebase (no .ts files)
- Enhance JSDoc coverage for type annotations
- Use TypeScript's `tsc --noEmit` to validate types
- Run type checking in CI pipeline alongside linting
- NOT add a build/compilation step

### Rationale

1. **Leverage Existing Investment**: TypeScript is already installed; 29 JSDoc annotations already in place
2. **Incremental Improvement**: Can improve type coverage gradually without migration project
3. **Zero Build Complexity**: No compilation step means simpler deployment and faster iteration
4. **Catches Real Bugs**: Type checking catches parameter mismatches, typos, null/undefined errors
5. **Better Developer Experience**: Improved IDE autocomplete, inline documentation, refactoring support
6. **Minimal Overhead**: ~2 seconds added to CI pipeline for type checking
7. **Aligns with Simplicity**: Maintains JavaScript simplicity while adding safety (80/20 principle)
8. **Future-Proof**: Can migrate to full TypeScript later if project grows significantly

## Consequences

### Positive

- **Bug Prevention**: Type checking catches errors before runtime
- **Better Documentation**: JSDoc serves dual purpose (docs + types)
- **IDE Support**: Enhanced autocomplete, parameter hints, and refactoring
- **No Build Step**: Maintains deployment simplicity
- **Low Migration Cost**: Enhance existing annotations incrementally
- **Team Onboarding**: Types help new contributors understand interfaces
- **Refactoring Safety**: Type checker validates changes across modules

### Negative

- **Slightly More Verbose**: JSDoc type annotations are longer than plain comments
- **CI Time**: Adds ~2 seconds to pipeline for type checking
- **Not Full TypeScript**: Cannot use advanced TypeScript features (generics, mapped types, etc.)
- **JSDoc Limitations**: Type annotations can be awkward for complex types
- **Maintenance**: Need to keep JSDoc in sync with implementation

### Neutral

- **Learning Curve**: Developers need to understand JSDoc syntax
- **Tooling Setup**: Requires proper tsconfig.json configuration

## Implementation

### 1. Fix tsconfig.json

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
    "skipLibCheck": true, // Skip checking node_modules types
  },
  "include": ["src/**/*", "bin/**/*"],
  "exclude": ["node_modules", "coverage", "test"],
}
```

### 2. Add Type Checking Script

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

### 3. Update CI Pipeline

Add type checking step after linting in `.github/workflows/ci-publish.yml`:

```yaml
- name: Lint code
  run: npm run lint

- name: Check types
  run: npm run typecheck

- name: Run tests
  run: npm test
```

### 4. JSDoc Coverage Guidelines

**Target Coverage:**

- All exported functions: 100% (8 functions)
- Complex internal functions: As needed
- Simple utility functions: Optional

**JSDoc Best Practices:**

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

### 5. Gradual Enhancement Plan

**Phase 1 (Immediate):**

- Fix tsconfig.json
- Add typecheck script
- Run typecheck locally to identify issues
- Fix critical type errors

**Phase 2 (Next sprint):**

- Add typecheck to CI pipeline
- Document all public API functions
- Fix remaining type errors

**Phase 3 (Ongoing):**

- Add JSDoc to new functions as written
- Improve coverage during refactoring
- Consider stricter TypeScript options

## Alternatives Considered

### Full TypeScript Migration

**Pros:**

- Full type safety with advanced features
- Industry standard for large projects
- Better type inference

**Cons:**

- Requires .js → .ts migration (significant effort)
- Adds build step complexity
- Overkill for 1,343 LOC with single contributor
- Goes against ADR 0001 (ES modules for simplicity)

**Rejection Reason:** Cost/benefit ratio unfavorable for project of this scale and maturity.

### No Type Checking (Remove TypeScript)

**Pros:**

- Simplest possible setup
- No type checking overhead
- Faster development iteration

**Cons:**

- Misses opportunity for free safety
- TypeScript already installed (needed by commitlint)
- No IDE type hints
- Harder to catch bugs early

**Rejection Reason:** TypeScript is already present; JSDoc annotations provide value at minimal cost.

### Runtime Type Validation (e.g., Zod, Joi)

**Pros:**

- Validates actual runtime values
- Catches data issues at boundaries

**Cons:**

- Adds runtime overhead
- Requires additional dependencies
- Different approach (runtime vs compile-time)
- Better suited for API validation than internal code

**Rejection Reason:** Addresses different problem; can be added later if needed for input validation.

### TypeScript with allowJs (Mixed Codebase)

**Pros:**

- Can migrate gradually file-by-file
- Full TypeScript features available

**Cons:**

- Two languages in codebase (complexity)
- Still requires build step for .ts files
- Unclear migration path/completion criteria

**Rejection Reason:** Adds complexity without clear benefit over JSDoc approach for this project.

## Related Decisions

- **ADR 0001**: Use ES Modules - TypeScript type checking preserves ES module simplicity
- **ADR 0005**: Semantic Release Version Management - No build artifacts to version control

## References

- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [JSDoc Official Documentation](https://jsdoc.app/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html)

## Review Schedule

This decision should be reviewed:

- If project grows beyond 5,000 LOC or gains multiple active contributors
- If team requests full TypeScript migration
- When considering major refactoring (might be good time to migrate)
- Every 12 months or with significant codebase changes
- If JSDoc proves too limiting for complex types
