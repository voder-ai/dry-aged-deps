## NOW  
Create a `CLIOptions` interface in `src/cli-options.ts`, update `parseCliOptions` to return that type, and remove all `// @ts-expect-error` comments from that file.  

## NEXT  
- Run `npm run type-check` to verify there are no TypeScript errors in `src/cli-options.ts`.  
- Update any callers of `parseCliOptions` to use the new `CLIOptions` type, then run `npm run lint` and `npm test` to confirm everything passes.  

## LATER  
- Refactor large utility modules (e.g. `filter-by-security`, `xml-formatter-utils`) into smaller, single-responsibility files.  
- Gradually enforce stricter ESLint rules (e.g. lower `max-params`, `max-depth`).  
- Periodically scan for and remove any remaining TypeScript suppressions across the project.