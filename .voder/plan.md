## NOW
Update the Husky pre-push hook (​.husky/pre-push​) to insert the commit-message lint step (`npx --no-install commitlint --from=HEAD~1 --to=HEAD`) immediately after the existing `husky.sh` invocation.

## NEXT
- Stage and commit the updated `.husky/pre-push` with a descriptive message, e.g.  
  `ci: add commitlint to pre-push for commit message validation`  
- Run `npm run prepare` to install the new hook locally  
- Attempt a push with an invalid commit message to verify the hook blocks it, then push a valid commit to confirm the hook passes  
- Update **docs/developer-guidelines.md** “Pre-push Hook” section to document the new commit-message lint check  

## LATER
- Extract all pre-push commands into a reusable script `scripts/prepush.sh` and invoke that from `.husky/pre-push` for maintainability  
- Add a CI job that runs the pre-push script in a clean environment to ensure hook/pipeline parity  
- Periodically review and prune the pre-push script as CI requirements evolve (adjust thresholds, remove retired checks)