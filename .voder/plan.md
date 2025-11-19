## NOW
Update `tsconfig.json` to enable JavaScript type-checking by setting `"checkJs": true` under `"compilerOptions"` and ensuring your `include` glob covers all `.js` source files.

## NEXT
- Add `// @ts-check` at the top of each existing `.js` source file (e.g., via a small script or batch edit).
- Run `npm run type-check` to surface new errors and systematically fix them by:
  - Adding or refining JSDoc type annotations in `.js` files.
  - Converting the highest-impact modules (e.g. `src/cli-options.js`) to `.ts` with explicit type definitions.
- Update your Husky pre-commit and CI scripts to enforce the expanded type-check step (ensure JavaScript files are now validated).

## LATER
- After all critical type errors are resolved, tighten TypeScript strictness (`noImplicitAny`, `strictNullChecks`, etc.) and address remaining issues.
- Gradually migrate remaining `.js` modules to `.ts`, remove JSDoc shims, and retire legacy JS configurations.
- Adjust ESLint and complexity rules now that full type coverage exists (e.g. lower max-lines-per-function, enable additional `@typescript-eslint` rules).