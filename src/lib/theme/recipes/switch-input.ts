import { defineSlotRecipe } from '@pandacss/dev';

export const switchInput = defineSlotRecipe({
	className: 'switch-input',
	slots: ['root', 'control', 'thumb', 'label'],
	base: {
		root: {
			display: 'inline-flex',
			alignItems: 'center',
			gap: '2',
			cursor: 'pointer',
			'&[data-disabled]': {
				opacity: 0.5,
				cursor: 'not-allowed'
			}
		},
		control: {
			position: 'relative',
			flexShrink: 0,
			w: '11',
			h: '6',
			borderRadius: 'full',
			// Unchecked: muted track
			bg: 'fg.subtle',
			transition: 'colors',
			transitionProperty: 'background-color',
			'&[data-state=checked]': {
				bg: 'fg.muted'
			},
			'&[data-focus-visible]': {
				outline: '2px solid',
				outlineColor: 'primary.default',
				outlineOffset: '2px'
			}
		},
		thumb: {
			position: 'absolute',
			// 2px inset from edges (spacing.0.5 = 0.125rem = 2px)
			top: '0.5',
			left: '0.5',
			w: '5',
			h: '5',
			borderRadius: 'full',
			bg: 'white',
			boxShadow: 'sm',
			transition: 'transform',
			transitionProperty: 'transform',
			// track (44px) - thumb (20px) - left (2px) - right (2px) = 20px = 1.25rem
			'&[data-state=checked]': {
				transform: 'translateX(1.25rem)'
			}
		},
		label: {
			textStyle: 'label',
			userSelect: 'none'
		}
	}
});
