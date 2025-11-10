## NOW

Modify `bin/dry-aged-deps.js` to parse a new `--format=<value>` argument (validating against `table|json|xml`), store it in a `format` variable, and forward that option into the call to `printOutdated` (e.g. `printOutdated(data, { format })`).

## NEXT

- Create a new module `src/xml-formatter.js` that takes the processed package data and generates well-formed XML according to the schema in `prompts/009.0-DEV-XML-OUTPUT.md`.
- Update `src/print-outdated.js` (or a new dispatcher) to invoke the XML formatter when `options.format === 'xml'` (falling back to table/JSON otherwise).
- Add unit tests for the XML formatter (valid XML, correct element names, proper escaping) and integration tests for `dry-aged-deps --format=xml` to verify exit codes and output.
- Enhance the CLI help text in `bin/dry-aged-deps.js` to document the `--format` option and valid values.

## LATER

- Update `README.md` and `docs/api.md` with examples of XML output and the `--format` flag.
- Add schema validation in tests (e.g. via `xmllint`) to ensure output remains well-formed.
- Consider adding an XSLT stylesheet reference or support for custom XML namespaces.
- Refine performance by streaming XML generation for large dependency sets.
