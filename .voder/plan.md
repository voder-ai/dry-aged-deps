## NOW  
Create a new unit test (`test/filter-by-security.smart-search.test.js`) that asserts when the newest mature version is vulnerable, `filterBySecurity` falls back to the next‐newest mature version and sets that as the recommended safe version.

## NEXT  
- Implement the smart‐search loop in `src/filter-by-security.js` (or via a helper) to:  
  1. Accept the full list of mature versions for each package (using `fetchVersionTimes` + `calculateAgeInDays`).  
  2. Iterate from newest to oldest: call `checkVulnerabilities`; on first safe version, mark it `recommended` and include its row.  
  3. If no safe version found, record the package as filtered by security.  
- Update `print-outdated-handlers.js` (JSON/XML/table) to output the `recommended` version instead of always using `wanted`.  
- Run the full test suite, ensure the new smart‐search test now passes alongside existing tests.  
- Commit the changes with a descriptive message, e.g.  
  `feat: implement smart-search fallback for secure, mature versions (story 004.0)`

## LATER  
- Refactor the smart‐search logic into a dedicated helper function to reduce complexity and re‐enable complexity rules.  
- Optimize performance by checking vulnerabilities for multiple packages in parallel, while preserving per‐package order.  
- Update documentation (README, API reference) to describe the “fallback to next-newest mature version” behavior and examples.  
- Monitor real-world usage and add metrics/logging on how often and for which packages fallbacks occur to guide threshold tuning.