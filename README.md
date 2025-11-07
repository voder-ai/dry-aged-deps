![npm](https://img.shields.io/npm/v/dry-aged-deps)
![build](https://img.shields.io/github/actions/workflow/status/voder-ai/dry-aged-deps/ci.yml?branch=main)
![coverage](https://img.shields.io/coveralls/github/voder-ai/dry-aged-deps?branch=main)

# dry-aged-deps

A CLI tool to list outdated npm dependencies and display how long they have been outdated, helping maintainers identify stale packages.

## Installation

```sh
npm install -g dry-aged-deps
```

## Usage

```sh
dry-aged-deps
dry-aged-deps --help
```

## Usage & Examples

Run the CLI:

```sh
dry-aged-deps
```

Sample output:

```txt
Outdated packages:
Name	Current	Wanted	Latest	Age (days)
express	4.16.0	4.18.2	4.18.2	600
lodash	4.17.15	4.17.21	4.17.21	120
```

## Exit Codes

- 0: Successful execution. This includes cases where outdated packages are found, all dependencies are up-to-date, or when the help flag is used.
- 1: Fatal error. This occurs when there is an error running `npm outdated`, or when parsing the `npm outdated` JSON output fails.

## Contribution Guidelines

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: description of your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request
6. Ensure CI tests pass and address any feedback
