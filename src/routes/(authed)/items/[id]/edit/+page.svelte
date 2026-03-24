<script lang="ts">
	import ItemForm from '$lib/components/ItemForm.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let { form, data } = $props();
</script>

<PageContent>
	<PageHeader title="Edit Item" />
	<ItemForm
		action="/items/{data.item.id}/edit"
		{form}
		item={data.item}
		topTags={data.topTags}
		allCommunities={data.communities}
		itemCommunities={data.itemCommunities}
	/>
</PageContent>
