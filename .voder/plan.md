## NOW  
Run Prettier on the remaining unformatted files to restore formatting and satisfy the Prettier‐check CI gate:  
```bash
npx prettier --write README.md docs/developer-guidelines.md eslint.config.js
```  

## NEXT  
- Stage and commit the formatting fixes, then push all local commits to `origin/main`:  
  ```bash
  git add README.md docs/developer-guidelines.md eslint.config.js
  git commit -m "chore: apply Prettier formatting to docs and config"
  git push origin main
  ```  
- Lower the ESLint complexity threshold in `eslint.config.js` from `25` to `20` and run `npm run lint` to identify any new violations.  
- Fix any complexity, max-lines-per-function, or unused-vars errors now reported in `src/print-outdated.js` and `src/cli-options-helpers.js`.  

## LATER  
- Refactor or split up large functions in `src/print-outdated.js` and `src/cli-options-helpers.js` to reduce cyclomatic complexity and file size.  
- Add a Husky pre-commit hook that runs `npm run format` on staged files to enforce formatting automatically.  
- Continue incremental tightening of ESLint rules (e.g., lower max-lines-per-function, remove overrides) and refactor as needed.