import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		// Prevent accidental Node polyfills in Edge/browser bundle
		alias: [
			// prevent Node polyfills from creeping into Edge bundles
			{ find: 'node:crypto', replacement: path.resolve('src/shims/empty.ts') },
			{ find: 'crypto', replacement: path.resolve('src/shims/empty.ts') },
			{ find: 'node:buffer', replacement: path.resolve('src/shims/empty.ts') },
			{ find: 'buffer', replacement: path.resolve('src/shims/empty.ts') },
			{ find: 'node:stream', replacement: path.resolve('src/shims/empty.ts') },
			{ find: 'stream', replacement: path.resolve('src/shims/empty.ts') },
			{ find: 'node:util', replacement: path.resolve('src/shims/empty.ts') },
			{ find: 'util', replacement: path.resolve('src/shims/empty.ts') },
		],
		// If another dep re-imports `jose`, force one instance
		dedupe: ['jose']
	},
	ssr: {
		// Bundle `jose` once for SSR/Edge instead of externalizing + prebundling two variants
		noExternal: ['jose']
	},
	optimizeDeps: {
		// Avoid prebundling `jose` separately; keeps one copy
		exclude: ['jose']
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
