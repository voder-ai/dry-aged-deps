## NOW
Add an inline ESLint disable comment in `src/fetch-version-times.js` to silence the `security/detect-object-injection` warning on the `versionTimes[version] = time;` line.

## NEXT
- Install Prettier as a dev dependency:  
  ```bash
  npm install --save-dev prettier
  ```
- Create a `.prettierrc` at the project root with your style rules, for example:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5"
  }
  ```
- Add a formatting script to `package.json`:
  ```diff
    "scripts": {
  +   "format": "prettier --write .",
      "start": "node ./bin/dry-aged-deps.js",
      "test": "vitest --coverage",
      "test:cli": "vitest",
      "lint": "eslint"
    },
  ```

## LATER
- Create a `.prettierignore` to exclude files and folders (e.g., `node_modules/`, `dist/`, `coverage/`).
- Integrate Prettier into Husky via `lint-staged` for pre-commit auto-formatting.
- Add a CI check (e.g., `npm run format -- --check`) to the GitHub Actions pipeline.
- Document the project’s formatting conventions in `docs/developer-guidelines.md`.