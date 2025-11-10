## NOW
Extend the XML formatter to support error output: in `src/xml-formatter.js`, modify the `xmlFormatter` function signature to accept an optional `error` object and, when provided, emit an `<error>` element (with `<message>`, `<code>`, `<details>`) inside the `<outdated-packages>` root per the XML Error Output schema.

## NEXT
- Update the CLI (`bin/dry-aged-deps.js`) catch handlers to detect `--format=xml`, call the enhanced `xmlFormatter({ error, timestamp })`, and then `process.exit(2)`.
- Adjust the post-print exit logic to inspect the returned `summary.safeUpdates` and use `process.exit(1)` when safe updates exist, otherwise `process.exit(0)`.
- Add unit tests for the new XML error formatting in `test/xml-formatter.test.js` and integration tests in `test/cli.format-xml.test.js` to verify both error output and exit codes.

## LATER
- Expand XML formatter coverage with tests for thresholds sections, vulnerability details, object‐style packages, and edge-case escaping.
- Update `README.md` and `docs/api.md` to document the XML error format and new exit-code semantics.
- Enforce the new exit-code behavior in CI pipelines and ensure coverage stays above the 80% thresholds.