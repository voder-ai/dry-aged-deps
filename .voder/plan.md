## NOW
Refactor `src/cli-parser-utils.js` to replace its dynamic property lookups with safe key checks (e.g. `Object.prototype.hasOwnProperty.call(obj, key)` or optional chaining) and remove the `// eslint-disable-next-line security/detect-object-injection` comment.

## NEXT
- Run  
  ```
  grep -R "eslint-disable-next-line security/detect-object-injection" -n src/
  ```  
  to locate any remaining suppressions.  
- In each flagged file, refactor to use safe property access or type guards, then delete the corresponding `eslint-disable-next-line security/detect-object-injection` comment.  
- Run `npm run lint` and verify there are no `security/detect-object-injection` warnings.  
- Run `npm run validate-traceability` and update any test files that still lack correct `@story prompts/XXX.0-DEV-*.md` and `@req` annotations. Repeat until `validate-traceability` reports zero errors, then commit those changes.

## LATER
- Add a CI and Husky pre-push check that fails the build if any `security/detect-object-injection` disables remain.  
- Audit for other ESLint or JSDoc suppressions (`@ts-ignore`, rule disables) and refactor to remove them.  
- Once code-quality and testing metrics are both ≥ 90%, tighten additional complexity rules (e.g. lower max-lines-per-function, max-depth).  
- Document the security-rule compliance and test-traceability processes in `CONTRIBUTING.md`.