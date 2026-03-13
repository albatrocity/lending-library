import type { RecipeConfig } from '@pandacss/dev';
import { input } from './input';

export const textarea = {
	...input,
	className: 'textarea',
	jsx: ['Textarea', 'Field.Textarea'],
	base: {
		...input.base,
		height: 'auto',
		minHeight: 'var(--input-height)',
		resize: 'vertical',
		py: '2'
	}
} as const satisfies RecipeConfig;
