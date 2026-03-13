import type { RecipeConfig } from '@pandacss/dev';

export const input = {
	className: 'input',
	jsx: ['Input', 'Field.Input'],
	base: {
		appearance: 'none',
		borderRadius: 'sm',
		height: 'var(--input-height)',
		outline: '0',
		position: 'relative',
		textAlign: 'start',
		transition: 'colors',
		width: '100%',
		_disabled: {
			layerStyle: 'disabled'
		}
	},
	defaultVariants: {
		size: 'md',
		variant: 'outline'
	},
	variants: {
		variant: {
			outline: {
				borderWidth: '1px',
				borderColor: 'border',
				focusVisibleRing: 'inside',
				_invalid: {
					focusRingColor: 'error',
					borderColor: 'error'
				}
			}
		},
		size: {
			xs: { textStyle: 'sm', px: '2', '--input-height': 'sizes.8' },
			sm: { textStyle: 'sm', px: '2.5', '--input-height': 'sizes.9' },
			md: { textStyle: 'md', px: '3', '--input-height': 'sizes.10' },
			lg: { textStyle: 'md', px: '3.5', '--input-height': 'sizes.11' },
			xl: { textStyle: 'xl', px: '4', '--input-height': 'sizes.12' }
		}
	}
} as const satisfies RecipeConfig;
