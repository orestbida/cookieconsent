import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: ['dist/**', 'docs/**', 'playground/**', 'tests/**', 'node_modules/**']
    },
    {
        files: ['src/**/*.js'],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            'indent': ['warn', 4],
            'quotes': ['warn', 'single'],
            'semi': ['warn', 'always'],
            'no-unused-vars': ['warn']
        }
    }
];
