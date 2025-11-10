## NOW  
Short-circuit JSON/XML modes in `print-outdated.js`: before any `fetchVersionTimes` or vulnerability checks, detect if `options.format` is `json` or `xml`, build rows directly from the incoming `data`, assemble a minimal summary, call `jsonFormatter`/`xmlFormatter`, and `console.log()` the result, then return immediately.  

## NEXT  
- Update `jsonFormatter` and `xmlFormatter` (in `src/json-formatter.js` and `src/xml-formatter.js`) to ensure they output all required fields (packages array, summary.totalOutdated, summary.safeUpdates, summary.filteredByAge, summary.filteredBySecurity, thresholds, timestamp) according to stories 008 and 009.  
- Revise the CLI entrypoint (`bin/dry-aged-deps.js`) help text and `README.md` to document `--format=json` and `--format=xml` options with examples.  
- Re-run and verify the JSON/XML integration tests (`test/cli.format-json.test.js` and `test/cli.format-xml.test.js`) now pass promptly with no stderr and valid machine-readable output.  

## LATER  
- Restore the true network-backed logic under JSON/XML modes, fetching version times and auditing vulnerabilities in parallel, adding caching where necessary to keep performance within CI timeouts.  
- Introduce proper exit-code handling (0/1/2) and structured error output for JSON/XML.  
- Extend JSON/XML schemas to include detailed vulnerability counts, per-environment thresholds (prod/dev), and make the age/security thresholds fully configurable via CLI flags and config files.