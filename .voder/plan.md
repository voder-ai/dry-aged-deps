## NOW
Refactor src/cli-options-helpers.js to extract its duplicated flag-parsing logic into a new src/cli-parser-utils.js helper module, reducing per-file duplication in cli-options-helpers.js below 20%.

## NEXT
- Audit all source modules and test files, adding missing JSDoc `@story` and `@req` tags to every public function, aligning each annotation with the appropriate prompt file.  
- Enhance JSDoc in key public APIs (e.g., src/config-loader.js, src/output-utils.js, src/print-outdated-handlers.js) to include full parameter and return descriptions, plus traceability annotations; update docs/api.md to reflect these changes.  
- Insert inline traceability comments for each significant branch (if/else blocks, loops, try/catch) in heavy-logic modules (e.g., src/print-outdated.js, security modules), referencing the requirement IDs they implement.

## LATER
- Update the Husky pre-commit hook to run a documentation-lint step that verifies presence and correctness of all `@story`/`@req` tags before allowing a commit.  
- Integrate a CI documentation-lint workflow that fails the build if traceability annotations or JSDoc coverage fall below defined thresholds.  
- Review remaining modules (e.g., security-helpers, update-packages) for duplication and complexity, and refactor shared logic or split large functions to meet duplication (<20%) and complexity (<15 cyclomatic) targets.