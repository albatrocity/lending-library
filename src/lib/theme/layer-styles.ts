import { defineLayerStyles } from '@pandacss/dev';

export const layerStyles = defineLayerStyles({
	overlay: {
		description: 'Floating overlay surface (dropdowns, popovers, etc.)',
		value: {
			background: 'white',
			borderWidth: '1px',
			borderColor: 'border',
			borderRadius: 'l2',
			boxShadow: 'md'
		}
	},
	disabled: {
		description: 'Applied to disabled interactive elements',
		value: {
			opacity: 0.5
		}
	}
});
