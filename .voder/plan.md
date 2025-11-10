## NOW  
Update `src/xml-formatter.js` to emit the complete XML schema from 009.0: for each `<package>` include `<recommended>`, a full `<vulnerabilities>` block (with `<count>`, `<max-severity>`, `<details>`), `<filtered>`, and `<filter-reason>` elements, and in the `<summary>` emit `<thresholds>` with nested `<prod>` and `<dev>` sections as specified.

## NEXT  
- In `src/print-outdated.js`, change the XML branch to assemble and pass the enriched package objects (including recommended version, vulnerability details, filter flags, filter reasons, and dependency type) plus the full thresholds config into `xmlFormatter`, and adjust exit codes (1 for updates available, 2 for errors) in XML mode.  
- Expand `test/xml-formatter.test.js` and `test/cli.format-xml.test.js` (or add new tests) to assert presence and correctness of all new XML elements, proper error‐output formatting (`<error>` element), and that no console noise is emitted.

## LATER  
- Update CLI help text in `bin/dry-aged-deps.js` and examples in `README.md` to document the new XML schema fields, exit‐code semantics, and usage.  
- Add CI validation (e.g. using `xmllint` or a custom validator) to verify XML output against the schema on each run, and integrate XML output into reporting or dashboards.