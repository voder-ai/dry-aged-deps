// ESLint v9 flat config (CommonJS)
const js = require('@eslint/js');
const globals = require('globals');

const complete = [
  // Global ignores - must be first and separate
  {
    ignores: ['dist/', 'build/', 'coverage/', 'node_modules/', 'typescript/', 'packages/', 'apps/'],
  },
  // Main configuration
  {
    files: [
      'src/**/*.{js,ts}',
      'tests/**/*.{js,ts}',
      '**/*.test.{js,ts}',
      '**/*.spec.{js,ts}',
      '*.config.{js,ts}',
      'vite.config.{js,ts}',
      'vitest.config.{js,ts}',
      'prettier.config.{js,ts}',
      '.eslintrc.*',
      'scripts/**/*.{js,ts}',
      'eslint/**/*.{js,ts}',
      'linters/**/*.{js,ts}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        require: 'readonly',
        __filename: 'readonly',
      },
    },
  },
  // Browser/DOM files
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },
  // Node.js config files
  {
    files: ['*.config.{js,ts}', 'scripts/**/*.{js,ts}', 'config/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
      },
    },
  },
  // Testing files
  {
    files: [
      '**/*.test.{js,ts}',
      '**/*.spec.{js,ts}',
      'tests/**/*.{js,ts}',
      'config/testing/**/*.{js,ts}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
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
  },
  js.configs.recommended,
  // Additional base, dx, and performance configs would go here
  // For now, using just the JS recommended config
  // Test files: vitest + DOM globals
  {
    files: ['**/*.test.{js,ts}', 'tests/**/*.{js,ts}', 'src/testing/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        test: 'readonly',
        document: 'readonly',
        window: 'readonly',
        global: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console statements in test files for debugging
      '@typescript-eslint/no-deprecated': 'off', // Allow deprecated createElement for test mocking
      '@typescript-eslint/no-unused-vars': 'off', // Allow unused vars in test setup/teardown
    },
  },
  // Script files: Node globals
  {
    files: ['scripts/**/*.{js,ts}', '.github/scripts/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
    },
  },
  // Debug scripts: Browser + Node globals for Playwright
  {
    files: ['debug-dom.js', 'measure-heights.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
        expect: 'readonly',
        test: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow all console methods in debug scripts
      '@typescript-eslint/no-unused-vars': 'off', // Allow unused imports in debug scripts
      'simple-import-sort/imports': 'off', // Relax import sorting in debug scripts
      'padding-line-between-statements': 'off', // Relax spacing rules in debug scripts
    },
  },
];

module.exports = complete;
