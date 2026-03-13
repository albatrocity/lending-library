import { defineTextStyles } from '@pandacss/dev';

export const textStyles = defineTextStyles({
	xs: {
		description: 'Used for small text',
		value: {
			fontSize: 'xs',
			fontWeight: 'medium',
			lineHeight: 'tight'
		}
	},
	sm: {
		description: 'Used for small text',
		value: {
			fontSize: 'sm',
			fontWeight: 'medium',
			lineHeight: 'tight'
		}
	},
	md: {
		description: 'Used for medium text',
		value: {
			fontSize: 'md',
			fontWeight: 'medium',
			lineHeight: 'tight'
		}
	},
	lg: {
		description: 'Used for large text',
		value: {
			fontSize: 'lg',
			fontWeight: 'medium',
			lineHeight: 'tight'
		}
	},
	xl: {
		description: 'Used for extra large text',
		value: {
			fontSize: 'xl',
			fontWeight: 'medium',
			lineHeight: 'tight'
		}
	},
	label: {
		description: 'Used for form field labels',
		value: {
			fontSize: 'sm',
			fontWeight: 'medium',
			lineHeight: 'tight'
		}
	}
});
