## NOW
Modify `src/print-outdated.js` so that in the `catch` block around `fetchVersionTimes` it emits a warning with `console.error`, for example:
```js
catch (err) {
  console.error(`Warning: failed to fetch version times for ${name}: ${err.message}`);
}
```

## NEXT
- Add a unit test in `test/printOutdated.test.js` asserting that when `fetchVersionTimes` throws, `console.error` is called with the expected message and `calculateAgeInDays` is not invoked.  
- Update `docs/api.md` to document that `printOutdated` will warn on version-time fetch failures.  
- Run `npm test` to verify all tests pass and coverage remains acceptable.

## LATER
- Refine CLI error-handling to use specific exit codes for fetch failures.  
- Introduce integration tests simulating malformed `npm outdated` output and verify CLI error output.  
- Revisit and tighten coverage thresholds or add edge-case tests for other error scenarios.