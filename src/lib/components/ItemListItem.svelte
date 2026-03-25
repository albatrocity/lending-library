<script lang="ts">
	import type { Item } from '$lib/schemas/items';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { Tag } from '$lib/schemas/tags';
	import Button from '$lib/components/Button.svelte';
	import { getUserContext } from '$lib/contexts/user.svelte';

	type ItemListItemProps = Item & {
		tags?: Tag[];
		ownerName?: string;
	};

	let { id, name, description, ownerId, tags = [], ownerName }: ItemListItemProps = $props();

	const getUser = getUserContext();
	const currentUserId = $derived(getUser().id);
</script>

<div>
	<span><a href={resolve('/(authed)/items/[id]', { id: String(id) })}>{name} - {id}</a></span>
	{#if ownerName}
		<small>by {ownerName}</small>
	{/if}
	{@html description}
	<ul>
		{#each tags as tag (tag.id)}
			<li>{tag.name}</li>
		{/each}
	</ul>
	{#if currentUserId === ownerId}
		<a href={resolve('/(authed)/items/[id]/edit', { id: String(id) })}>Edit</a>
		<form
			method="post"
			action={resolve('/(authed)/items/[id]/delete', { id: String(id) })}
			use:enhance
		>
			<input type="hidden" name="id" value={id} />
			<Button type="submit" variant="outline">Delete</Button>
		</form>
	{/if}

	{#if currentUserId !== ownerId}
		<a href={resolve('/(authed)/items/[id]/borrow', { id: String(id) })}>Borrow</a>
	{/if}
</div>
