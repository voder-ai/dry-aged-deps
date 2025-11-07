# Branching and Release Workflow

This document describes the branching model and release workflow for this project.

## Branches

- `main`: production-ready code. Always stable and used for releases.
- `develop`: integration branch for ongoing development. Feature branches are created off `develop` and merged via pull requests.

## Release Tagging

Releases are tagged on `main` using semantic versioning:

1. Ensure `main` is clean and all changes are merged.
2. Update the version in `package.json` as appropriate.
3. Create a Git tag:
   ```bash
   git tag vX.Y.Z
   ```
4. Push commits and tags:
   ```bash
   git push origin main --tags
   ```

## Initial Release (v0.1.0)

The initial release has been created and tagged:
```bash
# On main branch
git checkout main

git tag v0.1.0

git push origin v0.1.0
```

Future releases will follow the same pattern. For new development, please base feature branches on `develop` and open a pull request when ready.