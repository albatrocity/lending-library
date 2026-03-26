<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { css, cx } from 'styled-system/css';
	import { button } from 'styled-system/recipes';
	import type { SystemProperties } from 'styled-system/types';

	type ButtonLinkProps = {
		children: Snippet;
		colorPalette?: SystemProperties['colorPalette'];
	} & Parameters<typeof button>[0] &
		HTMLAnchorAttributes;

	let { children, colorPalette, ...rest }: ButtonLinkProps = $props();

	const [variantProps, htmlProps] = $derived(button.splitVariantProps(rest));
</script>

<a class={cx(button(variantProps), colorPalette ? css({ colorPalette }) : undefined)} {...htmlProps}
	>{@render children()}</a
>
