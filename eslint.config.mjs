import eslintBetterTailwindCss from 'eslint-plugin-better-tailwindcss';
import eslintJs from '@eslint/js';
import eslintJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintNextJs from '@next/eslint-plugin-next';
import eslintPerfectionist from 'eslint-plugin-perfectionist';
import eslintPrettier from 'eslint-config-prettier';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import eslintReactSnob from 'eslint-plugin-react-snob';
import eslintTestingLibrary from 'eslint-plugin-testing-library';
import eslintTypescript from 'typescript-eslint';
import eslintTypescriptParser from '@typescript-eslint/parser';
import eslintVitest from '@vitest/eslint-plugin';
import globals from 'globals';

export default eslintTypescript.config([
  // typescript config
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      globals: globals.browser,
      parser: eslintTypescriptParser,
      parserOptions: { cmaFeatures: { jsx: true }, project: true, sourceType: 'module' },
    },
  },
  // global ignores
  {
    ignores: ['*.config.{js,cjs,mjs,ts, cts, mts}', 'src/lib/db/scripts/**/*.ts'],
  },
  // plugins
  eslintJs.configs.recommended,
  {
    plugins: {
      '@next/next': eslintNextJs,
    },
    rules: {
      ...eslintNextJs.configs['core-web-vitals'].rules,
      ...eslintNextJs.configs.recommended.rules,
    },
  },
  {
    plugins: {
      'react-hooks': eslintReactHooks,
    },
    rules: {
      ...eslintReactHooks.configs.recommended.rules,
    },
  },
  {
    ...eslintReact.configs.flat.recommended,
    settings: {
      react: {
        version: '19.1.0',
      },
    },
  },
  eslintJsxA11y?.flatConfigs.recommended,
  eslintTypescript.configs.recommendedTypeChecked,
  eslintPrettier,
  eslintPerfectionist.configs['recommended-natural'],
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'better-tailwindcss': eslintBetterTailwindCss,
    },
    rules: {
      ...eslintBetterTailwindCss.configs['recommended-warn'].rules,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/app/globals.css',
      },
    },
  },
  {
    ...eslintReactSnob.configs.strict,
  },
  // testing library config for component tests (exclude E2E and integration tests)
  {
    files: ['tests/**/*.{ts,tsx}'],
    ignores: ['tests/e2e/**/*.{ts,tsx}', 'tests/integration/**/*.{ts,tsx}'],
    ...eslintTestingLibrary.configs['flat/react'],
  },
  // vitest config for unit/integration/component tests (exclude E2E which uses Playwright)
  {
    files: ['tests/**/*.{ts,tsx}'],
    ignores: ['tests/e2e/**/*.{ts,tsx}'],
    plugins: {
      vitest: eslintVitest,
    },
    rules: {
      ...eslintVitest.configs.recommended.rules,
    },
  },
  // customize rules
  {
    rules: {
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': 'off',
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      eqeqeq: 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-snob/no-inline-styles': 'off',
      'react-snob/require-derived-conditional-prefix': 'off',
      'react-snob/require-boolean-prefix-is': [
        'error',
        {
          allowedPrefixes: ['as', 'can', 'has', 'is', 'should', 'was', 'will'],
        },
      ],
      '@next/next/no-img-element': 'off',
    },
  },
]);
