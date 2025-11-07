## NOW
Stage and commit all pending changes to ensure the working directory is clean:
```bash
git add . && git commit -m "chore: clean working directory by committing all changes"
```

## NEXT
1. Add a standardized release script to package.json:
   ```diff
   "scripts": {
   + "release": "npm version patch && git push --follow-tags",
     "format": "prettier --write .",
     "start": "node ./bin/dry-aged-deps.js",
     // …
   }
   ```
2. Create and push a new Git tag for the current version (e.g., v0.1.1):
   ```bash
   git tag v0.1.1 && git push origin v0.1.1
   ```
3. Update docs/branching.md to document semantic‐version tagging:
   ```markdown
   ### Triggering a Release
   1. Bump version and create tag: `npm version <patch|minor|major>`
   2. Push commits and tags: `git push origin main --follow-tags`
   ```

## LATER
- Add a GitHub Actions workflow (`.github/workflows/publish.yml`) to automatically run `npm publish` on tag creation.
- Integrate a tool like semantic-release or changesets for fully automated version bumps and changelog generation.
- Enforce tag-based releases in CI (block merges until a version tag is created and pushed).