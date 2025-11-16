## NOW  
Refactor `src/cli-options-helpers.js` to extract its repeated flag-parsing logic into a new helper module and reduce its duplication below 20% (then verify with `npm run check:duplication`).

## NEXT  
- Remove any remaining `// eslint-disable complexity` directives in `bin/dry-aged-deps.js` and split its long functions into smaller, focused modules so ESLint’s cyclomatic-complexity rule passes (verify with `npm run lint`).  
- Consolidate shared logic between `src/print-outdated-handlers.js` and `src/print-outdated.js` into common helper functions to further reduce duplication and improve maintainability (verify with both `npm run lint` and `npm run check:duplication`).

## LATER  
- Add CI checks to enforce jscpd duplication < 20% and ESLint complexity < 12 across all production files.  
- Gradually tighten those thresholds in `eslint.config.js` and jscpd configuration, remediating any new violations in small, incremental refactors.  
- Schedule regular audits of other large modules (e.g., `src/print-outdated.js`, `src/filter-by-security.js`) for further refactoring as needed.