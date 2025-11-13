## NOW  
Create a new test file `test/functional-assessment.test.js` that declares a Vitest suite with `test.todo()` entries for each user‐story (001–013) acceptance criterion to track end-to-end CLI functionality coverage.

## NEXT  
Replace each `test.todo()` in `test/functional-assessment.test.js` with real `execa('node', ['bin/dry-aged-deps.js', …])` tests that verify the CLI’s behavior (exit codes and output) against each story’s acceptance criteria (maturity filtering, security filtering, JSON/XML formats, check/update modes, config-file support, error handling, etc.), then run `npm test` to ensure all scenarios pass.

## LATER  
Once all todos are implemented and passing, remove the todo entries and promote `test/functional-assessment.test.js` to a fully automated functional-coverage suite, integrating it into CI as a required check to prevent regressions.