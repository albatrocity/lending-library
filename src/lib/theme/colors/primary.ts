import { defineSemanticTokens } from '@pandacss/dev';

export const primary = defineSemanticTokens.colors({
	solid: {
		bg: {
			DEFAULT: { value: { base: '{colors.lime.500}', _dark: '{colors.lime.700}' } },
			hover: { value: { base: '{colors.lime.600}', _dark: '{colors.lime.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.gray.900}', _dark: '{colors.gray.50}' } }
		}
	},
	subtle: {
		bg: {
			DEFAULT: { value: { base: '{colors.lime.100}', _dark: '{colors.lime.900}' } },
			hover: { value: { base: '{colors.lime.200}', _dark: '{colors.lime.800}' } },
			active: { value: { base: '{colors.lime.300}', _dark: '{colors.lime.700}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.lime.700}', _dark: '{colors.lime.300}' } }
		}
	},
	surface: {
		bg: {
			DEFAULT: { value: { base: '{colors.lime.50}', _dark: '{colors.lime.950}' } },
			active: { value: { base: '{colors.lime.100}', _dark: '{colors.lime.900}' } }
		},
		border: {
			DEFAULT: { value: { base: '{colors.lime.300}', _dark: '{colors.lime.700}' } },
			hover: { value: { base: '{colors.lime.400}', _dark: '{colors.lime.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.lime.700}', _dark: '{colors.lime.300}' } }
		}
	},
	outline: {
		bg: {
			hover: { value: { base: '{colors.lime.50}', _dark: '{colors.lime.950}' } },
			active: { value: { base: '{colors.lime.100}', _dark: '{colors.lime.900}' } }
		},
		border: {
			DEFAULT: { value: { base: '{colors.lime.400}', _dark: '{colors.lime.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.lime.700}', _dark: '{colors.lime.300}' } }
		}
	},
	plain: {
		bg: {
			hover: { value: { base: '{colors.lime.100}', _dark: '{colors.lime.900}' } },
			active: { value: { base: '{colors.lime.200}', _dark: '{colors.lime.800}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.lime.700}', _dark: '{colors.lime.300}' } }
		}
	}
});
