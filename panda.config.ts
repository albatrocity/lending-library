import { defineConfig } from '@pandacss/dev';

export default defineConfig({
	// Whether to use css reset
	preflight: true,

	// Where to look for your css declarations
	include: ['./src/**/*.{js,ts,svelte}'],

	// Files to exclude
	exclude: [],

	// Useful for theme customization
	theme: {
		extend: {
			semanticTokens: {
				colors: {
					primary: {
						value: { base: '{colors.lime.500}', _dark: '{colors.lime.700}' }
					}
				}
			}
		}
	},

	// The output directory for your css system
	outdir: 'styled-system'
});
