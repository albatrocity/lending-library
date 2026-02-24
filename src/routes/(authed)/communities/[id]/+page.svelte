<script lang="ts">
	let { data } = $props();
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
				<li>
					<strong>{item.name}</strong>
					{#if item.description}
						- {item.description}
					{/if}
					<br />
					<small>Owned by {item.ownerName}</small>
				</li>
			{/each}
		</ul>
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
