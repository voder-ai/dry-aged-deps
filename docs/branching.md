# Branching and Release Workflow

This project follows **trunk-based development** principles as advocated by DORA (DevOps Research and Assessment) and Jez Humble's Continuous Delivery practices.

## Trunk-Based Development

**All commits go directly to `main`.**

There are no long-lived feature branches or separate `develop` branch. This approach:
- Minimizes merge conflicts
- Enables continuous integration
- Reduces batch size of changes
- Supports rapid feedback loops
- Aligns with high-performing engineering teams (per DORA metrics)

## Quality Gates

### Pre-Commit Quality Checks

Before committing to `main`, developers **must** run and pass local quality checks:

```bash
npm run lint    # Code quality and style checks
npm test        # All tests with coverage thresholds
```

These checks ensure that code is safe to commit. **Never commit code that fails these checks.**

### CI/CD Pipeline

After pushing to `main`, the CI/CD pipeline automatically:

1. **Runs all quality checks** (lint, tests, security scan, CodeQL)
2. **Validates the build** on a clean environment
3. **Blocks if any check fails** - investigate and fix immediately
4. **Automatically publishes** if all checks pass (when version bumped)

**Critical Rule**: If CI/CD fails, stop all other work and fix it immediately. A broken main branch blocks everyone.

## Workflow

### Making Changes

1. Make your changes on `main` branch
2. Run quality checks locally:
   ```bash
   npm run lint
   npm test
   ```
3. Commit when checks pass:
   ```bash
   git add .
   git commit -m "descriptive message"
   ```
4. Push to `main`:
   ```bash
   git push origin main
   ```
5. **Monitor the CI/CD pipeline** and ensure it completes successfully
6. If pipeline fails, fix immediately

### Why No Feature Branches?

Trunk-based development works because:
- **Small commits**: Changes are small and frequent
- **Quality checks**: Pre-commit checks prevent broken code
- **Fast feedback**: CI/CD runs within minutes
- **Continuous integration**: Code integrates continuously, not in large batches
- **Feature flags**: Use feature flags for incomplete features, not branches

## Release Process

Releases happen automatically through the CI/CD pipeline using semantic versioning.

### Triggering a Release

1. Ensure all changes are committed and CI/CD is green
2. Update version in `package.json`:
   ```bash
   npm version patch  # or minor, or major
   ```
3. Push the version commit and tag:
   ```bash
   git push origin main --follow-tags
   ```
4. CI/CD detects the version tag and automatically publishes to npm

### Semantic Versioning

- **Patch** (0.0.x): Bug fixes, no breaking changes
- **Minor** (0.x.0): New features, no breaking changes  
- **Major** (x.0.0): Breaking changes

## Monitoring

Use GitHub CLI to monitor pipeline status:

```bash
# Check recent runs
gh run list --limit 5 | cat

# View specific run
gh run view <run-id> | cat

# Watch for failures
gh run watch
```

## Best Practices

### Small, Frequent Commits

- Commit multiple times per day
- Each commit should be a complete, working change
- Use meaningful commit messages

### Test First

- Write tests for new functionality
- Ensure tests pass before committing
- Maintain coverage thresholds (80%)

### Fix Forward

- If something breaks in production, fix it forward
- Don't revert unless absolutely necessary
- Learn from incidents and improve checks

### Continuous Integration

- Pull from `main` frequently (multiple times per day)
- Keep your working copy up to date
- Integrate your changes quickly

## Why This Works

This approach aligns with research from the DORA State of DevOps reports and Continuous Delivery principles:

1. **High deployment frequency**: Can deploy multiple times per day
2. **Low lead time**: Changes go from commit to production quickly
3. **Low change failure rate**: Quality gates catch issues before production
4. **Fast recovery**: Small changes are easy to fix if issues occur

## References

- [DORA Metrics](https://dora.dev/)
- [Continuous Delivery](https://continuousdelivery.com/) by Jez Humble
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
