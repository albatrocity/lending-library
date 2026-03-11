import { defineSemanticTokens } from '@pandacss/dev';

/**
 * Global semantic color aliases — role-based tokens that reference the color
 * palette layer (gray, primary, etc.) rather than raw Tailwind scale values.
 * Recipes and components reference these instead of palette names directly,
 * so swapping the underlying palette is a one-line change here.
 */
export const globalTokens = defineSemanticTokens.colors({
	fg: {
		DEFAULT: { value: { base: '{colors.gray.900}', _dark: '{colors.gray.50}' } },
		muted: { value: { base: '{colors.gray.600}', _dark: '{colors.gray.400}' } },
		subtle: { value: { base: '{colors.gray.400}', _dark: '{colors.gray.600}' } }
	},
	bg: {
		DEFAULT: { value: { base: '{colors.gray.100}', _dark: '{colors.gray.800}' } },
		subtle: { value: { base: '{colors.gray.100}', _dark: '{colors.gray.700}' } }
	},
	border: {
		DEFAULT: { value: { base: '{colors.gray.200}', _dark: '{colors.gray.700}' } }
	},
	error: {
		DEFAULT: { value: { base: '{colors.red.500}', _dark: '{colors.red.400}' } }
	}
});
