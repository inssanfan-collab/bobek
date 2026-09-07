import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  // next-env.d.ts генерируется Next и правится только им.
  { ignores: ['.next/**', 'node_modules/**', 'tests/e2e/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Правило относится к pages router; в App Router шрифты подключаются в layout.
      '@next/next/no-page-custom-font': 'off',
      // Подчёркивание — принятая пометка «значение намеренно не используется».
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
];

export default config;
