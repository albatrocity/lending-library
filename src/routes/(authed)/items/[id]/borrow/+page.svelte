<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	let { data } = $props();
	const item = $derived(data.item);
	const borrowRequests = $derived(data.borrowRequests);
	// const borrows = $derived(data.borrows);
</script>

<h1>Borrow {item.name}</h1>
<form method="post" action="?/request" use:enhance>
	<input type="date" name="startDate" />
	<input type="date" name="endDate" />
	<textarea name="description" placeholder="Description"></textarea>
	<Button type="submit">Request to borrow</Button>
</form>

<h3>History</h3>

{#if data.userOwnsItem}
	<ul>
		{#each borrowRequests as request (request.id)}
			<li>{request.startDate} - {request.endDate} - {request.status}</li>
		{/each}
	</ul>
{:else}
	{data.borrowRequestsCount} current request{data.borrowRequestsCount === 1 ? '' : 's'} to borrow this
	item
{/if}
