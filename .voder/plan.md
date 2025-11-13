## NOW  
Run Prettier to auto-fix all formatting issues:  
```bash
npx prettier --write .
```

## NEXT  
- Run ESLint with auto-fix to correct lint errors:  
  ```bash
  npx eslint . --ext .js --max-warnings=0 --fix
  ```  
- Run the type checker and resolve any JSDoc/type errors:  
  ```bash
  npm run type-check
  ```  
- Stage and commit all code-quality changes:  
  ```bash
  git add .
  git commit -m "chore: apply formatting, lint and type fixes"
  ```  
- Push the commit to the remote repository:  
  ```bash
  git push
  ```

## LATER  
- Configure a Husky pre-commit hook (via lint-staged) to run Prettier and ESLint --fix on staged files automatically.  
- Add strict Prettier and ESLint checks to the CI pipeline and fail builds on violations.  
- Review and tune ESLint complexity and max-lines-per-function rules for maintainability.