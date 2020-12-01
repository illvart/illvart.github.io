module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'google',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  plugins: ['simple-import-sort', 'import'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    amd: true,
    node: true,
  },
  settings: {
    'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', 'json'],
    'import/resolver': {
      node: {
        extensions: [],
      },
    },
  },
  rules: {
    'require-jsdoc': 'off',
    'no-invalid-this': 'off',
    'no-useless-escape': 'off',
    'no-var': 'warn',
    'no-unused-vars': 'warn',
    'spaced-comment': 'off',
    'new-cap': 'off',
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: true,
      },
    ],
    'prettier/prettier': ['error', {}, {usePrettierrc: true}],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'always',
        jsx: 'always',
        ts: 'always',
        tsx: 'always',
      },
    ],
    'import/no-extraneous-dependencies': ['off'],
  },
};
