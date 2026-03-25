<script lang="ts">
	import { sva } from 'styled-system/css';
	import type { Snippet } from 'svelte';
	import Container from './Container.svelte';

	type Props = {
		sidebar?: Snippet;
		children: Snippet;
	};

	const { children, sidebar }: Props = $props();

	const recipe = sva({
		slots: ['root', 'navigation', 'secondaryNavigation', 'sidebar', 'main', 'content'],
		base: {
			root: {
				display: 'flex',
				flexDirection: 'row',
				width: '100%'
			},
			sidebar: {
				width: 'xs',
				backgroundColor: 'bg.subtle',
				padding: '2',
				position: 'sticky',
				top: 'var(--navigation-height)',
				height: 'calc(100vh - var(--navigation-height))',
				overflowY: 'auto'
			},
			main: {
				flex: 1
			}
		}
	});

	const classes = recipe();
</script>

<div class={classes.root}>
	<div class={classes.root}>
		{#if sidebar}
			<aside class={classes.sidebar}>
				{@render sidebar()}
			</aside>
		{/if}

		<main class={classes.main}>
			<Container size="2xl">
				{@render children()}
			</Container>
		</main>
	</div>
</div>
