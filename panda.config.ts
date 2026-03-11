import { defineConfig } from '@pandacss/dev';
import { colors } from './src/lib/theme/colors';

export default defineConfig({
	preflight: true,
	include: ['./src/**/*.{js,ts,svelte}'],
	exclude: [],
	theme: {
		extend: {
			semanticTokens: {
				colors
			}
		}
	},
	outdir: 'styled-system'
});
