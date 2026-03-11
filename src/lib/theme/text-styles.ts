import { defineTextStyles } from '@pandacss/dev';

export const textStyles = defineTextStyles({
	label: {
		description: 'Used for form field labels',
		value: {
			fontSize: 'sm',
			fontWeight: 'medium',
			lineHeight: 'tight'
		}
	}
});
