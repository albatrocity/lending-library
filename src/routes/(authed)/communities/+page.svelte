<script lang="ts">
	import { resolve } from '$app/paths';
	import ButtonLink from '$lib/components/ButtonLink.svelte';
	import Collection from '$lib/components/Collection.svelte';
	import CommunityCard from '$lib/components/CommunityCard.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let { data } = $props();
</script>

<PageContent>
	<PageHeader title="Communities">
		{#snippet actions()}
			<ButtonLink variant="subtle" href={resolve('/(authed)/communities/new')}
				>New Community</ButtonLink
			>
		{/snippet}
	</PageHeader>

	{#if data.communities.length === 0}
		<p>You are not a member of any communities yet.</p>
	{:else}
		<Collection>
			{#each data.communities as community (community.id)}
				<CommunityCard {...community} />
			{/each}
		</Collection>
	{/if}
</PageContent>
