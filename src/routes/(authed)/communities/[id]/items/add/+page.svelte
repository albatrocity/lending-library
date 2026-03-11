<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';

	let { data, form } = $props();
</script>

<div>
	<a href="/communities/{data.community.id}">Back to {data.community.name}</a>

	<h1>Add Items to {data.community.name}</h1>

	{#if data.availableItems.length === 0}
		<p>You have no items available to add to this community.</p>
		<a href="/communities/{data.community.id}/items/new">Create a new item</a>
	{:else}
		<form method="post" use:enhance>
			<p>Select items to add:</p>
			<ul>
				{#each data.availableItems as item}
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
</div>
