<script lang="ts">
	import Collection from '$lib/components/Collection.svelte';
	import CommunityCard from '$lib/components/CommunityCard.svelte';

	let { data } = $props();
</script>

{#if data.communities.length === 0}
	<p>You are not a member of any communities yet.</p>
{:else}
	<Collection>
		{#each data.communities as community (community.id)}
			<CommunityCard {...community} />
		{/each}
	</Collection>
{/if}
