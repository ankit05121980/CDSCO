const tsparser = require('@typescript-eslint/parser');

/** Minimal flat ESLint config (ESLint v9). Type-checking is handled by tsc. */
module.exports = [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'no-debugger': 'error',
    },
  },
];
