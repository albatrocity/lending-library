<script lang="ts">
	import Collection from '$lib/components/Collection.svelte';
	import ItemListItem from '$lib/components/ItemListItem.svelte';
	import { resolve } from '$app/paths';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let { data, form } = $props();
</script>

<PageContent>
	<PageHeader title={data.community.name} />
	<a href={resolve('/(authed)/communities')}>Back to Communities</a>

	<h1>{data.community.name}</h1>

	{#if data.community.description}
		<p>{data.community.description}</p>
	{/if}

	{#if data.isOwner}
		<p>You are the owner of this community.</p>
		<div>
			<a href={resolve('/(authed)/communities/[id]/invite', { id: String(data.community.id) })}
				>Invite Members</a
			>
			<a href={resolve('/(authed)/communities/[id]/items/add', { id: String(data.community.id) })}
				>Add Existing Items</a
			>
			<a href={resolve('/(authed)/communities/[id]/items/new', { id: String(data.community.id) })}
				>Create New Item</a
			>
		</div>
	{/if}

	<h2>Items ({data.items.length})</h2>
	{#if data.items.length === 0}
		<p>No items in this community yet.</p>
	{:else}
		<Collection>
			{#each data.items as item (item.id)}
				<ItemListItem {...item} currentUserId={data.user.id} />
			{/each}
		</Collection>
	{/if}

	{#if form?.removed}
		<p>Item removed from community.</p>
	{/if}

	{#if form?.error}
		<p>{form.error}</p>
	{/if}

	<h2>Members ({data.community.members.length})</h2>
	<ul>
		{#each data.community.members as member (member.userId)}
			<li>
				{member.userName} ({member.userEmail})
				{#if member.userId === data.community.ownerId}
					(Owner)
				{/if}
			</li>
		{/each}
	</ul>
</PageContent>
