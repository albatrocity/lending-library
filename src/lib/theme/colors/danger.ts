import { defineSemanticTokens } from '@pandacss/dev';

export const danger = defineSemanticTokens.colors({
	solid: {
		bg: {
			DEFAULT: { value: { base: '{colors.red.600}', _dark: '{colors.red.700}' } },
			hover: { value: { base: '{colors.red.700}', _dark: '{colors.red.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.gray.50}', _dark: '{colors.gray.50}' } }
		}
	},
	subtle: {
		bg: {
			DEFAULT: { value: { base: '{colors.red.100}', _dark: '{colors.red.900}' } },
			hover: { value: { base: '{colors.red.200}', _dark: '{colors.red.800}' } },
			active: { value: { base: '{colors.red.300}', _dark: '{colors.red.700}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.red.700}', _dark: '{colors.red.300}' } }
		}
	},
	surface: {
		bg: {
			DEFAULT: { value: { base: '{colors.red.50}', _dark: '{colors.red.950}' } },
			active: { value: { base: '{colors.red.100}', _dark: '{colors.red.900}' } }
		},
		border: {
			DEFAULT: { value: { base: '{colors.red.300}', _dark: '{colors.red.700}' } },
			hover: { value: { base: '{colors.red.400}', _dark: '{colors.red.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.red.700}', _dark: '{colors.red.300}' } }
		}
	},
	outline: {
		bg: {
			hover: { value: { base: '{colors.red.50}', _dark: '{colors.red.950}' } },
			active: { value: { base: '{colors.red.100}', _dark: '{colors.red.900}' } }
		},
		border: {
			DEFAULT: { value: { base: '{colors.red.400}', _dark: '{colors.red.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.red.700}', _dark: '{colors.red.300}' } }
		}
	},
	plain: {
		bg: {
			hover: { value: { base: '{colors.red.100}', _dark: '{colors.red.900}' } },
			active: { value: { base: '{colors.red.200}', _dark: '{colors.red.800}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.red.700}', _dark: '{colors.red.300}' } }
		}
	}
});
