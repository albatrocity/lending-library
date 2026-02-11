<script lang="ts">
	import ItemForm from '$lib/components/ItemForm.svelte';

	let { data } = $props();
	const item = $derived(data.item);
</script>

<h1>Edit Item</h1>
<ItemForm action="/items/{item.id}/edit" {item} />
