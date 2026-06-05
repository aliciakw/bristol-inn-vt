import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import security from 'eslint-plugin-security';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // Global ignores
  {
    ignores: ['dist/', 'node_modules/', '.astro/', 'studio-bristol-inn-vt/'],
  },

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      security,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...tsPlugin.configs['strict'].rules,
      ...security.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Astro files — flat/recommended sets up the Astro parser automatically
  ...astroPlugin.configs['flat/recommended'],
  {
    files: ['**/*.astro'],
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
    },
  },

  // Declaration files — triple-slash references are idiomatic here
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },

  // JavaScript / config files
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
    },
  },
];
