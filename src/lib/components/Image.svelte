<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import { cva } from 'styled-system/css';

	type ImageProps = {
		size?: 'sm' | 'md' | 'lg' | 'full';
		rounded?: 'none' | 'sm' | 'md' | 'lg';
	} & HTMLImgAttributes;

	const image = cva({
		base: {
			display: 'block',
			objectFit: 'cover',
			aspectRatio: 'square'
		},
		variants: {
			size: {
				sm: { width: '200px' },
				md: { width: '400px' },
				lg: { width: '600px' },
				full: { width: 'full' }
			},
			rounded: {
				none: { borderRadius: '0' },
				sm: { borderRadius: 'l1' },
				md: { borderRadius: 'l2' },
				lg: { borderRadius: 'l3' }
			}
		},
		defaultVariants: {
			size: 'md',
			rounded: 'md'
		}
	});

	let { size, rounded, class: className, ...rest }: ImageProps = $props();

	const classes = $derived([image({ size, rounded }), className].filter(Boolean).join(' '));
</script>

<img class={classes} {...rest} />
