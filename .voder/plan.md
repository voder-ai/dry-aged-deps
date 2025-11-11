## NOW  
Add detailed documentation for the remaining public API functions—`checkVulnerabilities`, `printOutdated`, `jsonFormatter`, and `xmlFormatter`—to `docs/api.md`.

## NEXT  
- Revise `docs/architecture.md` to match the real directory layout (including `src/index.js`, `src/print-outdated.js`, and test folders) and remove references to missing files.  
- Update `README.md` to remove stale config-file content and add the standardized exit-code descriptions under “Options.”  
- Create new ADRs in `docs/decisions/` for JSON/XML output support, exit-code standardization, and check-mode behavior.

## LATER  
- Synchronize `docs/developer-guidelines.md` with the updated docs and code changes (module exports, CLI flags).  
- If config-file support is reintroduced, document the `.dry-aged-deps.json` schema and precedence rules; otherwise remove any residual references.  
- Add a JSON schema (`.dry-aged-deps.schema.json`) for editor validation/autocomplete (optional enhancement).