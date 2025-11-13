## NOW  
Add a Husky pre-push hook so that every git push runs the core quality checks locally and blocks the push on failure. Create the file `.husky/pre-push` (make sure it’s executable) containing:  
```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npx prettier --check .
npm test
```  

## NEXT  
- Add a `"prepare": "husky install"` script to `package.json` so that Husky hooks are set up on `npm install`.  
- Commit and push those changes, then run `npm install` locally to verify the `pre-push` hook is installed.  
- Update the README’s **Development** and **Git Workflow** sections (and `docs/developer-guidelines.md`) to explain that a pre-push hook runs lint, formatting, and tests before push.  

## LATER  
- Enable JSDoc type-checking by turning on `checkJs: true` in `tsconfig.json`, add a real `type-check` script (`"type-check": "tsc --noEmit"`), and include it in both the pre-push hook and CI pipeline.  
- Remove stale “coming soon” entries from CHANGELOG.md and bring it up to date with shipped features (config-file support, check mode, update mode, etc.).  
- Revise or retire ADR 0006 in `docs/decisions` to reflect the chosen type-checking approach.  
- Optionally add a duplication detector (e.g. jscpd) and an ESLint complexity rule to the pre-push hook for deeper quality enforcement.