# User Story Map: dry-aged-deps

## Purpose
A CLI tool that wraps `npm outdated` and filters results to only show updates that are:
1. Mature (>= 7 days old)
2. Secure (no known vulnerabilities)

This protects against supply chain attacks and rushed releases.

## Context
`npm outdated` shows all available updates, but doesn't protect against:
- Supply chain attacks (compromised maintainer accounts releasing malicious versions)
- Rushed bug fixes (maintainers releasing a version, then quickly patching critical bugs)

By waiting for versions to mature (>= 7 days old) and checking for vulnerabilities, we gain confidence that the community has had time to detect issues.

---

## Simple Iteration Plan

### Iteration 1: Run npm outdated
**Value**: Get the list of outdated packages
- Run `npm outdated --json`
- Parse and display results

### Iteration 2: Add version ages
**Value**: Know how old each version is
- For each outdated package, fetch all version publish dates
- Calculate age in days for each version
- Display ages alongside versions

### Iteration 3: Filter to mature versions
**Value**: Only show mature updates (core value prop)
- For each package, filter versions to >= 7 days old
- Smart filtering: check latest first, work backwards
- Only show if mature version > current version

### Iteration 4: Filter out vulnerable versions  
**Value**: Only show safe updates (security value prop)
- Check mature versions for vulnerabilities
- Smart filtering: check newest mature first, work backwards
- Final output: npm outdated style with safe, mature updates only

---

## User Journey (Simplified)

```
┌──────────┐    ┌────────────┐    ┌─────────────┐
│ OUTDATED │ -> │ ADD AGES   │ -> │ FILTER SAFE │
└──────────┘    └────────────┘    └─────────────┘
```

### What the User Sees

**Before (npm outdated)**:
```
Package    Current    Latest     
express    4.17.1     4.18.2     
lodash     4.17.20    4.17.21    # Published 3 days ago - too fresh!
chalk      5.0.0      5.0.2      # Has vulnerabilities!
```

**After (dry-aged-deps)**:
```
Package    Current    Safe Update    Age         
express    4.17.1     4.18.2         45 days     
lodash     4.17.20    (skip)         Latest too fresh (3 days)
chalk      5.0.0      (skip)         Latest has vulnerabilities
```

---

## Release Planning

### Release 0.1: Foundation
**Goal**: Basic functionality - run npm outdated and add version ages

**Stories**:
- **001.0-DEV-RUN-NPM-OUTDATED**: Run npm outdated
- **002.0-DEV-FETCH-VERSION-AGES**: Fetch version ages for outdated packages

**Success Metrics**:
- Tool runs npm outdated successfully
- Shows age for each available version

**Deliverable**: npm outdated with age information

---

### Release 0.2: Maturity Filtering
**Goal**: Filter to mature versions only (core value)

**Stories**:
- **003.0-DEV-FILTER-MATURE-VERSIONS**: Filter to mature versions only

**Success Metrics**:
- Only shows versions >= 7 days old
- Smart filtering finds newest mature version efficiently
- Clear output when no mature versions available

**Deliverable**: npm outdated filtered for maturity

---

### Release 0.3: Security Filtering
**Goal**: Filter out vulnerable versions (security value)

**Stories**:
- **004.0-DEV-FILTER-VULNERABLE-VERSIONS**: Filter out vulnerable versions

**Success Metrics**:
- Checks mature versions for vulnerabilities
- Only recommends secure versions
- Clear output when no safe versions available

**Deliverable**: Complete safe updater showing npm outdated style output filtered for maturity AND security

---

## MVP Complete (4 Stories)

With stories 001-004, we have a complete, valuable tool:
- ✅ Shows which packages can be safely updated
- ✅ Protects against supply chain attacks (7-day rule)
- ✅ Protects against vulnerabilities (security filtering)
- ✅ Simple npm outdated style output
- ✅ Built on existing npm tools, not reinventing the wheel

---

## Future Enhancements

After MVP, could add:
- Auto-update package.json (if desired)
- Configurable maturity threshold (--min-age=14)
- JSON output for CI/CD integration
- Report generation
- Notification support
