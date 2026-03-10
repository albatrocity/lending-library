<script lang="ts">
	import type { Item } from '$lib/schemas/items';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { Tag } from '$lib/schemas/tags';

	type ItemListItemProps = Item & {
		currentUserId: string;
		tags?: Tag[];
		ownerName?: string;
	};

	let {
		id,
		name,
		description,
		currentUserId,
		ownerId,
		tags = [],
		ownerName
	}: ItemListItemProps = $props();

	const itemHref = $derived(resolve('/(authed)/items/[id]', { id: String(id) }));
</script>

<div>
	<span><a href={itemHref}>{name} - {id}</a></span>
	{#if ownerName}
		<small>by {ownerName}</small>
	{/if}
	{@html description}
	<ul>
		{#each tags as tag}
			<li>{tag.name}</li>
		{/each}
	</ul>
	{#if currentUserId === ownerId}
		<a href={resolve('/(authed)/items/[id]/edit', { id: String(id) })}>Edit</a>
		<form method="post" action={resolve('/(authed)/items/[id]/delete', { id: String(id) })} use:enhance>
			<input type="hidden" name="id" value={id} />
			<button type="submit">Delete</button>
		</form>
	{/if}

	{#if currentUserId !== ownerId}
		<a href={resolve('/(authed)/items/[id]/borrow', { id: String(id) })}>Borrow</a>
	{/if}
</div>
