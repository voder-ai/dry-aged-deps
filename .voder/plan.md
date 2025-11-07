## NOW  
Create a `package.json` file in the project root with minimal metadata (name, version), a `bin` entry for `dry-aged-deps`, and a `"start"` script.

## NEXT  
- Create `bin/dry-aged-deps.js` with a Unix shebang (`#!/usr/bin/env node`), import `child_process`, run `npm outdated --json`, parse its output, and print a simple table of outdated packages.  
- Make `bin/dry-aged-deps.js` executable.  
- Update `package.json` to include any needed dependencies (none for now) and a `"cli"` script (e.g. `"cli": "node bin/dry-aged-deps.js"`).

## LATER  
- Add unit and integration tests for the CLI (using Vitest + Execa).  
- Configure ESLint and Prettier for code quality and auto-formatting.  
- Write CI workflows to run lint, tests, and then publish on tag.  
- Expand the CLI to calculate version ages and apply the 7-day maturity filter.