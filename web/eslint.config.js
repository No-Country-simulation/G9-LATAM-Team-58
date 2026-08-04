import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
			eslintPluginPrettierRecommended
		],
		languageOptions: {
			globals: globals.browser
		},
		rules: {
			'@next/next/no-img-element': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'react-refresh/only-export-components': 'off',
			// Config única en .prettierrc (fuente de verdad)
			'prettier/prettier': 'error',
			'react/react-in-jsx-scope': 'off',
			'eol-last': ['error', 'always'],
			semi: ['error', 'always'],
			'react/prop-types': 'off',
			quotes: ['error', 'single', { avoidEscape: true }],
			'no-trailing-spaces': 'error',
			'no-tabs': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': ['warn']
		}
	}
]);
