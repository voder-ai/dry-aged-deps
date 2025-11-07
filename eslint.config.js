import { FlatCompat } from '@eslint/eslintrc';

// Compat layer to load legacy config in flat config
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // ignore common directories
  { ignores: ['node_modules/', 'dist/', 'coverage/'] },

  // environment and parser options
  {
    env: {
      node: true,
      es2021: true,
      'vitest/globals': true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
    },
  },

  // apply recommended rules and security plugin
  ...compat.extends('eslint:recommended', 'plugin:security/recommended'),
];