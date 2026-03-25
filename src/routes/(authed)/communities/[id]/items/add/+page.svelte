<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import ButtonLink from '$lib/components/ButtonLink.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let { data, form } = $props();
</script>

<PageContent>
	<PageHeader title="Add Items to {data.community.name}" />

	{#if data.availableItems.length === 0}
		<p>You have no items available to add to this community.</p>
		<ButtonLink
			href={resolve('/(authed)/communities/[id]/items/new', { id: String(data.community.id) })}
			>Create a new item</ButtonLink
		>
	{:else}
		<form method="post" use:enhance>
			<p>Select items to add:</p>
			<ul>
				{#each data.availableItems as item (item.id)}
					<li>
						<label>
							<input type="checkbox" name="itemIds" value={item.id} />
							{item.name}
							{#if item.description}
								- {item.description}
							{/if}
						</label>
					</li>
				{/each}
			</ul>

			<Button type="submit">Add Selected Items</Button>
		</form>
	{/if}

	{#if form?.error}
		<p>{form.error}</p>
	{/if}

	{#if form?.success}
		<p>Successfully added {form.addedCount} item(s) to the community!</p>
	{/if}
</PageContent>
