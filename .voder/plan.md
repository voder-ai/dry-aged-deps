## NOW
Update the Husky pre-push hook (`.husky/pre-push`) to include all CI steps: after the existing lint/type-check/format/tests commands, add the lockfile‐drift check (`npm install --package-lock-only && git diff --exit-code`), duplicate‐code detection (`npx jscpd --threshold 20 src`), CLI and E2E tests (`npm run test:cli` and `npm run test:cli -- test/cli.e2e.real-fixture.test.js`), and a full vulnerability audit (`npm audit --audit-level=moderate`).

## NEXT
- Stage and commit the updated `.husky/pre-push` file with a descriptive commit message.  
- Run `npm run prepare` to reinstall the updated hook locally.  
- Execute `git push` in a clean working copy to verify the pre-push hook now blocks on any failures of the new checks.  
- Update `docs/developer-guidelines.md` to document the new pre-push requirements and commands.

## LATER
- Extract the pre-push commands into a shared shell script (e.g., `scripts/prepush.sh`) and invoke it from `.husky/pre-push` for maintainability.  
- Add automated tests or CI jobs that simulate the pre-push hook to ensure hook/pipeline parity remains enforced.  
- Periodically review and prune the hook commands as CI requirements evolve (e.g., adjusting thresholds, removing retired checks).