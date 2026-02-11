<script lang="ts">
	import { enhance } from '$app/forms';
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
	<button type="submit">Request to borrow</button>
</form>

<h3>History</h3>

{#if data.userOwnsItem}
	<ul>
		{#each borrowRequests as request}
			<li>{request.startDate} - {request.endDate} - {request.status}</li>
		{/each}
	</ul>
{:else}
	{data.borrowRequestsCount} current request{data.borrowRequestsCount === 1 ? '' : 's'} to borrow this
	item
{/if}
