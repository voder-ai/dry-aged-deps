## NOW
Modify `eslint.config.js` to change the complexity rule from  
```js
complexity: ['error', { max: 50 }],
```  
to  
```js
complexity: ['error', { max: 45 }],
```  

## NEXT
- Run ESLint to find any functions above the new threshold:  
  ```bash
  npx eslint src --rule 'complexity:["error",{"max":45}]'
  ```  
- Refactor the highest-complexity functions—starting with `src/print-outdated.js`—by extracting sub-logic into helper modules so each function’s complexity is ≤15 and length is ≤200 lines.  
- Install and configure duplication detection in CI:  
  1. `npm install --save-dev jscpd`  
  2. Add a workflow step:  
     ```yaml
     - name: Detect duplicate code
       run: npx jscpd src --threshold 5%
     ```  

## LATER
- Gradually lower `max-lines-per-function` (e.g., 200 → 180 → … → 100) and refactor code to comply.  
- Enable stricter ESLint rules for `max-params` and `max-nested-callbacks` and refactor accordingly.  
- Remove remaining `@ts-nocheck` pragmas by completing JSDoc annotations and rerunning `tsc --noEmit` until no errors.