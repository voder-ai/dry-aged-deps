## NOW  
Run the following command to push all local commits to origin:  
```bash
git push origin main
```

## NEXT  
- Add a new entry for version 0.1.1 in CHANGELOG.md describing the recent bugfixes and improvements.  
- Update README.md to link out to the docs/ folder (API Reference, Architecture, Developer Guidelines) and add “npm run lint” and “npm test” under a **Development** or **Contributing** section.  

## LATER  
- Implement a pre-push Git hook (via Husky) that runs `git status --porcelain` and fails if there are uncommitted or unpushed changes.  
- Automate releases with semantic-release or GitHub Actions so version bumps and changelog updates occur on tag creation.  
- Add a coverage badge and link to the coverage report in README.md.