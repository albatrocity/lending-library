import { fileUploadAnatomy } from '@ark-ui/svelte/anatomy';
import { defineSlotRecipe } from '@pandacss/dev';

export const fileUpload = defineSlotRecipe({
	className: 'file-upload',
	slots: fileUploadAnatomy.keys(),
	base: {
		root: {
			display: 'flex',
			flexDirection: 'column',
			gap: '3',
			width: 'full'
		},
		dropzone: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '3',
			borderWidth: '2px',
			borderStyle: 'dashed',
			borderColor: 'border',
			borderRadius: 'l2',
			padding: '6',
			cursor: 'pointer',
			transition: 'all 0.2s',
			_hover: {
				borderColor: 'border.emphasized',
				bg: 'bg.subtle'
			},
			'&[data-dragging]': {
				borderColor: 'colorPalette.default',
				bg: 'colorPalette.subtle'
			}
		},
		trigger: {
			cursor: 'pointer',
			fontWeight: 'medium',
			color: 'colorPalette.default',
			_hover: {
				textDecoration: 'underline'
			}
		},
		label: {
			fontWeight: 'medium',
			color: 'fg.default'
		},
		itemGroup: {
			display: 'flex',
			flexWrap: 'wrap',
			gap: '3'
		},
		item: {
			position: 'relative',
			display: 'flex',
			flexDirection: 'column',
			gap: '1',
			padding: '2',
			borderRadius: 'l2',
			borderWidth: '1px',
			borderColor: 'border',
			bg: 'bg.default'
		},
		itemPreview: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: '100px',
			height: '100px',
			overflow: 'hidden',
			borderRadius: 'l1',
			bg: 'bg.subtle'
		},
		itemPreviewImage: {
			width: 'full',
			height: 'full',
			objectFit: 'cover'
		},
		itemName: {
			fontSize: 'xs',
			color: 'fg.muted',
			maxWidth: '100px',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		itemSizeText: {
			fontSize: 'xs',
			color: 'fg.subtle'
		},
		itemDeleteTrigger: {
			position: 'absolute',
			top: '-2',
			right: '-2',
			width: '6',
			height: '6',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 'full',
			bg: 'bg.emphasized',
			color: 'fg.default',
			cursor: 'pointer',
			fontSize: 'xs',
			_hover: {
				bg: 'red.subtle',
				color: 'red.default'
			}
		},
		clearTrigger: {
			alignSelf: 'flex-start',
			fontSize: 'sm',
			color: 'fg.muted',
			cursor: 'pointer',
			_hover: {
				color: 'fg.default'
			}
		}
	}
});
