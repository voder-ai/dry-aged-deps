## NOW
Remove the `// @ts-nocheck` directive from the top of `src/cli-options.js` and fix any resulting type errors (using targeted `@ts-expect-error` or JSDoc annotations) so that `tsc --noEmit` passes without disabling type checking for the entire file.

## NEXT
- Refactor `eslint.config.js` to split out file-specific overrides, re-enabling global complexity (`complexity`, `max-depth`) and `max-lines-per-function` rules.  
- Add a `max-lines` ESLint rule with an appropriate threshold to enforce maximum file length across `src/`.  
- Audit all `// eslint-disable` directives in `src/`, replacing them with narrowly scoped suppressions or justification comments.

## LATER
- Incrementally lower complexity thresholds (e.g., set `complexity` to 10) and tighten `skipComments`/`skipBlankLines` allowances.  
- Break up any remaining oversized modules into smaller, single-responsibility files to improve maintainability.  
- Reassess code-quality metrics to confirm exceeding the 90% threshold and adjust rules as needed.