<script lang="ts">
	import type { Item } from '$lib/schemas/items';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { Tag } from '$lib/schemas/tags';
	import Button from '$lib/components/Button.svelte';
	import ButtonLink from '$lib/components/ButtonLink.svelte';
	import TagComponent from './Tag.svelte';
	import Card from './Card.svelte';
	import BorrowStatusBadge from './BorrowStatusBadge.svelte';
	import { getUserContext } from '$lib/contexts/user.svelte';
	import { hstack } from 'styled-system/patterns';

	type ItemListItemProps = Item & {
		tags?: Tag[];
		ownerName?: string;
		activeBorrowerId?: string | null;
	};

	let {
		id,
		name,
		description,
		ownerId,
		tags = [],
		ownerName,
		activeBorrowerId = null
	}: ItemListItemProps = $props();

	const getUser = getUserContext();
	const currentUserId = $derived(getUser().id);
</script>

<Card>
	{#snippet header()}
		<div class={hstack({ gap: '2', alignItems: 'center', justifyContent: 'space-between' })}>
			<a href={resolve('/(authed)/items/[id]', { id: String(id) })}>{name}</a>
			<BorrowStatusBadge {activeBorrowerId} />
		</div>
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

		{#if currentUserId !== ownerId && !activeBorrowerId}
			<ButtonLink size="xs" href={resolve('/(authed)/items/[id]/borrow', { id: String(id) })}
				>Borrow</ButtonLink
			>
		{/if}
	{/snippet}
</Card>
