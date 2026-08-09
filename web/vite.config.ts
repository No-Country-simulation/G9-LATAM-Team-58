/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	test: {
		environment: 'jsdom',
		globals: false,
		setupFiles: ['./src/test/setup.ts'],
		css: false,
		// Fixed TZ so Intl.DateTimeFormat('es') tests are stable across machines/CI.
		env: { TZ: 'UTC' },
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html']
		}
	}
});
