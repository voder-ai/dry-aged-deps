## NOW
git push origin main

## NEXT
- Delete the untracked patch files (`patchfile`, `bin.patch`, `cli-check.patch`, `print-outdated.patch`) and commit their removal.
- Update `README.md` under **Options** and **Examples** to document the `--check` flag and clarify exit codes (0 = no updates, 1 = updates available, 2 = error).
- Enhance the CLI help text in `bin/dry-aged-deps.js` to include `--check` description and exit-code semantics.
- Update `docs/api.md` to describe the `--check` mode and its exit-code behavior.

## LATER
- Add a GitHub Actions step in `.github/workflows/ci-publish.yml` to run `dry-aged-deps --check` and fail the build when safe updates exist.
- Create a JSON Schema file (e.g. `dry-aged-deps.schema.json`) for `.dry-aged-deps.json` to enable editor validation and autocomplete.
- Explore adding finer-grained enforcement flags (e.g. `--check-prod`, `--check-dev`) in a subsequent enhancement.