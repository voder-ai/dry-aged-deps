const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  // ignore common directories
  { ignores: ['node_modules/', 'dist/', 'coverage/'] },

  // language options
  {
    languageOptions: {
      globals: {
        // global variables per env
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script',
      },
    },
  },

  // apply recommended rules and security plugin
  ...compat.extends('eslint:recommended', 'plugin:security/recommended'),
];