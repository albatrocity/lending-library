<script lang="ts">
	import type { PageServerData } from './$types';
	import ItemListItem from '$lib/components/ItemListItem.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import ButtonLink from '$lib/components/ButtonLink.svelte';
	import { resolve } from '$app/paths';

	let { data }: { data: PageServerData } = $props();
</script>

<PageContent>
	<PageHeader title="My Items">
		{#snippet actions()}
			<ButtonLink variant="subtle" href={resolve('/(authed)/items/new')}>New Item</ButtonLink>
		{/snippet}
	</PageHeader>

	{#each data.items as item (item.id)}
		<ItemListItem {...item} currentUserId={data.user.id} />
	{/each}
</PageContent>
