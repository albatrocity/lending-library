import { defineConfig } from '@pandacss/dev';
import { animationStyles } from './src/lib/theme/animation-styles';
import { colors } from './src/lib/theme/colors';
import { keyframes } from './src/lib/theme/keyframes';
import { layerStyles } from './src/lib/theme/layer-styles';
import { textStyles } from './src/lib/theme/text-styles';
import { globalTokens } from './src/lib/theme/tokens';
import { zIndex } from './src/lib/theme/z-index';
import * as recipes from './src/lib/theme/recipes';

export default defineConfig({
	preflight: true,
	include: ['./src/**/*.{js,ts,svelte}'],
	exclude: [],
	theme: {
		extend: {
			tokens: {
				zIndex
			},
			semanticTokens: {
				colors: {
					...colors,
					...globalTokens
				}
			},
			keyframes,
			animationStyles,
			textStyles,
			layerStyles,
			recipes
		}
	},
	outdir: 'styled-system',
	staticCss: {
		recipes: {
			input: ['*'],
			textarea: ['*']
		}
	}
});
