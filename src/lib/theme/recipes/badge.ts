import { defineRecipe } from '@pandacss/dev';

export const badge = defineRecipe({
	className: 'badge',
	base: {
		display: 'inline-flex',
		alignItems: 'center',
		borderRadius: 'full',
		fontWeight: 'medium',
		lineHeight: '1',
		px: '2',
		py: '1',
		textStyle: 'xs',
		whiteSpace: 'nowrap'
	},
	defaultVariants: {
		status: 'unavailable'
	},
	variants: {
		status: {
			borrowed: {
				bg: 'primary.subtle.bg',
				color: 'primary.subtle.fg'
			},
			unavailable: {
				bg: 'bg.subtle',
				color: 'fg.muted'
			}
		}
	}
});
