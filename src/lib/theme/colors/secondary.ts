import { defineSemanticTokens } from '@pandacss/dev';

export const secondary = defineSemanticTokens.colors({
	solid: {
		bg: {
			DEFAULT: { value: { base: '{colors.slate.500}', _dark: '{colors.slate.700}' } },
			hover: { value: { base: '{colors.slate.600}', _dark: '{colors.slate.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.white}', _dark: '{colors.slate.50}' } }
		}
	},
	subtle: {
		bg: {
			DEFAULT: { value: { base: '{colors.slate.100}', _dark: '{colors.slate.900}' } },
			hover: { value: { base: '{colors.slate.200}', _dark: '{colors.slate.800}' } },
			active: { value: { base: '{colors.slate.300}', _dark: '{colors.slate.700}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.slate.700}', _dark: '{colors.slate.300}' } }
		}
	},
	surface: {
		bg: {
			DEFAULT: { value: { base: '{colors.slate.50}', _dark: '{colors.slate.950}' } },
			active: { value: { base: '{colors.slate.100}', _dark: '{colors.slate.900}' } }
		},
		border: {
			DEFAULT: { value: { base: '{colors.slate.300}', _dark: '{colors.slate.700}' } },
			hover: { value: { base: '{colors.slate.400}', _dark: '{colors.slate.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.slate.700}', _dark: '{colors.slate.300}' } }
		}
	},
	outline: {
		bg: {
			hover: { value: { base: '{colors.slate.50}', _dark: '{colors.slate.950}' } },
			active: { value: { base: '{colors.slate.100}', _dark: '{colors.slate.900}' } }
		},
		border: {
			DEFAULT: { value: { base: '{colors.slate.400}', _dark: '{colors.slate.600}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.slate.700}', _dark: '{colors.slate.300}' } }
		}
	},
	plain: {
		bg: {
			hover: { value: { base: '{colors.slate.100}', _dark: '{colors.slate.900}' } },
			active: { value: { base: '{colors.slate.200}', _dark: '{colors.slate.800}' } }
		},
		fg: {
			DEFAULT: { value: { base: '{colors.slate.700}', _dark: '{colors.slate.300}' } }
		}
	}
});
