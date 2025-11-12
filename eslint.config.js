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
  },

  // CLI scripts - allow console usage
  {
    files: ['bin/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },

  // Disable console usage rule for source files
  {
    files: ['src/**/*.js'],
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
