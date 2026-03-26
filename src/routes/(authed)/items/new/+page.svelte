<script lang="ts">
	import ItemForm from '$lib/components/ItemForm.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let { form, data } = $props();
</script>

<PageContent>
	<PageHeader title="New Item" />

	<ItemForm
		action="?/createItem"
		{form}
		topTags={data.topTags}
		allCommunities={data.communities}
		itemCommunities={[]}
	/>
</PageContent>
