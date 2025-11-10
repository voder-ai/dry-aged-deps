## NOW  
Create a new Vitest integration test file `test/cli-entrypoint.test.js` that runs the CLI binary (`bin/dry-aged-deps.js`) with `--help` and `--version`, asserting the correct exit codes and output strings.

## NEXT  
- Add Vitest tests for untested branches in `print-outdated.js` (e.g. simulate `npm outdated` JSON parse errors, age filtering edge cases, vulnerability-check failures) to push branch coverage above 80%.  
- Add tests for JSON (`--format=json`) and XML (`--format=xml`) error and edge-case outputs (invalid format values, audit failures).  
- Update `docs/api.md` to use ESM `import` syntax and correct the package’s main entry reference.  
- Revise `README.md` to align options/flags with the implemented CLI (e.g. clarify or remove config-file support mentions).

## LATER  
- Enforce branch-coverage thresholds in CI (fail build if < 80% branches).  
- Introduce static type checking (TypeScript or JSDoc validation).  
- Resolve remaining ESLint security warnings and tighten plugin configs.  
- Configure Husky pre-commit hooks to run `npm run lint` and `npm test` before commits.