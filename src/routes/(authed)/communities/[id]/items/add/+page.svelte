<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import ButtonLink from '$lib/components/ButtonLink.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { hstack } from 'styled-system/patterns';

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
							<span class={hstack({ gap: '2', alignItems: 'center', display: 'inline-flex' })}>
								{item.name}
								{#if item.description}
									<span>- {item.description}</span>
								{/if}
								{#if item.activeBorrowerId}
									<Badge status="unavailable" label="Lent out" />
								{/if}
							</span>
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
