## NOW
Run:
```
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky
```

## NEXT
- Initialize Husky hooks:  
  ```
  npx husky install
  ```
- Add a commit‐msg hook for commitlint:  
  ```
  npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"
  ```
- Create `commitlint.config.js` at the project root with:  
  ```js
  module.exports = { extends: ['@commitlint/config-conventional'] };
  ```
- Update `docs/developer-guidelines.md` to document the Conventional Commits format and enforce trunk-based branching (remove any “develop” branch references).
- Remove the remote and local `develop` branches to align with trunk-based development:  
  ```
  git push origin --delete develop
  git branch -d develop
  ```

## LATER
- Add a `.gitattributes` file at the root to enforce consistent line endings and diff behavior.
- Integrate `semantic-release` (or configured GitHub Action) for automated version bumping and changelog generation.
- Create `CONTRIBUTING.md` with detailed guidelines on commit message conventions, branch naming, and repository history best practices.