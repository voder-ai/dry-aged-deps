## NOW  
In eslint.config.js, change the complexity rule from  
```js
complexity: ['error', { max: 30 }]
```  
to  
```js
complexity: ['error', { max: 25 }]
```  

## NEXT  
- Run ESLint with the new threshold to identify remaining violations:  
  ```bash
  npx eslint src --rule 'complexity:["error",{"max":25}]'
  ```  
- Refactor the top offenders (for example, in src/print-outdated.js and src/cli-options-helpers.js) by extracting nested logic into smaller helper functions so each function’s cyclomatic complexity is ≤ 25.  
- Consolidate duplicate validation code in src/cli-options-helpers.js into shared utilities to further reduce complexity.

## LATER  
- Gradually lower the complexity threshold (e.g. to 20 then 15) and refactor additional modules as needed.  
- Introduce stricter ESLint rules (e.g. `max-params`, `max-nested-callbacks`, tighter `max-lines-per-function`) and address any new violations.  
- Remove remaining `// @ts-nocheck` pragmas and enforce full TypeScript/JSDoc type checking across all files.