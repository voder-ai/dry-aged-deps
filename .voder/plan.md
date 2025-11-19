## NOW
Add a JSDoc-style @story and @req header to src/cli-options-helpers/utils-common.js (the file exporting createStringFlagParser and createIntegerFlagParser), commit the single-file change with a conventional commit message (chore: add @story/@req to src/cli-options-helpers/utils-common.js).

## NEXT
1. Run the traceability validator and capture results:
   - Command: npm run validate-traceability > traceability_report.txt
   - Verify the report lists remaining files that lack parseable @story/@req annotations or have malformed annotations.

2. Create a triage document and plan edits:
   - File: docs/traceability/triage.md
   - Content: table mapping failing file → required prompt(s) → suggested @req IDs → planned owner and priority.
   - Commit: docs: add traceability triage (one commit).

3. Remove or replace file-wide eslint-disable usages in test helpers and tests:
   - For each file listed in triage.md (examples: test/helpers/execFileMock.js, test/helpers/cli.outdated.mock.js, test/cli.e2e.real-fixture.test.js), do one of:
     - Add a proper JSDoc header with @story (pointing to a specific prompts/*.md) and @req entries, or
     - Narrow the disable to the smallest possible line range with an inline justification and an issue/ticket reference.
   - Commit changes in small batches (one or a few related files per commit).
   - After each commit run the local quality checks: npm run validate-traceability, npm run lint -- --max-warnings=0, npm run type-check, npm test. Fix any failures before proceeding.

4. Add missing @story/@req headers to production code flagged by the validator:
   - Prioritize exported functions and top-level modules (use triage.md to drive ordering).
   - Add parseable JSDoc headers like:
     /**
      * Brief description...
      * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
      * @req REQ-CLI-FLAG - Accept command-line flags for configuration
      */
   - Commit per logical group (e.g., helpers, formatters).
   - After each commit run the same local checks as step 3.

5. Replace the highest-priority temporary `any` typings introduced during the checkJs rollout:
   - Target files from the assessment: bin/dry-aged-deps.js (handleError), src/fetch-version-times.js (execFileImpl), src/security-smart-search.js (checkVulnerabilities).
   - Prefer adding precise JSDoc types or small .d.ts declarations rather than broad `any`.
   - Commit one file at a time with an appropriate commit type (refactor: or fix: depending on impact).
   - Run type-check, lint and tests after each change.

6. Fix test-fixture license metadata inconsistency:
   - Add "license": "MIT" to any package.json used as fixtures that lack it (e.g., test/fixtures-up-to-date/package.json).
   - Commit as chore: add license field to test fixture package.json.
   - Run repository license checks (if any), lint, and tests.

7. Re-run full local quality pipeline:
   - Commands: npm run format:check; npm run lint; npm run type-check; npm test; npm run validate-traceability
   - Fix any remaining issues uncovered and commit small fixes.
   - Push changes and monitor CI; if CI fails, analyze the single failing step and fix it before proceeding.

Notes for commits and process:
- Keep commits small and focused; run full local quality checks before committing and again before pushing.
- Use Conventional Commits: chore:, refactor:, fix:, docs: as appropriate.
- Do not add @story ??? or @req UNKNOWN except as a last-resort flagged entry in triage.md with a created issue to resolve it later.

## LATER
1. Gradually tighten TypeScript strictness:
   - Re-enable strict flags incrementally in tsconfig.json (noImplicitAny, strictNullChecks, strict) and fix resulting type errors per-module.
   - Track progress in docs/traceability/typing-migration.md with per-file owners and statuses.

2. Automate and harden traceability checks in CI:
   - Ensure npm run validate-traceability runs early in the CI workflow and fails the build on errors.
   - Add a PR check that comments on new files lacking @story/@req.

3. Clean-up and policy decisions:
   - Remove any remaining temporary eslint-disable comments once their root causes are fixed.
   - Create an ADR documenting the deployment policy (docs/decisions/adr-xxxx-continuous-deployment.md) if the team needs to reconcile the semantic-release behavior with strict CD requirements.
   - Add a short developer guide (developer-docs/traceability.md) describing how to add proper @story/@req tags when adding or modifying code.

Acceptance criteria
- npm run validate-traceability returns no errors.
- No file-wide eslint-disable comments remain in test helpers/tests without a narrow justification and an associated issue.
- The three highest-priority temporary `any` typings have been replaced with precise JSDoc/type declarations.
- Fixture package.json files include license metadata where required.
- Full local pipeline passes: format, lint, type-check, tests, and validate-traceability.
- CI succeeds on the pushed branch.