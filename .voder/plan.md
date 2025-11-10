## NOW  
Add a `--min-age=<days>` flag to `bin/dry-aged-deps.js`: parse and validate it as a positive integer (1–365) and pass the resulting `minAge` into `printOutdated` instead of using the hard-coded 7-day value.

## NEXT  
- Introduce a `--severity=<level>` flag in `bin/dry-aged-deps.js`, validate against `none`, `low`, `moderate`, `high`, `critical`, and pass it as `minSeverity` to `printOutdated`.  
- Update `printOutdated` to consume `options.minAge` and `options.minSeverity` when filtering by age and vulnerability.  
- Write unit tests for both CLI flags and their validation logic (valid/invalid values, defaults).

## LATER  
- Add support for a `.dry-aged-deps.json` config file (`{ minAge, minSeverity }`) and implement precedence: CLI flags > config file > defaults.  
- Implement separate prod/dev thresholds: add `--prod-min-age`, `--dev-min-age`, `--prod-severity`, `--dev-severity`, detect dependency type in `printOutdated`, and apply the correct thresholds.  
- Update CLI help text and README with new options and add integration tests for config-file and prod/dev behavior.