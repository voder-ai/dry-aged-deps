## NOW  
Run `npm install --save-dev vitest execa` to add the testing framework and CLI‐process helper.

## NEXT  
- Update package.json with scripts:  
  • `"test": "vitest"`  
  • `"test:cli": "vitest --threads=false"`  
- Create a `vitest.config.js` configured for a Node environment.  
- Add `test/helpers/cli-helper.js` using Execa to spawn the CLI.  
- Scaffold an initial integration test in `test/cli.test.js` that runs `dry-aged-deps --help` and asserts exit code 0.

## LATER  
- Write unit tests for core functions (e.g., `printOutdated`).  
- Set up ESLint and Prettier with configuration files and lint/format scripts.  
- Create a GitHub Actions workflow to run lint, tests, and publish on tag.  
- Proceed with implementing version‐age fetching and 7-day maturity filtering.