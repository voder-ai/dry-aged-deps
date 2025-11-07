# 0001. Use ES Modules for All Code

Date: 2025-11-07

## Status

Accepted

## Context

We need to decide on the module system for the dry-aged-deps CLI tool. The project involves:

- A Node.js CLI application that needs to work across different Node.js versions
- Integration with npm ecosystem tools and APIs
- Testing with modern testing frameworks (vitest)
- Distribution as an npm package with a binary entry point

### Key Considerations

1. **CLI Distribution Model**: Users install and execute the CLI, they don't import it as a library
2. **Modern Tooling**: vitest, ESLint, and modern dev tools optimize for ES modules
3. **JavaScript Standard**: ES modules are the official standard going forward
4. **Node.js Support**: All current LTS versions support ES modules natively
5. **Developer Experience**: Single module system reduces complexity

### Current State

- Mixed system: functional code uses CommonJS, tests use ES modules
- Package.json does not specify `"type": "module"`
- ESLint configured for mixed module systems
- vitest requires ES modules for optimal performance

## Decision

**We will use ES Modules throughout the entire codebase.**

All code (src/, bin/, test/) will use ES modules (`import`/`export`) syntax.

### Rationale

1. **No Compatibility Concerns for CLI**: Users don't import our code as a library - they install and run the CLI
2. **Modern Standard**: ES modules are the JavaScript standard going forward
3. **Tooling Consistency**: vitest, modern bundlers, and dev tools work best with ES modules
4. **Future-Proof**: Aligns with the direction of the JavaScript ecosystem
5. **Simplicity**: Single module system reduces configuration complexity
6. **Node.js Support**: All supported Node.js LTS versions handle ES modules natively

### Implementation

- Add `"type": "module"` to package.json
- Convert all files to use `import`/`export` syntax
- Update file extensions to `.mjs` if needed for clarity
- Configure tooling for ES modules consistently

## Consequences

### Positive

- **Modern Standard**: Using the official JavaScript module standard
- **Tooling Optimization**: Better performance with vitest, bundlers, and modern tools
- **Consistency**: Single module system throughout the codebase
- **Future-Proof**: Aligned with ecosystem direction
- **Cleaner Syntax**: More readable import/export statements
- **Top-Level Await**: Available when needed

### Negative

- **Migration Effort**: Need to convert existing CommonJS files
- **Dependency Compatibility**: Some older npm packages may require dynamic imports
- **File Extensions**: May need explicit `.js` extensions in imports

### Mitigation Strategies

1. **Gradual Migration**: Convert files systematically, starting with new code
2. **Dynamic Imports**: Use `await import()` for CommonJS-only dependencies
3. **Clear Documentation**: Update all examples and documentation
4. **Tooling Updates**: Ensure all tools are configured for ES modules

## Implementation Notes

### Package.json Changes
```json
{
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### ESLint Configuration
```javascript
// All files use ES modules
{
  files: ['src/**/*.js', 'bin/**/*.js', 'test/**/*.js'],
  languageOptions: { sourceType: 'module' }
}
```

### Migration Steps
1. Add `"type": "module"` to package.json
2. Convert `require()` calls to `import` statements
3. Convert `module.exports` to `export` statements  
4. Add explicit `.js` extensions to local imports
5. Use `await import()` for any CommonJS-only dependencies
6. Update documentation and examples

### CommonJS Dependency Handling
```javascript
// For CommonJS-only packages
const packageName = await import('commonjs-package');
const { default: defaultExport } = packageName;
```

## Alternatives Considered

### Hybrid Approach (Original Decision)
- **Pros**: Avoided migration effort, leveraged existing CommonJS code
- **Cons**: Configuration complexity, inconsistent patterns, mental overhead
- **Rejection Reason**: No real benefit for a CLI tool, adds unnecessary complexity

### Full CommonJS
- **Pros**: No migration needed, familiar patterns
- **Cons**: Fighting against modern tooling, not future-proof, vitest suboptimal performance
- **Rejection Reason**: Going against ecosystem direction for no meaningful benefit

### TypeScript
- **Pros**: Type safety, excellent tooling, can output either module format
- **Cons**: Additional build step complexity for a simple CLI tool
- **Future Consideration**: May revisit if the project grows significantly

## References

- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [vitest ES Modules Guide](https://vitest.dev/guide/common-errors.html#cannot-use-import-statement-outside-a-module)
- [npm CLI Best Practices](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin)

## Review Schedule

This decision should be reviewed:
- When Node.js support policy changes significantly
- When major dependencies drop ES module support (unlikely)
- If the project scope expands to include library distribution
- Every 18 months or with major tooling updates