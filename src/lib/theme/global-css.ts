import { defineGlobalStyles } from '@pandacss/dev';

export const globalCss = defineGlobalStyles({
	h1: { textStyle: 'xl', color: 'fg' },
	h2: { textStyle: 'lg', color: 'fg' },
	h3: { textStyle: 'md', color: 'fg' },
	h4: { textStyle: 'sm', color: 'fg' },
	p: { textStyle: 'body', color: 'fg', marginBlockEnd: '2' },
	a: {
		color: 'primary.default',
		_hover: { textDecoration: 'none' }
	}
});
