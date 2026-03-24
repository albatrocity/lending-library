import { defineSlotRecipe } from '@pandacss/dev';

export const card = defineSlotRecipe({
	className: 'card',
	slots: ['root', 'header', 'subheader', 'body', 'footer', 'actions'],
	base: {
		root: {
			borderRadius: 'md',
			borderWidth: '1px',
			borderColor: 'border',
			borderStyle: 'solid',
			boxShadow: 'sm'
		},
		header: {
			padding: '2',
			textStyle: 'lg',
			'&:has(~ .card__body:not(:empty))': {
				borderBottomWidth: '1px',
				borderBottomColor: 'border/50'
			}
		},
		subheader: {
			textStyle: 'sm'
		},
		body: {
			padding: '2',
			_empty: {
				padding: '0'
			}
		},
		footer: {
			padding: '2',
			textStyle: 'sm',
			backgroundColor: 'bg.subtle/20'
		},
		actions: {
			opacity: 0.5,
			transition: 'opacity 0.1s ease-in-out',
			padding: '2',
			textStyle: 'sm',
			display: 'flex',
			_active: {
				opacity: 1
			},
			flexDirection: 'row',
			gap: '2',
			alignItems: 'center',
			backgroundColor: 'bg.subtle/50',
			borderTopWidth: '1px',
			borderTopColor: 'bg.subtle',
			_groupHover: {
				opacity: 1
			}
		}
	}
});
