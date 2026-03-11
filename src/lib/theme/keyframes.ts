import { defineKeyframes } from '@pandacss/dev';

export const keyframes = defineKeyframes({
	'slide-fade-in': {
		from: { opacity: '0', transform: 'translateY(-4px)' },
		to: { opacity: '1', transform: 'translateY(0)' }
	},
	'slide-fade-out': {
		from: { opacity: '1', transform: 'translateY(0)' },
		to: { opacity: '0', transform: 'translateY(-4px)' }
	}
});
