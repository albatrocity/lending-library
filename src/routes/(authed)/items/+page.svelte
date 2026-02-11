<script lang="ts">
	import type { PageServerData } from './$types';
	import ItemListItem from '$lib/components/ItemListItem.svelte';

	let { data }: { data: PageServerData } = $props();
</script>

<div>
	{#each data.items as item}
		<ItemListItem {...item} currentUserId={data.user.id} />
	{/each}
</div>
