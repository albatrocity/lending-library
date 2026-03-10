<script lang="ts">
	import { resolve } from '$app/paths';
	let { data } = $props();
</script>

<h1>Requests</h1>

<h2>Borrowing</h2>

{#if data.activeBorrows.length > 0}
	<ul>
		{#each data.activeBorrows as borrow (borrow.id)}
			<li>{borrow.item!.name}</li>
		{/each}
	</ul>
{:else}
	<p>You are not currently borrowing any items.</p>
{/if}

<h2>Borrow Requests</h2>

{#if data.readyToPickUp.length > 0}
	<h3>Ready to pick up</h3>
	<ul>
		{#each data.readyToPickUp as request (request.id)}
			<li>
				<a href={resolve('/(authed)/requests/[id]', { id: String(request.id) })}
					>{request.item!.name}</a
				>
			</li>
		{/each}
	</ul>
{/if}

{#if data.pendingOutgoing.length > 0}
	<h3>Awaiting response</h3>
	<ul>
		{#each data.pendingOutgoing as request (request.id)}
			<li>
				<a href={resolve('/(authed)/requests/[id]', { id: String(request.id) })}
					>{request.item!.name}</a
				>
			</li>
		{/each}
	</ul>
{/if}

{#if data.readyToPickUp.length === 0 && data.pendingOutgoing.length === 0}
	<p>No pending borrow requests.</p>
{/if}

<h2>Requests to borrow your items</h2>
<ul>
	{#each data.incomingRequests as item (item.id)}
		<li>
			{item.name}
			<ul>
				{#each item.borrowRequests as request (request.id)}
					<li>
						<a href={resolve('/(authed)/requests/[id]', { id: String(request.id) })}
							>{request.user!.name} - {request.createdAt}</a
						>
					</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>
