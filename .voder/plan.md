## NOW
Refactor the duplicated parsing logic in `src/cli-options-helpers.js` into a single shared helper to eliminate the code clone.

## NEXT
- Update `docs/api.md` so the **checkVulnerabilities** section describes the real return shape (`count`, `vulnerabilities`, `details`).  
- Commit or stash all non-`.voder/` changes and push them to `main` to clean the working directory.

## LATER
- Add JSDoc annotations for `xmlFormatter` and the `print-outdated` handlers so `tsc --noEmit` passes without warnings.  
- Document the programmatic `updateMode` option in `docs/api.md` and create an ADR for the auto-update design.