<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';

	let { data, form } = $props();
	const request = $derived(data.borrowRequest);
	const borrow = $derived(data.borrow);
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
			<Button type="submit">Cancel request</Button>
		</form>
	{:else if request.status === 'accepted'}
		<p>Your request was accepted on {request.updatedAt.toLocaleString()}.</p>
		{#if borrow?.status === 'active' || form?.delivered}
			<p>Item delivered.</p>
		{:else}
			<form
				method="post"
				action="?/markReceived"
				use:enhance={({ cancel }) => {
					if (!confirm('Confirm that you have received this item?')) {
						cancel();
					}
				}}
			>
				<Button type="submit">Mark as received</Button>
			</form>
		{/if}
	{:else}
		<p>
			Request {request.status === 'rejected' ? 'rejected' : 'cancelled'} at {request.updatedAt.toLocaleString()}.
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
			<Button type="submit">Accept</Button>
		</form>
		<form method="post" action="?/reject" use:enhance>
			<Button type="submit">Reject</Button>
		</form>
	{:else if request.status === 'accepted'}
		<p>Accepted at {request.updatedAt.toLocaleString()}.</p>
		{#if borrow?.status === 'active' || form?.delivered}
			<p>Item delivered.</p>
		{:else}
			<form
				method="post"
				action="?/markReceived"
				use:enhance={({ cancel }) => {
					if (!confirm('Confirm that you have delivered this item?')) {
						cancel();
					}
				}}
			>
				<Button type="submit">Mark as delivered</Button>
			</form>
		{/if}
	{:else}
		<p>
			Request {request.status === 'rejected' ? 'rejected' : 'cancelled'} at {request.updatedAt.toLocaleString()}.
		</p>
	{/if}
{/if}
