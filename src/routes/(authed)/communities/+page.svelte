<script lang="ts">
	let { data } = $props();
</script>

<div>
	<h1>My Communities</h1>
	<a href="/communities/new">Create New Community</a>

	{#if data.communities.length === 0}
		<p>You are not a member of any communities yet.</p>
	{:else}
		<ul>
			{#each data.communities as community}
				<li>
					<a href="/communities/{community.id}">{community.name}</a>
					{#if community.description}
						<p>{community.description}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
