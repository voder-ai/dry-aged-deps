## NOW
Refactor `src/print-outdated.js` so that `printOutdated` is an `async` function and uses `Promise.all` to fetch version times in parallel for all packages instead of calling `fetchVersionTimes` sequentially.

## NEXT
- Convert `fetchVersionTimes` in `src/fetch-version-times.js` into an `async` function that uses `child_process.execFile` wrapped in a `Promise` instead of `execFileSync`.
- Update `bin/dry-aged-deps.js` to `await` the now-async `printOutdated` call and handle its promise before calling `process.exit`.
- Modify existing tests and add new ones to mock and await the asynchronous `printOutdated` and `fetchVersionTimes` behaviors.

## LATER
- Introduce an in-memory cache inside `fetchVersionTimes` to dedupe identical `npm view` calls during a single run.
- Add a CLI option (e.g. `--concurrency`) to limit the number of parallel version-time fetches.
- Benchmark the performance on large dependency sets and add a CI check to guard against performance regressions.