<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';

	let { data, form } = $props();
</script>

<div>
	<a href="/communities">Back to Communities</a>

	<h1>{data.community.name}</h1>

	{#if data.community.description}
		<p>{data.community.description}</p>
	{/if}

	{#if data.isOwner}
		<p>You are the owner of this community.</p>
		<div>
			<a href="/communities/{data.community.id}/invite">Invite Members</a>
			<a href="/communities/{data.community.id}/items/add">Add Existing Items</a>
			<a href="/communities/{data.community.id}/items/new">Create New Item</a>
		</div>
	{/if}

	<h2>Items ({data.items.length})</h2>
	{#if data.items.length === 0}
		<p>No items in this community yet.</p>
	{:else}
		<ul>
			{#each data.items as item}
				<a href="/items/{item.id}">
					<li>
						<strong>{item.name}</strong>
						{#if item.description}
							- {item.description}
						{/if}
						<br />
						<small>Owned by {item.ownerName}</small>
						{#if data.isOwner}
							<form method="post" action="?/removeItem" use:enhance style="display: inline;">
								<input type="hidden" name="itemId" value={item.id} />
								<Button type="submit" variant="outline">Remove</Button>
							</form>
						{/if}
					</li>
				</a>
			{/each}
		</ul>
	{/if}

	{#if form?.removed}
		<p>Item removed from community.</p>
	{/if}

	{#if form?.error}
		<p>{form.error}</p>
	{/if}

	<h2>Members ({data.community.members.length})</h2>
	<ul>
		{#each data.community.members as member}
			<li>
				{member.userName} ({member.userEmail})
				{#if member.userId === data.community.ownerId}
					(Owner)
				{/if}
			</li>
		{/each}
	</ul>
</div>
