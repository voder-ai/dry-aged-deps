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
      '.cursor/',
      'node_modules/',
      'test/fixtures/',
      'test/fixtures-up-to-date/',
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
    rules: {
      // Relax complexity to allow incremental refactors; we'll ratchet this down over time
      complexity: ['error', { max: 15 }],
      'max-lines-per-function': [
        'error',
        { max: 200, skipComments: true, skipBlankLines: true },
      ],
    },
  },

  // CLI scripts - allow console usage
  {
    files: ['bin/**/*.js'],
    rules: {
      'no-console': 'off',
      'security/detect-child-process': 'off',
      complexity: 'off',
      'max-lines-per-function': 'off',
    },
  },

  // Disable console usage rule for source files
  {
    files: ['src/**/*.js'],
    rules: {
      'no-console': 'off',
      // Some src modules intentionally use dynamic paths for test fixtures/configs
      'security/detect-non-literal-fs-filename': 'off',
    },
  },

  // Disable complexity and max-lines-per-function for xml-formatter
  {
    files: ['src/xml-formatter.js'],
    rules: {
      complexity: 'off',
      'max-lines-per-function': 'off',
    },
  },

  // Disable complexity and object injection detect for filter-by-security
  {
    files: ['src/filter-by-security.js'],
    rules: {
      complexity: 'off',
      'security/detect-object-injection': 'off',
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
      // Allow unused vars in tests during incremental cleanup
      'no-unused-vars': 'off',
      complexity: 'off',
      'max-lines-per-function': 'off',
    },
  },

  // Disable complexity and max-lines-per-function for ESLint config file
  {
    files: ['eslint.config.js'],
    rules: {
      complexity: 'off',
      'max-lines-per-function': 'off',
    },
  },
];
