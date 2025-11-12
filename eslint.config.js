/**
 * ESLint v9+ Flat Configuration (ES Modules)
 *
 * ⚠️  CRITICAL: This file is EXTREMELY fragile. Read docs/eslint-flat-config.md
 *     before making ANY changes. File name MUST remain "eslint.config.js"
 *
 * This configuration uses ESLint's new flat config format which:
 * - Uses an array of configuration objects instead of legacy .eslintrc format
 * - Requires specific ordering: ignores first, then base configs, then overrides
 * - Must export as ES module (export default) since project uses ES modules
 * - File patterns are more explicit and powerful than legacy format
 *
 * Configuration layers (in order):
 * 1. Global ignores (dist/, build/, coverage/, node_modules/, test/fixtures/, .voder/, *.patch, *.diff)
 * 2. Base ESLint recommended rules
 * 3. Enable ESLint Security plugin recommended rules
 * 4. All source files use ES modules (src/**, bin/**, test/**, config files)
 * 5. CLI scripts override (console allowed)
 * 6. Test files with additional testing globals
 *
 * See docs/eslint-flat-config.md for detailed safety guidelines and common pitfalls.
 */

import js from '@eslint/js';
import globals from 'globals';
import security from 'eslint-plugin-security';

export default [
  // Global ignores - must be first and separate
  {
    ignores: [
      'dist/',
      'build/',
      'coverage/',
      'node_modules/',
      'test/fixtures/',
      'commitlint.config.cjs',
      '.voder/',
      '*.patch',
      '*.diff',
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // Enable ESLint Security plugin recommended rules
  {
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      // Allow unused vars if they start with underscore
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // All JavaScript files - ES Modules
  {
    files: [
      'src/**/*.js',
      'bin/**/*.js',
      'test/**/*.js',
      '**/*.test.js',
      '**/*.spec.js',
      '*.config.js',
    ],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
    },
  },

  // CLI scripts - allow console usage
  {
    files: ['bin/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },

  // Test files with additional testing globals
  {
    files: ['test/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      sourceType: 'module',
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
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
];