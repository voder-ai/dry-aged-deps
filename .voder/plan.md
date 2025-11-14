## NOW  
In `src/cli-options-helpers.js`, update the `parseMinAgeFlag` call to enforce a maximum of 365 days (e.g. change `parseIntegerFlag(args, 'min-age', defaultMinAge, 1)` to `parseIntegerFlag(args, 'min-age', defaultMinAge, 1, 365)`).

## NEXT  
- In `src/config-loader.js`, add validation so that any `minAge` value loaded from the config file is also constrained to 1–365, with clear error messages on violation.  
- Write unit tests to verify that `--min-age=366`, `--min-age=0`, and non-numeric inputs are rejected with exit code 2.  
- Update the CLI help text in `bin/dry-aged-deps.js` and the README.md to state that `--min-age` must be an integer between 1 and 365.

## LATER  
- Apply the same 1–365 enforcement to `--prod-min-age` and `--dev-min-age` flags and their config counterparts.  
- Enhance the generic integer-flag parser to accept dynamic bounds so other flags (e.g. severity thresholds) can reuse it.  
- Add integration tests covering out-of-range values in both CLI flags and config files across table, JSON, and XML modes.