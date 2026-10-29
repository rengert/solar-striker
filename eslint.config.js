// @ts-check
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const functionName = require('eslint-plugin-function-name');

module.exports = tseslint.config(
  {
    ignores: ['**/*polyfills.ts'],
  },
  {
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
    plugins: {
      'function-name': functionName,
    },
    extends: [...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      eqeqeq: ['error', 'always'],
      'function-name/starts-with-verb': [
        'error',
        {
          whitelist: ['ng', 'spawn', 'hit', 'shot', 'collide', 'resize', 'migrate'],
        },
      ],
      'max-params': ['error', 4],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/naming-convention': 'error',
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-floating-promises': 'error',
      'no-nested-ternary': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'no-console': 'error',
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-duplicate-imports': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'no-useless-rename': 'error',
      'no-implicit-coercion': ['error', { allow: ['!!'] }],
      'spaced-comment': ['error', 'always', { exceptions: ['-'] }],
      'no-magic-numbers': ['error', { ignore: [0, 1], enforceConst: true }],
      'consistent-return': 'error',
      radix: 'error',
      'default-case': 'error',
      'no-alert': 'error',
      'no-underscore-dangle': ['error', { allowAfterThis: true }],
      'no-return-await': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-readonly': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  },
);
