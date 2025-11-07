/**
 * ESLint v9+ Flat Configuration (CommonJS)
 * 
 * ⚠️  CRITICAL: This file is EXTREMELY fragile. Read docs/eslint-flat-config.md
 *     before making ANY changes. File name MUST remain "eslint.config.cjs"
 * 
 * This configuration uses ESLint's new flat config format which:
 * - Uses an array of configuration objects instead of legacy .eslintrc format
 * - Requires specific ordering: ignores first, then base configs, then overrides
 * - Must export as CommonJS module (module.exports) not ES modules
 * - File patterns are more explicit and powerful than legacy format
 * 
 * Configuration layers (in order):
 * 1. Global ignores (dist/, build/, node_modules/, etc.)
 * 2. Main source files (src/**) with Node.js globals
 * 3. Browser-specific files with DOM globals
 * 4. Node.js config files with additional Node globals
 * 5. Test files with testing framework globals (vitest, etc.)
 * 6. Base ESLint recommended rules
 * 7. Test file overrides (relaxed rules for debugging)
 * 8. Script file configurations
 * 9. Debug script special cases
 * 
 * See docs/eslint-flat-config.md for detailed safety guidelines and common pitfalls.
 */

// ESLint v9 flat config (CommonJS)
const js = require('@eslint/js');
const globals = require('globals');

const complete = [
  // Global ignores - must be first and separate
  {
    ignores: ['dist/', 'build/', 'coverage/', 'node_modules/'],
  },
  
  // Base ESLint recommended rules
  js.configs.recommended,
  
  // Main source files - CommonJS
  {
    files: [
      'src/**/*.js',
      'bin/**/*.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
    },
  },
  
  // Config files - CommonJS  
  {
    files: [
      '*.config.js',
      '*.config.cjs',
      'eslint.config.cjs',
    ],
    languageOptions: {
      sourceType: 'commonjs', 
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
    },
  },
  
  // Test files - ES Modules (vitest uses ES modules)
  {
    files: [
      'test/**/*.js',
      '**/*.test.js',
      '**/*.spec.js',
    ],
    languageOptions: {
      sourceType: 'module', // Test files use ES modules
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        expect: 'readonly',
        describe: 'readonly', 
        it: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in tests
    },
  },
];

module.exports = complete;
