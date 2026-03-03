<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	const request = $derived(data.borrowRequest);
</script>

{#if data.isOutgoing}
	<h1>Your request</h1>
	{#if request.status === 'pending'}
		<p>Your request is still pending.</p>
		<form
			method="post"
			action="?/cancel"
			use:enhance={({ cancel }) => {
				if (!confirm('Are you sure you want to cancel this request?')) {
					cancel();
				}
			}}
		>
			<button type="submit">Cancel request</button>
		</form>
	{:else}
		<p>
			Request {request.status === 'accepted' ? 'accepted' : request.status === 'rejected' ? 'rejected' : 'cancelled'}
			at {request.updatedAt.toLocaleString()}.
		</p>
	{/if}
{:else}
	<p>
		{request.user!.name} wants to borrow {request.item!.name} starting {request.startDate}
		{#if request.endDate}and ending {request.endDate}{/if}.
	</p>
	<blockquote>
		{@html request.description}
	</blockquote>

	{#if request.status === 'pending'}
		<form method="post" action="?/accept" use:enhance>
			<button type="submit">Accept</button>
		</form>
		<form method="post" action="?/reject" use:enhance>
			<button type="submit">Reject</button>
		</form>
	{:else}
		<p>
			Request {request.status === 'accepted' ? 'accepted' : 'rejected'} at {request.updatedAt.toLocaleString()}.
		</p>
	{/if}
{/if}
