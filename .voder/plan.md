## NOW
Update the failing E2E test so it no longer mutates the repository: change test/cli.e2e.real-fixture.test.js to copy the test fixture directory (test/fixtures) into a temporary directory (fs.mkdtemp + recursive copy) and run the npm install and CLI invocation inside that temp copy; commit this single-file change with message: chore(test): run real-fixture e2e in temp copy to avoid writing repo files.

## NEXT
1. Replace remaining repository-mutating test behavior and add a safety assertion
   - Files: any tests that run npm install or otherwise write into paths under the repo (search for "npm install", "npm ci", "fs.writeFileSync" targeting test/fixtures).
   - Change: for each, copy fixture to tmp dir or mock external calls so tests only write to temp directories. Add a small test helper (test/helpers/ensure-temp-cwd.js) that asserts process.cwd() is inside os.tmpdir() when tests will mutate files and use it in those tests.
   - Commit per logical group (e.g., chore(test): run fixture installs in temp dir — for each modified test file).

2. Remove or narrow file-level ESLint disables
   - Identify files with file-wide eslint-disable (grep for /* eslint-disable).
   - For each file:
     - Replace file-level disables with the narrowest eslint-disable-next-line or inline block around the specific lines that require it, with a one-line justification and a tracking issue ID in the comment.
     - If the disable was only present to satisfy traceability rules, instead add proper function- or branch-level JSDoc @story/@req annotations and remove the disable entirely.
   - Commit small batches (chore: narrow eslint disable in test/helpers/execFileMock.js, chore: remove file-wide traceability disable from test/helpers/cli.outdated.mock.js).

3. Add branch-level traceability annotations to key production modules
   - Priority list (first pass): src/fetch-version-times.js, src/filter-by-security.js, src/print-outdated.js, src/update-packages.js, src/check-vulnerabilities.js.
   - For each module: add parseable inline comments before significant branches/try-catches/loops, e.g.:
     // @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
     // @req REQ-RETRY-ON-ERR - Retry logic for transient npm errors
   - Commit per module (docs:feat or chore: depending on nature—use chore: for traceability-only changes).

4. Replace the three highest-priority temporary `any` typings
   - Targets: bin/dry-aged-deps.js (handleError param), src/fetch-version-times.js (execFileImpl param), src/security-smart-search.js (options.checkVulnerabilities).
   - Strategy: add precise JSDoc types where possible (e.g., specify Error|unknown, ChildProcessExecFileCallback signature, typed options object) or small .d.ts where JSDoc is insufficient.
   - Make one file change per commit with message type:
     - fix: strengthen JSDoc type for execFileImpl in src/fetch-version-times.js
     - fix: type handleError parameter in bin/dry-aged-deps.js
   - After each change run: npm run type-check; npm run lint; npm test.

5. Add missing license metadata to fixture package.json files
   - Find all package.json under test/** and other fixture directories lacking license field.
   - Add "license": "MIT" (matching root) to each fixture package.json.
   - Commit as chore: add license to test fixture package.json files.

6. Run the full local quality pipeline and push incrementally
   - After each commit/run-group:
     - Commands to run locally (use project scripts):
       - npm run format:check
       - npm run lint -- --max-warnings=0
       - npm run type-check
       - npm test
       - npm run validate-traceability
     - Fix any failures before making the next commit.
   - Push only when all local checks pass. Monitor CI (CI & Publish) and fix any CI-only failures following the investigation steps in the project guidelines.

## LATER
1. Add a pre-test safety check to CI and local developer hooks
   - Implement a lightweight script (scripts/assert-test-safe.js) that fails if a test run would perform installs inside repository paths. Run it from test setup in CI and optionally from pre-push hook.
   - Add documentation to developer guide on using temporary fixture copies.

2. Create docs/traceability/triage.md and track remaining annotations
   - If validate-traceability later reports files still missing branch-level annotations, add them to triage with owner and ETA.

3. Gradually tighten JS type-checking
   - Re-enable stricter TypeScript flags incrementally (noImplicitAny, strictNullChecks) in tsconfig.json and address resulting type issues module-by-module. Track progress in docs/traceability/typing-migration.md.

4. Remove remaining eslint disables once root causes fixed
   - After fixes and improved tests, remove any remaining eslint-disable usages and close tracking issues referenced in the inline justifications.

5. Automate traceability validation in CI as a failing gate (if not already)
   - Ensure npm run validate-traceability runs early in CI and blocks merges if it fails. Add a PR comment bot to warn when new files lack @story/@req.

Acceptance checkpoints (inline):
- Immediate: running npm test locally with modified E2E test must not create node_modules or other changes under repository paths.
- After NEXT steps: npm run validate-traceability returns no errors; no tests write into repo; the three temp any typings are replaced and npm run type-check passes; fixture package.json files include license; full local pipeline passes and CI run for pushed branch succeeds.

If you want, I will perform the NOW action now (edit test/cli.e2e.real-fixture.test.js to use a temporary copy and run the install there), run the local checks, commit with the exact Conventional Commit message, and report back with results. Which do you want me to start with?