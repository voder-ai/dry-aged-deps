import js from '@eslint/js';
import globals from 'globals';
import security from 'eslint-plugin-security';
import traceability from 'eslint-plugin-traceability';

export default [
  // Global ignores - must be first and separate
  {
    ignores: [
      'dist/',
      'build/',
      'coverage/',
      '.cursor/',
      'node_modules/',
      'test/fixtures/**',
      'test/fixtures-up-to-date/**',
      'commitlint.config.cjs',
      '.voder/',
      '*.patch',
      '*.diff',
      '*.md',
      'docs/**',
      'prompts/**',
      '.gitignore',
      '.gitattributes',
      '.env',
      '.env.example',
      '.github/**',
      'scripts/**',
      'report/**',
      '**/*.json',
      '.husky/**',
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
    files: ['src/**/*.js', 'bin/**/*.js'],
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
      'max-lines-per-function': ['error', { max: 80, skipComments: true, skipBlankLines: true }],
      'max-params': ['error', 5],
      'max-depth': ['error', 4],
      'max-lines': ['error', { max: 350, skipComments: true, skipBlankLines: true }],
    },
  },

  // Config files - disable complexity, max-lines-per-function, and max-lines
  {
    files: ['*.config.js'],
    rules: {
      complexity: 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
    },
  },

  // CLI scripts - allow console usage
  {
    files: ['bin/**/*.js'],
    rules: {
      'no-console': 'off',
      'security/detect-child-process': 'off',
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
    plugins: {
      traceability,
    },
    rules: {
      'no-console': 'off', // Allow console in tests
      'security/detect-non-literal-fs-filename': 'off',
      // Allow unused vars in tests during incremental cleanup
      'no-unused-vars': 'off',
      complexity: 'off',
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'max-depth': 'off',
      'max-lines': 'off',
      // Traceability rules for test files
      'traceability/require-story-annotation': 'error',
      'traceability/require-req-annotation': 'error',
      'traceability/valid-story-reference': [
        'error',
        {
          storyDirectories: ['prompts'],
          allowAbsolutePaths: false,
          requireStoryExtension: false, // Our story files are .md not .story.md
        },
      ],
      // Disable format validation - our format is prompts/NNN.0-DEV-NAME.md not docs/stories/NN.N-DEV-NAME.story.md
      'traceability/valid-annotation-format': 'off',
    },
  },
];