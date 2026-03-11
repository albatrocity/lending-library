import { defineAnimationStyles } from '@pandacss/dev';

export const animationStyles = defineAnimationStyles({
	'slide-fade-in': {
		description: 'Slide down and fade in — used for opening dropdowns/popovers',
		value: {
			animationName: 'slide-fade-in',
			animationTimingFunction: 'ease-out',
			animationFillMode: 'both'
		}
	},
	'slide-fade-out': {
		description: 'Slide up and fade out — used for closing dropdowns/popovers',
		value: {
			animationName: 'slide-fade-out',
			animationTimingFunction: 'ease-in',
			animationFillMode: 'both'
		}
	}
});
