# 🥩 dry-aged-deps

> Like a fine steak, some dependencies are better aged. Unlike a fine steak, malicious ones won't just give you food poisoning.

[![Build Status](https://github.com/voder-ai/dry-aged-deps/actions/workflows/ci-publish.yml/badge.svg?branch=main)](https://github.com/voder-ai/dry-aged-deps/actions/workflows/ci-publish.yml)

## ⚠️ The Problem

Running `npm outdated` shows you _every_ available update, but that's a bit like drinking wine straight from the fermenting vat. Not all updates are ready for consumption:

- **Supply chain attacks**: Compromised maintainer accounts can push malicious versions
- **Rushed releases**: That "critical bug fix" released 2 hours ago might need its own bug fix in 3 hours

You need time to let the community kick the tires, spot the issues, and validate that a new version is actually safe to use.

## ✨ The Solution

`dry-aged-deps` wraps `npm outdated` and filters results to only show updates that are both:

1. **Mature** (≥7 days old by default) - giving the community time to catch issues
2. **Secure** (no known vulnerabilities) - because sometimes old things go bad

Think of it as `npm outdated` with a patience and a security guard.

**What's new**: opt-in [exposure-aware soak](#exposure-aware-soak) shortens the per-package maturity window when you are sitting on a Critical or High `npm audit` exposure — pull fixes sooner without manually overriding `--min-age=0`.

## 🚀 Getting Started

### Installation

```sh
npm install -g dry-aged-deps
```

### Usage

```sh
dry-aged-deps
```

**What you get:**

- Packages with versions ≥7 days old (not that rushed release from yesterday)
- No known vulnerabilities (because security matters)
- npm outdated-style output (familiar format, better filtering)

### Options

| Flag                    | Description                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| -h, --help              | Show help information                                                                                                                                                                |
| -v, --version           | Show the CLI version                                                                                                                                                                 |
| --format=<format>       | Output format: table (default), json, xml                                                                                                                                            |
| --min-age=<days>        | Minimum age in days (1-365) for including versions (default: 7)                                                                                                                      |
| --prod-min-age=<days>   | Minimum age for production dependencies (falls back to --min-age)                                                                                                                    |
| --dev-min-age=<days>    | Minimum age for development dependencies (falls back to --min-age)                                                                                                                   |
| --severity=<level>      | Vulnerability severity threshold: none, low, moderate, high, critical (default: none)                                                                                                |
| --prod-severity=<level> | Severity threshold for production dependencies (falls back to --severity)                                                                                                            |
| --dev-severity=<level>  | Severity threshold for development dependencies (falls back to --severity)                                                                                                           |
| --config-file=<file>    | Path to JSON config file (default: .dry-aged-deps.json). CLI flags override config file values                                                                                       |
| --check                 | Check mode: exit code 1 if safe updates available (including override pins with a safe upgrade target), 0 if none, 2 on error (consistent across table, JSON, and XML formats)       |
| --update                | Update dependencies to latest safe versions                                                                                                                                          |
| -y, --yes               | Skip confirmation prompts (assume yes)                                                                                                                                               |
| --no-overrides-hygiene  | Disable the package.json overrides hygiene surface (default: on). See [Overrides hygiene](#overrides-hygiene) below.                                                                 |
| --exposure-aware-soak   | Enable exposure-aware soak: shorten the per-package maturity window under Critical/High current vuln exposure (default: off). See [Exposure-aware soak](#exposure-aware-soak) below. |

### Examples

```sh
# Show help
dry-aged-deps --help

# Show version
dry-aged-deps --version

# Analyze dependencies with default settings (7 days old, no vulnerabilities)
dry-aged-deps

# Require updates to be at least 14 days old
dry-aged-deps --min-age=14

# Apply stricter rules to production dependencies
dry-aged-deps --prod-min-age=30 --dev-min-age=7

# Allow low/moderate vulnerabilities in dev dependencies, but not production
dry-aged-deps --prod-severity=none --dev-severity=moderate

# Combine age and severity thresholds
dry-aged-deps --prod-min-age=30 --prod-severity=none --dev-min-age=7 --dev-severity=high

# Preview update (requires confirmation)
dry-aged-deps --update

# Apply updates without confirmation
dry-aged-deps --update --yes

# Check for safe updates (exit code 1 if safe updates available, including override pins with a safe upgrade target; 0 if none; 2 on error — consistent across table, JSON, and XML formats)
dry-aged-deps --check

# Specify a custom configuration file
dry-aged-deps --config-file=custom-config.json

# Check using a specific configuration file
dry-aged-deps --check --config-file=custom-config.json

# Opt out of the overrides hygiene surface (default: on)
dry-aged-deps --no-overrides-hygiene

# Opt in to exposure-aware soak (shortens per-package maturity window under Critical/High current exposure)
dry-aged-deps --exposure-aware-soak

# Combine with stricter prod soak — exposure shortening only applies to packages with current exposure
dry-aged-deps --exposure-aware-soak --prod-min-age=30
```

```sh
# Example: using a configuration file
# Create a .dry-aged-deps.json file:
cat << 'EOF' > .dry-aged-deps.json
{
  "minAge": 14,
  "severity": "low",
  "prod": {
    "minAge": 30,
    "minSeverity": "moderate"
  },
  "dev": {
    "minAge": 7,
    "minSeverity": "high"
  },
  "format": "table"
}
EOF

# Run without flags to use config file values
dry-aged-deps
```

### Invalid option error examples

```sh
$ dry-aged-deps --json
Error: Unknown option '--json'
Did you mean '--format=json'?
Use 'dry-aged-deps --help' to see all available options.

$ dry-aged-deps --format=yaml
Error: Invalid format: yaml. Valid values are: table, json, xml
Use 'dry-aged-deps --help' for more information.
```

### Output Formats

Use the `--format` option to specify the output format:

- JSON: `dry-aged-deps --format=json`
- XML: `dry-aged-deps --format=xml`

## CI/CD Integration

To enforce dependency freshness in your CI/CD pipeline, use the `--check` flag. Below is an example GitHub Actions workflow that checks for safe updates, fails on detection, and shows available updates on failure:

```yaml
# GitHub Actions - Enforce dependency freshness
name: Check Dependencies
on: [pull_request]

jobs:
  check-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for outdated dependencies
        run: npx dry-aged-deps --check
        # Fails if safe updates are available

      - name: Show available updates on failure
        if: failure()
        run: npx dry-aged-deps --format=json
```

## Exit Codes

- `0`: No safe updates available (success).
- `1`: Safe updates available (failure). Fires when a safe direct-dependency upgrade exists, **or** when a `package.json` `overrides` pin has a safe upgrade target available (see [Overrides hygiene](#overrides-hygiene) below). Override pins that are stale or vulnerable without a safe upgrade target surface informationally and do **not** widen this trigger — they match the [unfixable](#known-vulnerabilities-without-safe-fix) precedent.
- `2`: Execution error (invalid input or unexpected exceptions).

### Overrides hygiene

`dry-aged-deps` parses the `package.json` `overrides` block on every run (default on; `--no-overrides-hygiene` to opt out). Each pinned override is aged against the npm registry and cross-referenced against `npm audit` advisory ranges. Findings render in the table / JSON / XML outputs under `Override hygiene` / `overridesHygiene` / `<overridesHygiene>`. A finding with a non-null `safeUpgrade` field counts toward the `--check` exit-1 trigger (above); findings without a safe upgrade target are informational.

### Exposure-aware soak

`dry-aged-deps` waits `--min-age` days before recommending an update — a cheap proxy for "this release has been vetted." But when you are sitting on a known-vulnerable version and the fix is fresh, the right wait is shorter, not longer. `--exposure-aware-soak` (opt-in, default off) shortens the per-package maturity window in proportion to your current `npm audit` exposure severity:

| Current exposure severity | Maturity-window modifier    |
| ------------------------- | --------------------------- |
| Critical                  | 0.0 × default (0-day floor) |
| High                      | 0.5 × default               |
| Moderate / Low / None     | 1.0 × default (unchanged)   |

The modifier scales whatever `--min-age` you set — it does not hard-code a 7-day base. A `--min-age=14` operator under Critical exposure sees the same 0-day floor; under High exposure they see 7 days. Sibling packages without current exposure preserve the full operator-set minimum age. This is the per-package alternative to the global `--min-age=0` workaround.

**Composition with `--severity`**: the two axes are orthogonal. `--severity` / `--prod-severity` / `--dev-severity` gate whether the candidate version is clean (a candidate carrying a vuln is excluded regardless of how old it is). `--exposure-aware-soak` scales the maturity window for the version you are currently sitting on. The cleanness gate runs before the age gate — a vulnerable candidate still fails cleanness even when Critical current exposure would otherwise relax the age gate.

**Exit-code semantics unchanged**: `--check` exits 1 when safe updates are available. The modifier shifts which updates qualify as safe (an exposure-modified row joins the safe-update set when the floor is met), but does not add a new exit-1 trigger.

**Default-off rationale**: this preserves JTBD-006 (Trust that the default policy is sensibly safe) for non-opt-in users — out-of-the-box behaviour is unchanged on this minor. The opt-in path extends JTBD-001 (See which dependencies have safe updates available) to the inverse case where a fix is too fresh to clear the unconditional age gate, but the current exposure warrants surfacing it anyway. Graduation to opt-out is a v2 decision requiring its own ADR and changelog entry — see the v2 graduation triggers below.

**v2 graduation triggers**:

1. `--exposure-aware-soak` enabled in CI for at least one calendar month with no operator-reported regression of trust or safety expectations.
2. No locked-policy violations observed (Critical → 0 and High → 0.5 hold across opt-in usage).
3. Evidence that the policy materially reduced operator override frequency (`--min-age=0`-by-hand cases) without surfacing previously-hidden risk.

If any trigger fails or evidence accumulates that the locked policy needs amendment, the v2 ADR records the policy change before the default flips.

These exit codes are consistent across table, JSON, and XML output.

## Advanced Usage

For programmatic API access and detailed architectural overview, see:

- docs/api.md
- docs/architecture.md

## Development

### Local Development Setup

1. Clone the repository
2. Install dependencies: `npm ci --prefer-frozen-lockfile`
3. Install Git hooks: `npm run prepare`
4. The pre-push hook now enforces commitlint, lockfile drift check, lint, type-check, formatting checks, unit tests, CLI tests, duplicate code detection, and vulnerability scan before allowing a push.
5. Run tests: `npm test`
6. Run linter: `npm run lint`
7. Run type-check: `npm run typecheck`
8. Validate code and tests: `npm run validate`
9. Format code: `npm run format`

### Development Tooling (Optional)

If you're using AI development assistants (like Voder), you can configure environment variables by:

1. Copy `.env.example` to `.env`
2. Open `.env` and replace the placeholder values with your actual API keys, tokens, and preferences
3. The `.env` file is gitignored and will never be committed

See `.env.example` for the full list of required environment variables.

**Note:** The environment variables in `.env` are only used by development tooling and do not affect the `dry-aged-deps` application at runtime.

## Troubleshooting

- Ensure Node.js v18 or later is installed (we're not _that_ conservative about ages)
- If you get permission errors during global installation, try using `sudo` or configure npm permissions
- Verify your package.json is valid JSON to avoid parsing errors
- Check network connectivity if npm registry requests fail
- For a complete security audit including development dependencies, run `npm audit --audit-level=moderate` (omit the `--production` flag).

## Attribution

Created autonomously by [voder.ai](https://voder.ai)
