---
status: "accepted"
date: 2025-11-12
decision-makers: ["Tom Howard"]
consulted: []
informed: []
reassessment-date: 2026-11-12
---

# 0005. Semantic Release Version Management

## Context and Problem Statement

We use semantic-release to automate version management, changelog generation, and npm publishing in our CI/CD pipeline. This decision addresses how version information is managed in source control versus published packages.

### Key considerations

1. **Semantic-release philosophy**: versions are determined by commit messages, not manually set.
2. **Source of truth**: git tags represent the authoritative version history.
3. **Package distribution**: published npm packages need accurate version information.
4. **CHANGELOG management**: users and developers need clear release history.
5. **CI/CD automation**: the pipeline handles version bumps and publishing.

### Prior state

- Semantic-release runs in the CI/CD pipeline (`ci-publish.yml`).
- Configuration in `.releaserc.json` uses default plugins.
- `package.json` in the repository may not reflect the latest published version.
- CHANGELOG.md is not automatically maintained by semantic-release.

## Decision Drivers

- **Single source of truth**: git tags created by semantic-release are the authoritative version record.
- **Clean history**: avoid automated "chore: release" commits that clutter git history.
- **No conflicts**: eliminate merge conflicts from version-bump commits.
- **Standard practice**: align with semantic-release best practices for CI/CD environments.
- **Trust the process**: published packages always have correct versions; the repo version is a development placeholder.

## Considered Options

1. **Version bumps managed exclusively by semantic-release in CI; not committed back to the repository.**
2. **Commit version updates back to the repo** via `@semantic-release/git`.
3. **Manual version management** — developers update versions following semver.
4. **Keep `package.json` updated in CI but don't commit** — the same as Option 1, named separately to disambiguate.

## Decision Outcome

Chosen option: **Version bumps and `package.json` updates are managed exclusively by semantic-release in the CI/CD pipeline and are NOT committed back to the repository**, because git tags are the authoritative version record, clean history avoids automated noise, and avoiding commit-back eliminates merge conflicts.

### Rationale

1. **Single source of truth**: git tags created by semantic-release are the authoritative version record.
2. **Clean history**: avoids automated "chore: release" commits that clutter git history.
3. **No conflicts**: eliminates merge conflicts from version-bump commits.
4. **Standard practice**: aligns with semantic-release best practices for CI/CD environments.
5. **Trust the process**: published packages always have correct versions; repo version is a development placeholder.

### Semantic-release configuration

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github"
  ]
}
```

**Note**: no `@semantic-release/git` plugin, which would commit changes back to the repo.

### CI/CD workflow

1. Developer commits with a conventional commit message.
2. CI/CD runs tests and validation.
3. semantic-release analyses commits.
4. If a release is warranted:
   - Determines the next version.
   - Updates `package.json` (in CI only).
   - Creates a git tag.
   - Publishes to npm.
   - Creates a GitHub Release with notes.

### Checking versions

```bash
# Published version
npm show dry-aged-deps version

# Repository version (may be outdated)
npm pkg get version

# All published versions
npm show dry-aged-deps versions

# Git tags (version source of truth)
git tag -l "v*"
```

## Consequences

### Good

- **Clean git history**: no automated version-bump commits.
- **No merge conflicts**: version updates do not create conflicts in PRs.
- **Simplified workflow**: developers do not need to manually update versions.
- **CI/CD owned**: version management is fully automated and consistent.
- **Tag authority**: git tags clearly show all released versions.

### Neutral

- **CHANGELOG management**: the project must adopt a separate strategy for human-readable history (see CHANGELOG implications below).

### Bad

- **Repo/package version mismatch**: `package.json` version in the repo may lag behind the published version.
- **Manual CHANGELOG**: an alternative approach is needed for maintaining CHANGELOG.md.
- **Developer confusion**: may be unclear what version will be published next.
- **Tooling assumptions**: some tools expect repo and published versions to match.

### Mitigation strategies

1. **CHANGELOG management**: maintain CHANGELOG.md manually or use a separate tool.
2. **Documentation**: clearly document that git tags are the version source of truth.
3. **Version queries**: use `npm show dry-aged-deps version` to check the published version.
4. **Pre-release information**: document how to determine the next version from commits.

### CHANGELOG.md implications

With this approach to version management:

1. **CHANGELOG.md is NOT auto-generated** by semantic-release.
2. **GitHub Releases are authoritative** and auto-generated with full release notes.
3. **CHANGELOG.md becomes redundant** — semantic-release already creates comprehensive changelogs.

#### Recommendation: simplify CHANGELOG.md

Since semantic-release automatically generates detailed release notes on GitHub Releases (including version links, categorised changes, and commit links), maintaining a separate CHANGELOG.md creates duplicate effort with no added value.

**Recommended approach**: replace CHANGELOG.md with a pointer to GitHub Releases.

```markdown
# Changelog

All notable changes to this project are documented in [GitHub Releases](https://github.com/voder-ai/dry-aged-deps/releases).

Each release includes:

- Version number and date
- Categorized changes (Features, Bug Fixes, etc.)
- Links to commits and comparison views
- Automated generation from conventional commits

For historical context, see the [Releases page](https://github.com/voder-ai/dry-aged-deps/releases).
```

#### Why this makes sense

1. **Single source of truth**: GitHub Releases are already comprehensive.
2. **No duplication**: avoid maintaining two changelogs.
3. **Auto-generated quality**: semantic-release creates better changelogs than manual updates.
4. **Always current**: never gets out of sync with actual releases.
5. **Rich features**: the GitHub UI provides filtering, searching, and RSS feeds.
6. **Standard practice**: many projects using semantic-release follow this pattern.

#### If you must maintain CHANGELOG.md

If project requirements mandate a CHANGELOG.md file (for example for npm package consumers who don't use GitHub):

1. Consider adding the `@semantic-release/changelog` plugin to auto-generate it.
2. Or use `@semantic-release/git` to commit both version and changelog updates.
3. Accept the trade-off of automated commits in git history.

## Confirmation

This decision is implemented when:

1. `.releaserc.json` specifies the plugin set `commit-analyzer`, `release-notes-generator`, `npm`, `github` — and does NOT include `@semantic-release/git`.
2. The CI pipeline runs semantic-release on push to `main`.
3. Git tags exist for every published version and are the authoritative version record.
4. `package.json` in the repository is not updated by automation as part of release.
5. CHANGELOG.md either points to GitHub Releases or is not maintained as a duplicate of the GitHub Releases content.

## Pros and Cons of the Options

### Option 1 — semantic-release in CI, no commit-back (chosen)

- Good: clean git history; no automated commits.
- Good: aligned with semantic-release best practices.
- Good: no merge conflicts on version bumps.
- Bad: repo version lags behind published version.
- Bad: manual CHANGELOG strategy needed.

### Option 2 — Commit version updates back to repo

- Good: repo and published versions always match.
- Bad: creates automated commits, potential conflicts, cluttered history.
- Rejection reason: clean history and avoiding conflicts outweigh version synchronisation benefits.

### Option 3 — Manual version management

- Good: direct control, explicit version decisions.
- Bad: human error, inconsistent versioning, additional workflow steps.
- Rejection reason: automation reduces errors and ensures consistency.

### Option 4 — Keep `package.json` updated without commits (current approach, equivalent to Option 1)

- Good: clean history, simple workflow, published packages correct.
- Bad: repo version lags behind.
- Selection reason: best balance of automation, clean history, and correctness.

## Reassessment Criteria

Reassess this decision when:

- CHANGELOG maintenance becomes too burdensome.
- The repo/package version mismatch causes significant issues.
- Considering alternative release-automation tools.
- Every 12 months, or with major workflow changes.

## References

- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Release Git Plugin](https://github.com/semantic-release/git) (intentionally not used)
