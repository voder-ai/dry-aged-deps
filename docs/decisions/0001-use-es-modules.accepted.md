---
status: "accepted"
date: 2025-11-07
decision-makers: ["Tom Howard"]
consulted: []
informed: []
reassessment-date: 2027-05-07
---

# 0001. Use ES Modules for All Code

## Context and Problem Statement

We need to decide on the module system for the `dry-aged-deps` CLI tool. The project involves:

- A Node.js CLI application that needs to work across different Node.js versions.
- Integration with npm ecosystem tools and APIs.
- Testing with modern testing frameworks (vitest).
- Distribution as an npm package with a binary entry point.

Before this decision, the codebase mixed module systems: functional code used CommonJS, tests used ES modules. `package.json` did not specify `"type": "module"`. ESLint was configured for mixed module systems. vitest required ES modules for optimal performance.

## Decision Drivers

- **CLI distribution model**: users install and execute the CLI; they do not import it as a library, so library-compatibility with CommonJS consumers is not a constraint.
- **Modern tooling**: vitest, ESLint, and modern dev tools optimise for ES modules.
- **JavaScript standard**: ES modules are the official standard going forward.
- **Node.js support**: all current LTS versions support ES modules natively.
- **Developer experience**: a single module system reduces configuration complexity.

## Considered Options

1. **ES Modules throughout the entire codebase** — convert all `src/`, `bin/`, and `test/` files to `import`/`export` syntax and add `"type": "module"` to `package.json`.
2. **Hybrid approach** — keep the existing mix of CommonJS in functional code and ES modules in tests.
3. **Full CommonJS** — convert tests back to CommonJS and use `require`/`module.exports` everywhere.
4. **TypeScript** — adopt TypeScript with a build step.

## Decision Outcome

Chosen option: **ES Modules throughout the entire codebase**, because users install and run the CLI rather than importing it as a library, modern tooling (vitest, ESLint, bundlers) works best with ES modules, and all supported Node.js LTS versions handle them natively.

### Implementation summary

- Add `"type": "module"` to `package.json`.
- Convert all files to use `import`/`export` syntax.
- Use explicit `.js` extensions in relative imports.
- Configure tooling for ES modules consistently.
- Use `await import()` for any CommonJS-only dependencies.

### Package.json changes

```json
{
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### ESLint configuration

```javascript
// All files use ES modules
{
  files: ['src/**/*.js', 'bin/**/*.js', 'test/**/*.js'],
  languageOptions: { sourceType: 'module' }
}
```

### Migration steps

1. Add `"type": "module"` to `package.json`.
2. Convert `require()` calls to `import` statements.
3. Convert `module.exports` to `export` statements.
4. Add explicit `.js` extensions to local imports.
5. Use `await import()` for any CommonJS-only dependencies.
6. Update documentation and examples.

### CommonJS dependency handling

```javascript
// For CommonJS-only packages
const packageName = await import('commonjs-package');
const { default: defaultExport } = packageName;
```

## Consequences

### Good

- **Modern standard**: using the official JavaScript module standard.
- **Tooling optimisation**: better performance with vitest, bundlers, and modern tools.
- **Consistency**: a single module system throughout the codebase.
- **Future-proof**: aligned with the ecosystem's direction.
- **Cleaner syntax**: more readable `import`/`export` statements.
- **Top-level await**: available when needed.

### Neutral

- **Explicit extensions**: relative imports must include `.js`. This is a minor stylistic shift, not a substantive cost.

### Bad

- **Migration effort**: existing CommonJS files had to be converted.
- **Dependency compatibility**: some older npm packages may require dynamic imports via `await import()`.

### Mitigation strategies

1. **Gradual migration**: convert files systematically, starting with new code.
2. **Dynamic imports**: use `await import()` for CommonJS-only dependencies.
3. **Clear documentation**: update all examples and documentation.
4. **Tooling updates**: ensure all tools are configured for ES modules.

## Confirmation

This decision is implemented when:

1. `package.json` contains `"type": "module"`.
2. All files in `src/`, `bin/`, and `test/` use `import`/`export` syntax (no `require`/`module.exports` in source).
3. ESLint is configured with `sourceType: 'module'` for all source paths.
4. `npm test` runs successfully under vitest with ES modules.
5. Relative imports in source include explicit `.js` extensions.

## Pros and Cons of the Options

### Option 1 — ES Modules throughout

- Good: aligned with the JavaScript standard and modern tooling.
- Good: single module system reduces configuration complexity.
- Good: future-proof and consistent with the ecosystem.
- Bad: one-time migration effort required.

### Option 2 — Hybrid approach (original state)

- Good: avoided migration effort, leveraged existing CommonJS code.
- Bad: configuration complexity, inconsistent patterns, mental overhead.
- Rejection reason: no real benefit for a CLI tool; adds unnecessary complexity.

### Option 3 — Full CommonJS

- Good: no migration needed, familiar patterns.
- Bad: fighting against modern tooling, not future-proof, vitest suboptimal performance.
- Rejection reason: going against ecosystem direction for no meaningful benefit.

### Option 4 — TypeScript

- Good: type safety, excellent tooling, can output either module format.
- Bad: additional build step complexity for a simple CLI tool.
- Future consideration: may revisit if the project grows significantly. See ADR-0006 for the actual position on type checking (JSDoc with TypeScript as a type checker, no build step).

## Reassessment Criteria

Reassess this decision when:

- Node.js support policy changes significantly.
- Major dependencies drop ES module support (unlikely).
- The project scope expands to include library distribution.
- Every 18 months, or with major tooling updates.

## References

- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [vitest ES Modules Guide](https://vitest.dev/guide/common-errors.html#cannot-use-import-statement-outside-a-module)
- [npm CLI Best Practices](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin)
