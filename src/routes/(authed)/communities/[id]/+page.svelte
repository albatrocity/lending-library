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
		<a href="/communities/{data.community.id}/invite">Invite Members</a>
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

