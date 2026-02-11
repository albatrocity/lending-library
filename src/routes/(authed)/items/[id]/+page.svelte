<script>
	let { data } = $props();
	const item = $derived(data.item);
</script>

<h1>{item.name}</h1>
{@html item.description}

<ul>
	{#each item.tags as tag}
		<li>{tag.name}</li>
	{/each}
</ul>

<a href="/items/{item.id}/borrow">Borrow</a>
