## NOW
In `.github/workflows/ci-publish.yml`, re-enable test traceability validation by inserting the following step immediately after the lint job:
```yaml
- name: Validate traceability
  run: npm run validate-traceability
```

## NEXT
- Add the missing JSDoc `@story` and `@req` annotations to test/printOutdated.json.test.js and test/printOutdated.update.test.js.  
- Remove any `eslint-disable` for traceability in test/printOutdated.extra.test.js.  
- Correct the malformed JSDoc header in test/build-rows.additional.test.js.  
- Run `npm run lint`, `npm run validate-traceability`, and `npm test`, then fix any remaining traceability errors before committing.

## LATER
- Update the Husky pre-push hook to include `npm run validate-traceability` so missing annotations are caught locally.  
- Monitor traceability coverage in CI and configure alerts if it falls below 90%.  
- Once traceability is stable, review other test files for additional edge-case coverage.