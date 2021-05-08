module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-import-helpers'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    'no-console': ['warn'],
    '@typescript-eslint/ban-ts-comment': [0],
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: [
          // enforce import ordering that prevents module detection issues
          'module',
          '/^~/',
          ['parent', 'sibling', 'index'],
        ],
        alphabetize: { order: 'asc', ignoreCase: true },
      },
    ],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
  overrides: [
    {
      files: ['*.(unit|spec|e2e|e2e-spec).ts'],
      rules: {
        'no-console': 0,
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
      },
    },
  ],
};
