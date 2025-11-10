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

---

## Post-MVP Enhancement Stories

### Release 0.4: Configurable Thresholds

**Goal**: Allow users to customize age and security filtering behavior

**Stories**:

- **005.0-DEV-CONFIGURABLE-AGE-THRESHOLD**: Allow users to specify custom maturity age threshold
- **006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD**: Allow users to specify vulnerability severity threshold (e.g., ignore low/moderate, block high/critical)
- **007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS**: Allow different age and security thresholds for production vs development dependencies

**Success Metrics**:

- Users can set custom age threshold via CLI flag (e.g., `--min-age=14`)
- Users can set security threshold via CLI flag (e.g., `--severity=high`)
- Users can set different thresholds for prod vs dev deps (e.g., `--prod-min-age=30 --dev-min-age=7`)
- Configuration can be saved in config file (e.g., `.dry-aged-deps.json`)
- Sensible defaults maintained when no config provided

**Deliverable**: Flexible filtering configuration for different project needs

---

### Release 0.5: Machine-Readable Output

**Goal**: Enable CI/CD integration and automation with structured output formats

**Stories**:

- **008.0-DEV-JSON-OUTPUT**: Add JSON output format for programmatic consumption
- **009.0-DEV-XML-OUTPUT**: Add XML output format for compatibility with existing tools

**Success Metrics**:

- `--format=json` produces valid JSON output with all package data
- `--format=xml` produces valid XML output with all package data
- Default format remains human-readable table
- Output includes all relevant data: package name, current version, recommended version, age, vulnerability status
- Exit codes indicate whether safe updates are available (0 = no errors, 1 = updates available, 2 = error)

**Deliverable**: Structured output formats for automation and CI/CD pipelines

---

## Enhanced User Journey

```
┌──────────┐    ┌────────────┐    ┌─────────────┐    ┌──────────────┐
│ OUTDATED │ -> │ ADD AGES   │ -> │ FILTER SAFE │ -> │ FORMAT OUTPUT│
└──────────┘    └────────────┘    └─────────────┘    └──────────────┘
                                          ↑
                                    [User Config]
                              Age threshold, severity,
                              prod/dev differences
```

### Enhanced Examples

**Custom age threshold**:

```bash
dry-aged-deps --min-age=14
# Only shows packages with versions >= 14 days old
```

**Custom security threshold**:

```bash
dry-aged-deps --severity=high
# Allows packages with low/moderate vulnerabilities, blocks high/critical
```

**Different thresholds for prod vs dev**:

```bash
dry-aged-deps --prod-min-age=30 --dev-min-age=7 --prod-severity=moderate --dev-severity=high
# Stricter rules for production dependencies, relaxed for dev dependencies
```

**JSON output for CI/CD**:

```bash
dry-aged-deps --format=json
# Outputs:
{
  "packages": [
    {
      "name": "express",
      "type": "prod",
      "current": "4.17.1",
      "wanted": "4.18.1",
      "latest": "4.18.2",
      "recommended": "4.18.2",
      "age": 45,
      "vulnerabilities": {
        "count": 0,
        "maxSeverity": "none",
        "details": {
          "info": 0,
          "low": 0,
          "moderate": 0,
          "high": 0,
          "critical": 0
        }
      },
      "filtered": false,
      "filterReason": null
    }
  ],
  "summary": {
    "totalOutdated": 1,
    "safeUpdates": 1,
    "filteredByAge": 2,
    "filteredBySecurity": 1,
    "thresholds": {
      "prod": {
        "minAge": 7,
        "minSeverity": "none"
      },
      "dev": {
        "minAge": 7,
        "minSeverity": "none"
      }
    }
  },
  "timestamp": "2025-11-10T09:30:00.000Z"
}
```

**XML output**:

```bash
dry-aged-deps --format=xml
# Outputs:
<?xml version="1.0" encoding="UTF-8"?>
<outdated-packages timestamp="2025-11-10T09:30:00.000Z">
  <packages>
    <package>
      <name>express</name>
      <type>prod</type>
      <current>4.17.1</current>
      <wanted>4.18.1</wanted>
      <latest>4.18.2</latest>
      <recommended>4.18.2</recommended>
      <age>45</age>
      <vulnerabilities>
        <count>0</count>
        <max-severity>none</max-severity>
        <details>
          <info>0</info>
          <low>0</low>
          <moderate>0</moderate>
          <high>0</high>
          <critical>0</critical>
        </details>
      </vulnerabilities>
      <filtered>false</filtered>
      <filter-reason></filter-reason>
    </package>
  </packages>
  <summary>
    <total-outdated>1</total-outdated>
    <safe-updates>1</safe-updates>
    <filtered-by-age>2</filtered-by-age>
    <filtered-by-security>1</filtered-by-security>
    <thresholds>
      <prod>
        <min-age>7</min-age>
        <min-severity>none</min-severity>
      </prod>
      <dev>
        <min-age>7</min-age>
        <min-severity>none</min-severity>
      </dev>
    </thresholds>
  </summary>
</outdated-packages>
```

---

## Complete Feature Set (MVP + Enhancements)

With stories 001-009, we have a comprehensive, production-ready tool:

- ✅ Shows which packages can be safely updated (MVP)
- ✅ Protects against supply chain attacks (MVP)
- ✅ Protects against vulnerabilities (MVP)
- ✅ Simple npm outdated style output (MVP)
- ✅ Configurable age thresholds (Enhancement)
- ✅ Configurable security severity thresholds (Enhancement)
- ✅ Different rules for production vs development dependencies (Enhancement)
- ✅ JSON output for automation (Enhancement)
- ✅ XML output for tool compatibility (Enhancement)
- ✅ Config file support for team consistency (Enhancement)
