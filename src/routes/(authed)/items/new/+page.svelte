<script lang="ts">
	import ItemForm from '$lib/components/ItemForm.svelte';

	let { form, data } = $props();
</script>

<h1>New Item</h1>
<ItemForm
	action="?/createItem"
	{form}
	topTags={data.topTags}
	allCommunities={data.communities}
	itemCommunities={[]}
/>
