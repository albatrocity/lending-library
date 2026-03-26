<script lang="ts">
	import type { Snippet } from 'svelte';
	import { card } from 'styled-system/recipes';
	type Props = {
		children?: Snippet;
		header?: Snippet;
		subheader?: Snippet;
		footer?: Snippet;
		actions?: Snippet;
	};

	const { children, header, subheader, footer, actions }: Props = $props();

	const recipe = card();
</script>

<div class="{recipe.root} group">
	{#if header || subheader}
		<div class={recipe.header}>
			{#if header}
				{@render header()}
			{/if}

			{#if subheader}
				<div class={recipe.subheader}>
					{@render subheader()}
				</div>
			{/if}
		</div>
	{/if}

	{#if children}
		<div class={recipe.body}>
			{@render children()}
		</div>
	{/if}

	{#if footer}
		<div class={recipe.footer}>
			{@render footer()}
		</div>
	{/if}

	{#if actions}
		<div class={recipe.actions}>
			{@render actions()}
		</div>
	{/if}
</div>
