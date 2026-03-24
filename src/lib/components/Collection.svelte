<script lang="ts">
	import { cva } from 'styled-system/css';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();

	const recipe = cva({
		base: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
			gap: '2',
			gridAutoRows: 'minmax(0, auto)'
		}
	});
</script>

<div class={recipe()}>
	{@render children()}
</div>
