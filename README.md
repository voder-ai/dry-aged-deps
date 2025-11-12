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

| Flag                    | Description                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| -h, --help              | Show help information                                                                          |
| -v, --version           | Show the CLI version                                                                           |
| --format=<format>       | Output format: table (default), json, xml                                                      |
| --min-age=<days>        | Minimum age in days (1-365) for including versions (default: 7)                                |
| --prod-min-age=<days>   | Minimum age for production dependencies (falls back to --min-age)                              |
| --dev-min-age=<days>    | Minimum age for development dependencies (falls back to --min-age)                             |
| --severity=<level>      | Vulnerability severity threshold: none, low, moderate, high, critical (default: none)          |
| --prod-severity=<level> | Severity threshold for production dependencies (falls back to --severity)                      |
| --dev-severity=<level>  | Severity threshold for development dependencies (falls back to --severity)                     |
| --config-file=<file>    | Path to JSON config file (default: .dry-aged-deps.json). CLI flags override config file values |
| --check                 | Check mode: exit code 1 if safe updates available, 0 if none, 2 on error                       |
| --update                | Update dependencies to latest safe versions                                                    |
| -y, --yes               | Skip confirmation prompts (assume yes)                                                         |

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

## Advanced Usage

For programmatic API access and detailed architectural overview, see:

- docs/api.md
- docs/architecture.md

## Development

### Local Development Setup

1. Clone the repository
2. Install dependencies: `npm ci --prefer-frozen-lockfile`
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Format code: `npm run format`

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

This project was created by [Voder - AI Coding Without the Slop](https://voder.ai).
