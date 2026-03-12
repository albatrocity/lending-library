<script lang="ts">
	import ItemForm from '$lib/components/ItemForm.svelte';

	let { form, data } = $props();
</script>

<h1>Edit Item</h1>
<ItemForm
	action="/items/{data.item.id}/edit"
	{form}
	item={data.item}
	topTags={data.topTags}
	allCommunities={data.communities}
	itemCommunities={data.itemCommunities}
/>
