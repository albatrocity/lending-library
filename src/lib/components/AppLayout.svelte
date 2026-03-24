<script lang="ts">
	import { sva } from 'styled-system/css';
	import type { Snippet } from 'svelte';

	type Props = {
		navigation?: Snippet;
		secondaryNavigation?: Snippet;
		children: Snippet;
	};

	const { children, navigation, secondaryNavigation }: Props = $props();

	let navigationEl = $state<HTMLElement | null>(null);

	const navHeight = $derived(navigationEl?.clientHeight ?? 0);

	const recipe = sva({
		slots: ['root', 'navigation', 'secondaryNavigation', 'sidebar', 'main', 'content'],
		base: {
			root: {
				display: 'flex',
				flexDirection: 'column'
			},
			navigation: {
				backgroundColor: 'bg.subtle',
				padding: '2',
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				position: 'sticky',
				top: 0,
				zIndex: 100,
				'& > ul': {
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'row',
					gap: '2'
				}
			},
			secondaryNavigation: {
				'& > ul': {
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'row',
					gap: '2'
				}
			}
		}
	});

	const classes = recipe();
</script>

<div class={classes.root} style={`--navigation-height: ${navHeight}px`}>
	{#if navigation}
		<nav class={classes.navigation} bind:this={navigationEl}>
			<div class={classes.navigation}>
				{@render navigation()}
			</div>

			{#if secondaryNavigation}
				<div class={classes.secondaryNavigation}>
					{@render secondaryNavigation()}
				</div>
			{/if}
		</nav>
	{/if}

	{@render children()}
</div>
