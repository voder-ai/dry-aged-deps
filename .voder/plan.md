## NOW

Populate the root README.md with a “Getting Started” section that includes:

- A project overview
- Installation instructions (`npm install -g dry-aged-deps`)
- Basic CLI usage examples showing `-h/--help`, `-v/--version`, and default run

## NEXT

- Add at the top of README.md a build-status badge pointing to the GitHub Actions “build” workflow on `main`.
- Under “Getting Started,” link to `docs/api.md` and `docs/architecture.md` for advanced usage and architecture details.
- Document the CLI options in a table (flags, descriptions) and include a brief “Troubleshooting” note.
- Run `npm run format` to apply Prettier formatting to the updated README.md.

## LATER

- Introduce badges for coverage and npm version in README.md.
- Generate and publish HTML docs from the `docs/` folder via GitHub Pages.
- Add a “Contributing” section with links to issue and PR templates.
- Automate parts of README assembly (e.g., version and badge injection) in future CI steps.
