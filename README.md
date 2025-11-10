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

| Flag              | Description                               |
| ----------------- | ----------------------------------------- |
| -h, --help        | Show help information                     |
| -v, --version     | Show the CLI version                      |
| --format=<format> | Output format: table (default), json, xml |
| (no flags)        | Run analysis on the current project       |

### Examples

```sh
# Show help
dry-aged-deps --help

# Show version
dry-aged-deps --version

# Analyze dependencies
dry-aged-deps
```

### Output Formats

Use the `--format` option to specify the output format:

- JSON: `dry-aged-deps --format=json`
- XML: `dry-aged-deps --format=xml`

## Advanced Usage

For programmatic API access and detailed architectural overview, see:

- docs/api.md
- docs/architecture.md

## Development

### Local Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Format code: `npm run format`

### Development Tooling (Optional)

If you're using AI development assistants (like Voder), you can configure them by:

1. Copy `.env.example` to `.env`
2. Fill in your API keys and preferences
3. The `.env` file is gitignored and will never be committed

**Note:** The `.env` file is only used by development tooling, not by the `dry-aged-deps` application itself.

## Troubleshooting

- Ensure Node.js v18 or later is installed (we're not _that_ conservative about ages)
- If you get permission errors during global installation, try using `sudo` or configure npm permissions
- Verify your package.json is valid JSON to avoid parsing errors
- Check network connectivity if npm registry requests fail

## Attribution

This project was created by [Voder - AI Coding Without the Slop](https://voder.ai).
