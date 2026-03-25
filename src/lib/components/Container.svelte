<script lang="ts">
	import { cva } from 'styled-system/css';
	import type { Snippet } from 'svelte';

	type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

	type Props = {
		children: Snippet;
		size?: Size;
	};

	const { children, size }: Props = $props();

	const container = cva({
		base: {
			width: 'full',
			mx: 'auto',
			px: '4'
		},
		defaultVariants: {
			size: 'lg'
		},
		variants: {
			size: {
				sm: { maxWidth: { base: 'full', sm: 'breakpoint-sm' } },
				md: { maxWidth: { base: 'full', md: 'breakpoint-md' } },
				lg: { maxWidth: { base: 'full', lg: 'breakpoint-lg' } },
				xl: { maxWidth: { base: 'full', xl: 'breakpoint-xl' } },
				'2xl': { maxWidth: { base: 'full', '2xl': 'breakpoint-2xl' } }
			}
		}
	});
</script>

<div class={container({ size })}>
	{@render children()}
</div>
