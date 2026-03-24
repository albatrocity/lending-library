<script>
	import { resolve } from '$app/paths';
	import ButtonLink from '$lib/components/ButtonLink.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let { children } = $props();
</script>

<PageContent>
	<PageHeader title="Communities">
		{#snippet actions()}
			<ButtonLink variant="outline" href={resolve('/(authed)/communities/new')}
				>New Community</ButtonLink
			>
		{/snippet}
	</PageHeader>

	{@render children()}
</PageContent>
