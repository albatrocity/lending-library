<script lang="ts">
	let { data } = $props();
</script>

<h1>Requests</h1>

<h2>Borrowing</h2>
<ul>
	{#each data.outgoingRequests as request}
		<li>
			<a href={`/requests/${request.id}`}>{request.item!.name}</a>: {request.status}
		</li>
	{/each}
</ul>

<h2>Lending</h2>
<ul>
	{#each data.incomingRequests as item}
		<li>
			{item.name}
			<ul>
				{#each item.borrowRequests as request}
					<li>
						<a href={`/requests/${request.id}`}>{request.user!.name} - {request.createdAt}</a>
					</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>
