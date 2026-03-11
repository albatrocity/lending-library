<script lang="ts">
	import type { Item } from '$lib/schemas/items';
	import { enhance } from '$app/forms';
	import type { Tag } from '$lib/schemas/tags';
	import Button from '$lib/components/Button.svelte';

	type ItemListItemProps = Item & {
		currentUserId: string;
		tags?: Tag[];
	};

	let { id, name, description, currentUserId, ownerId, tags = [] }: ItemListItemProps = $props();
</script>

<div>
	<span><a href="/items/{id}">{name} - {id}</a></span>
	{@html description}
	<ul>
		{#each tags as tag}
			<li>{tag.name}</li>
		{/each}
	</ul>
	{#if currentUserId === ownerId}
		<a href="/items/{id}/edit">Edit</a>
		<form method="post" action="/items/{id}/delete" use:enhance>
			<input type="hidden" name="id" value={id} />
			<Button type="submit" variant="outline">Delete</Button>
		</form>
	{/if}

	{#if currentUserId !== ownerId}
		<a href="/items/{id}/borrow">Borrow</a>
	{/if}
</div>
