<script lang="ts">
	import type { Snippet } from 'svelte';
	import { hstack } from 'styled-system/patterns';
	import { css } from 'styled-system/css';

	type Props = {
		title: string;
		subheader?: Snippet;
		actions?: Snippet;
	};

	const { title, subheader, actions }: Props = $props();
</script>

<header
	class={hstack({
		gap: '2',
		justifyContent: 'space-between',
		py: '2'
	})}
>
	<div>
		<h1 class={css({ textStyle: 'xl' })}>{title}</h1>
		{#if subheader}
			{@render subheader()}
		{/if}
	</div>
	{#if actions}
		<div class={hstack({ gap: '2' })}>
			{@render actions()}
		</div>
	{/if}
</header>
