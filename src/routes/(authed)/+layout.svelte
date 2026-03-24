<script lang="ts">
	let { children } = $props();
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import AppLayout from '$lib/components/AppLayout.svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonLink from '$lib/components/ButtonLink.svelte';
</script>

<AppLayout>
	{#snippet navigation()}
		<ul>
			<li>
				<ButtonLink variant="ghost" href={resolve('/(authed)/items')}>Browse Items</ButtonLink>
			</li>
			<li>
				<ButtonLink variant="ghost" href={resolve('/(authed)/users/me/items')}>My Items</ButtonLink>
			</li>
			<li>
				<ButtonLink variant="ghost" href={resolve('/(authed)/communities')}>Communities</ButtonLink>
			</li>
			<li>
				<ButtonLink variant="ghost" href={resolve('/(authed)/requests')}>Requests</ButtonLink>
			</li>
		</ul>
	{/snippet}

	{#snippet secondaryNavigation()}
		<ul>
			<li>
				<form method="post" action="/logout" use:enhance>
					<Button type="submit" variant="ghost" size="xs">Sign out</Button>
				</form>
			</li>
		</ul>
	{/snippet}

	{@render children()}
</AppLayout>
