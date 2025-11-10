## NOW  
Create a new unit test `test/xml-formatter.error.test.js` that calls `xmlFormatter({ error: new Error('Test failure'), code: 'E_TEST', details: 'detail text', timestamp: '2025-01-01T00:00:00Z' })` and asserts the output contains a well-formed `<error>` block with `<message>`, `<code>`, `<details>`, and the closing `</outdated-packages>` tag.

## NEXT  
- Add unit tests for the XML formatter’s thresholds section (prod/dev min-age and min-severity tags).  
- Write tests for object-style `<package>` entries in `xmlFormatter`, covering vulnerability `<details>` and correct escaping of special characters.  
- Expand `printOutdated` tests to cover the XML branch with empty rows and verify exit codes when safe updates exist or on error.  
- Add integration tests in `test/cli.format-xml.test.js` to simulate an error in mock mode and confirm the CLI emits the XML error block and exits with code 2.

## LATER  
- Introduce coverage thresholds in CI to fail if overall coverage falls below 80%.  
- Review and add missing tests for JSON formatter edge cases and table output branches.  
- Update `README.md` and docs to document the XML error format and new CLI exit-code semantics.  
- Continue filling coverage gaps for `printOutdated` logic (maturity filtering, vulnerability filtering, “all up to date” messages).