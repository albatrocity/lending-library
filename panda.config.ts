import { defineConfig } from '@pandacss/dev';
import { colors } from './src/lib/theme/colors';
import { combobox } from './src/lib/theme/recipes/combobox';
import { tagsInput } from './src/lib/theme/recipes/tags-input';

export default defineConfig({
	preflight: true,
	include: ['./src/**/*.{js,ts,svelte}'],
	exclude: [],
	theme: {
		extend: {
			semanticTokens: {
				colors
			},
			recipes: {
				combobox,
				tagsInput
			}
		}
	},
	outdir: 'styled-system'
});
