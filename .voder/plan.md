## NOW
Add the tar advisory ID (1109463) and any other missing disputed advisory IDs from your security-incident docs into `audit-resolve.json` so that all documented advisories are excluded.

## NEXT
- Integrate `npx dry-aged-deps` as a CI step (immediately before running the audit) and add it to your Husky pre-push hook.
- Update the Husky pre-push hook to run `npm run validate-traceability` and execute the fixture setup commands (`npm install --ignore-scripts --no-audit --no-fund` in `test/fixtures*`) before running tests.
- Refactor your CLI E2E tests to eliminate loops and conditional logic in favor of Vitest’s parameterized tests.
- Update all `describe(…)` titles in test files to include their `@story` identifiers for clearer traceability.

## LATER
- Once Security and Version Control scores ≥ 90%, tighten Vitest and ESLint traceability thresholds for stricter enforcement.
- Migrate to a unified audit-filter tool (e.g. audit-ci) with a central config for disputed advisories.
- Add caching for `npm view` calls in `build-rows.js` and introduce lightweight performance benchmarks.
- After Testing, Security, and Version Control are all ≥ 90%, resume the full functionality assessment.