# dry-aged-deps

[![Build Status](https://github.com/voder-ai/dry-aged-deps/actions/workflows/ci-publish.yml/badge.svg?branch=main)](https://github.com/voder-ai/dry-aged-deps/actions/workflows/ci-publish.yml)

CLI tool to calculate the "age" of your npm dependencies and identify outdated packages.

## Getting Started

### Installation

```sh
npm install -g dry-aged-deps
```

### Usage

```sh
dry-aged-deps
```

This will analyze your project's dependencies and output a list of outdated packages with the number of days since their latest release.

### Options

| Flag          | Description                         |
| ------------- | ----------------------------------- |
| -h, --help    | Show help information               |
| -v, --version | Show the CLI version                |
| (no flags)    | Run analysis on the current project |

### Examples

```sh
# Show help
dry-aged-deps --help

# Show version
dry-aged-deps --version

# Analyze dependencies
dry-aged-deps
```

## Advanced Usage

For programmatic API access and detailed architectural overview, see:

- docs/api.md
- docs/architecture.md

## Troubleshooting

- Ensure Node.js v18 or later is installed.
- If you get permission errors during global installation, try using `sudo` or configure npm permissions.
- Verify your package.json is valid JSON to avoid parsing errors.
- Check network connectivity if npm registry requests fail.
