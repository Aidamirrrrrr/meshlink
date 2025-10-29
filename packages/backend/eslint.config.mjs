import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        ignores: ['commitlint.config.js'],
    },

    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,

    {
        files: ['src/**/*.ts', 'apps/**/*.ts', 'libs/**/*.ts', 'prisma/**/*.ts'],
        languageOptions: {
            globals: { ...globals.node, ...globals.jest },
            sourceType: 'commonjs',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: { 'simple-import-sort': simpleImportSort },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',

            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports', disallowTypeAnnotations: true, fixStyle: 'inline-type-imports' },
            ],

            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                { accessibility: 'explicit', overrides: { constructors: 'no-public' } },
            ],

            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            'padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: 'import', next: '*' },
                { blankLine: 'any', prev: 'import', next: 'import' },
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: '*', next: ['if', 'for', 'switch', 'try'] },
                { blankLine: 'always', prev: ['if', 'for', 'switch', 'try'], next: '*' },
            ],

            'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
        },
    },

    {
        ...tseslint.configs.disableTypeChecked,
        files: ['test/**/*.ts', '**/*.spec.ts', '**/*.e2e-spec.ts'],
    },

    {
        files: ['test/**/*.ts', '**/*.spec.ts', '**/*.e2e-spec.ts'],
        languageOptions: {
            globals: { ...globals.node, ...globals.jest },
        },
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
        },
    },
]);
