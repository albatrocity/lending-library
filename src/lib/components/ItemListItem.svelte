<script lang="ts">
	import type { Item } from '$lib/schemas/items';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { Tag } from '$lib/schemas/tags';
	import Button from '$lib/components/Button.svelte';
	import ButtonLink from '$lib/components/ButtonLink.svelte';
	import TagComponent from './Tag.svelte';

	import Card from './Card.svelte';

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
</script>

<Card>
	{#snippet header()}
		<a href={resolve('/(authed)/items/[id]', { id: String(id) })}>{name} - {id}</a>
	{/snippet}

	{#snippet subheader()}
		{#if ownerName}
			<small>by {ownerName}</small>
		{/if}
	{/snippet}

	{@html description}

	{#snippet footer()}
		<ul>
			{#each tags as tag (tag.id)}
				<li><TagComponent label={tag.name} /></li>
			{/each}
		</ul>
	{/snippet}

	{#snippet actions()}
		{#if currentUserId === ownerId}
			<ButtonLink
				size="xs"
				variant="ghost"
				href={resolve('/(authed)/items/[id]/edit', { id: String(id) })}>Edit</ButtonLink
			>
			<form
				method="post"
				action={resolve('/(authed)/items/[id]/delete', { id: String(id) })}
				use:enhance
			>
				<input type="hidden" name="id" value={id} />
				<Button size="xs" type="submit" variant="ghost" colorPalette="danger">Delete</Button>
			</form>
		{/if}

		{#if currentUserId !== ownerId}
			<ButtonLink size="xs" href={resolve('/(authed)/items/[id]/borrow', { id: String(id) })}
				>Borrow</ButtonLink
			>
		{/if}
	{/snippet}
</Card>
