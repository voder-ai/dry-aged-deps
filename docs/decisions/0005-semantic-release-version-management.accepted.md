# 0005. Semantic Release Version Management

Date: 2025-11-12

## Status

Accepted

## Context

We use semantic-release to automate version management, changelog generation, and npm publishing in our CI/CD pipeline. This decision addresses how version information is managed in source control versus published packages.

### Key Considerations

1. **Semantic Release Philosophy**: Versions are determined by commit messages, not manually set
2. **Source of Truth**: Git tags represent the authoritative version history
3. **Package Distribution**: Published npm packages need accurate version information
4. **CHANGELOG Management**: Users and developers need clear release history
5. **CI/CD Automation**: The pipeline handles version bumps and publishing

### Current State

- Semantic-release runs in the CI/CD pipeline (`ci-publish.yml`)
- Configuration in `.releaserc.json` uses default plugins
- `package.json` in the repository may not reflect the latest published version
- CHANGELOG.md is not automatically maintained by semantic-release

## Decision

**Version bumps and package.json updates are managed exclusively by semantic-release in the CI/CD pipeline and are NOT committed back to the repository.**

### Rationale

1. **Single Source of Truth**: Git tags created by semantic-release are the authoritative version record
2. **Clean History**: Avoids automated "chore: release" commits that clutter git history
3. **No Conflicts**: Eliminates merge conflicts from version bump commits
4. **Standard Practice**: Aligns with semantic-release best practices for CI/CD environments
5. **Trust the Process**: Published packages always have correct versions; repo version is a development placeholder

## Consequences

### Positive

- **Clean Git History**: No automated version bump commits
- **No Merge Conflicts**: Version updates don't create conflicts in PRs
- **Simplified Workflow**: Developers don't need to manually update versions
- **CI/CD Owned**: Version management is fully automated and consistent
- **Tag Authority**: Git tags clearly show all released versions

### Negative

- **Repo/Package Version Mismatch**: `package.json` version in the repo may lag behind published version
- **Manual CHANGELOG**: Need alternative approach for maintaining CHANGELOG.md
- **Developer Confusion**: May be unclear what version will be published next
- **Tooling Assumptions**: Some tools expect repo and published versions to match

### Mitigation Strategies

1. **CHANGELOG Management**: Maintain CHANGELOG.md manually or use a separate tool
2. **Documentation**: Clearly document that git tags are the version source of truth
3. **Version Queries**: Use `npm show dry-aged-deps version` to check published version
4. **Pre-release Information**: Document how to determine next version from commits

## Implementation Notes

### Semantic Release Configuration

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

**Note**: No `@semantic-release/git` plugin, which would commit changes back to the repo.

### CHANGELOG.md Management

Since semantic-release doesn't update CHANGELOG.md in our configuration, we must:

1. **Manual Updates**: Update CHANGELOG.md when making significant changes
2. **GitHub Releases**: Primary source of release notes (automated by semantic-release)
3. **Repo CHANGELOG**: Acts as a summary; GitHub releases are authoritative
4. **Version References**: Don't include specific version numbers in development documentation

### Checking Versions

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

### CI/CD Workflow

1. Developer commits with conventional commit message
2. CI/CD runs tests and validation
3. Semantic-release analyzes commits
4. If release warranted:
   - Determines next version
   - Updates package.json (in CI only)
   - Creates git tag
   - Publishes to npm
   - Creates GitHub release with notes

## Alternatives Considered

### Commit Version Updates Back to Repo

Using `@semantic-release/git` plugin to commit version bumps.

- **Pros**: Repo and published versions always match
- **Cons**: Creates automated commits, potential conflicts, cluttered history
- **Rejection Reason**: Clean history and avoiding conflicts outweigh version synchronization benefits

### Manual Version Management

Developers manually update versions following semantic versioning.

- **Pros**: Direct control, explicit version decisions
- **Cons**: Human error, inconsistent versioning, additional workflow steps
- **Rejection Reason**: Automation reduces errors and ensures consistency

### Keep package.json Updated Without Commits

Update package.json in CI but don't commit (current approach).

- **Pros**: Clean history, simple workflow, published packages correct
- **Cons**: Repo version lags behind
- **Selection Reason**: Best balance of automation, clean history, and correctness

## CHANGELOG.md Implications

With this approach to version management:

1. **CHANGELOG.md is NOT auto-generated** by semantic-release
2. **Manual maintenance required** for CHANGELOG.md entries
3. **GitHub Releases are authoritative** for detailed release notes
4. **CHANGELOG.md should be high-level**, focusing on user-facing changes
5. **Update timing**: Update CHANGELOG.md when merging features/fixes, not tied to version numbers
6. **Use `## Unreleased` section**: Document changes before they're released

### Recommended CHANGELOG Format

```markdown
# Changelog

## Unreleased

### Added
- New features not yet released

### Fixed
- Bug fixes not yet released

## [0.4.7] - 2025-11-11
### Fixed
- Vulnerability scan step updated

## [0.4.6] - 2025-11-10
...
```

## References

- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Release Git Plugin](https://github.com/semantic-release/git) (intentionally not used)

## Review Schedule

This decision should be reviewed:

- If CHANGELOG maintenance becomes too burdensome
- If repo/package version mismatch causes significant issues
- When considering alternative release automation tools
- Every 12 months or with major workflow changes
