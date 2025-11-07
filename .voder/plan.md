## NOW
Create a `README.md` in the project root containing the project title, a brief description, **Installation** instructions (`npm install -g dry-aged-deps`), **Usage** examples (`dry-aged-deps`, `dry-aged-deps --help`), and **Contribution Guidelines** (fork → branch → PR workflow).

## NEXT
- Add badges (npm version, build status, coverage) at the top of `README.md`.  
- Commit the new `README.md` to version control.  
- Create a `CHANGELOG.md` placeholder with a “## [0.1.0] – YYYY-MM-DD” entry.

## LATER
- Write unit tests for core functions (e.g., `printOutdated`) in a new `src/` directory.  
- Configure ESLint (`.eslintrc.js`) and Prettier (`.prettierrc`) and add `lint`/`format` scripts to `package.json`.  
- Add a GitHub Actions workflow to run linting, tests, and publish on tag creation.  
- Begin implementing version‐age fetching and 7-day maturity filtering per the story map.