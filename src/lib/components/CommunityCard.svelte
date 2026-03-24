<script lang="ts">
	import Card from './Card.svelte';
	import { resolve } from '$app/paths';

	type Props = {
		id: number;
		name: string;
		description?: string | null;
	};

	const { id, name, description }: Props = $props();
</script>

<a href={resolve('/(authed)/communities/[id]', { id: String(id) })}>
	<Card>
		{#snippet header()}
			{name}
		{/snippet}

		{#if description}
			{@html description}
		{/if}
	</Card>
</a>
