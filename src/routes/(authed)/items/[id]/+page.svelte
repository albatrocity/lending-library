<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();
	const item = $derived(data.item);
</script>

<h1>{item.name}</h1>
{@html item.description}

<ul>
	{#each item.tags as tag}
		<li>{tag.name}</li>
	{/each}
</ul>

<h2>Communities</h2>
{#if data.isOwner}
	{#if data.itemCommunities.length === 0}
		<p>This item is not in any communities yet.</p>
	{:else}
		<ul>
			{#each data.itemCommunities as community}
				<li>
					{community.name}
					<form method="post" action="?/removeFromCommunity" use:enhance style="display: inline;">
						<input type="hidden" name="communityId" value={community.id} />
						<button type="submit">Remove</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}
{:else}
	<p>
		This item is available in {data.itemCommunities.length}
		{data.itemCommunities.length === 1 ? 'community' : 'communities'}
	</p>
{/if}

{#if data.isOwner}
	<h3>Add to Community</h3>
	{#if data.availableCommunities.length === 0}
		<p>No more communities available to add this item to.</p>
	{:else}
		<form method="post" action="?/assignToCommunity" use:enhance>
			<select name="communityId" required>
				<option value="">Select a community</option>
				{#each data.availableCommunities as community}
					<option value={community.id}>{community.name}</option>
				{/each}
			</select>
			<button type="submit">Add to Community</button>
		</form>
	{/if}

	{#if form?.error}
		<p>{form.error}</p>
	{/if}

	{#if form?.success}
		<p>Item added to community successfully!</p>
	{/if}
{/if}

{#if !data.isOwner}
	{#if data.pendingBorrowRequest}
		<p>
			You requested to borrow this item on {data.pendingBorrowRequest.createdAt.toLocaleDateString()}
			starting {data.pendingBorrowRequest.startDate.toLocaleDateString()}
		</p>
	{:else}
		<a href={resolve('/(authed)/items/[id]/borrow', { id: String(item.id) })}>Borrow this item</a>
	{/if}
{/if}
