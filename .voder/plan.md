## NOW
Add missing `@story` and `@req` JSDoc headers to any test files under `test/` that currently lack them, referencing their appropriate `prompts/` specification files so that traceability validation will pass.

## NEXT
- Remove any `// eslint-disable` comments in those test files that bypass traceability checks.  
- Run `npm run validate-traceability` and verify that no missing‐annotation errors remain.

## LATER
- Modify the Husky pre-push hook (`.husky/pre-push`) to insert `npm run validate-traceability` immediately after the lint step.  
- Add a CI gate to block PRs if any test file is missing `@story`/`@req` annotations.  
- Once testing score ≥90%, tighten Vitest and ESLint traceability thresholds for stricter enforcement.