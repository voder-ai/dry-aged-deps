## NOW
Update the CLI options parser in `src/cli-options.js` to detect any unknown flags or invalid option values at startup, emit an error to stderr in the format specified by prompts/014.0-DEV-INVALID-OPTION-ERROR.md (e.g.  
```
Error: Unknown option '--foo'
Did you mean '--format=foo'?  
Use 'dry-aged-deps --help' to see all available options.
```  
), and immediately exit with code 2.

## NEXT
- Create a new test suite `test/cli.invalid-options.test.js` that verifies:  
  - Unknown options produce the correct stderr error message, suggestion, and exit code 2 (`REQ-UNKNOWN-OPTION-ERROR`, `REQ-DID-YOU-MEAN`, `REQ-ERROR-EXIT-CODE`).  
  - Invalid values for known options (e.g. `--format=yaml`) produce the proper “Invalid value…” message, list of valid values, and exit code 2 (`REQ-INVALID-VALUE-ERROR`).  
  - Multiple simultaneous invalid flags yield separate error messages for each and then a help prompt.  
- Annotate these new tests with the precise traceability header:  
  ```
  /**
   * Tests for invalid CLI options
   * @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
   * @req REQ-OPTION-VALIDATION - Validate known options only
   * @req REQ-UNKNOWN-OPTION-ERROR - Error on unknown options
   * @req REQ-INVALID-VALUE-ERROR - Error on invalid option values
   * @req REQ-ERROR-EXIT-CODE - Exit code 2 on usage errors
   */
  ```  
- Update `README.md` and the CLI `--help` output to include a section showing examples of invalid-option error messages and guidance to `--help`.

## LATER
- Integrate a fuzzy-match library (e.g. `leven`) in `src/cli-options.js` to power the “Did you mean…” suggestions for mistyped flags.  
- Add a Husky pre-push or CI lint rule to scan for any usage of silent flag ignores and to enforce coverage of invalid-option handling.  
- Once all tests pass and the feature is verified, remove any placeholder or scaffold code around test-traceability for story 014, and clean up related entries in `.voder/` trace logs.