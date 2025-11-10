## NOW

In `test/cli.e2e.real-fixture.test.js`, change the row-splitting line from

```js
const cols = line.split('  ');
```

to

```js
const cols = line.split('\t');
```

so the test correctly parses the tab-separated columns.

## NEXT

- Run the full test suite (`npm test`) and fix any remaining failures.
- Verify that the E2E real-fixture CLI test now passes consistently under `DRY_AGED_DEPS_MOCK=1`.
- Ensure no other tests rely on two-space splits and that all table-mode tests still pass.

## LATER

- Implement Story 007.0: separate production vs. development thresholds:
  - Add `--prod-min-age`, `--dev-min-age`, `--prod-severity`, and `--dev-severity` flags in `bin/dry-aged-deps.js`.
  - In `src/print-outdated.js`, detect each dependency’s type (`prod` vs. `dev`), apply the appropriate thresholds, and propagate `dependencyType`.
  - Add unit and CLI tests to cover the new flags and behavior.
- Update documentation (`README.md`, `--help` text) to describe the prod/dev threshold flags.
- Once prod/dev thresholds are in place, resume work on post-MVP enhancements (caching, parallel fetches, async refactor).
