<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import { stack } from 'styled-system/patterns/stack';
	let { data } = $props();
	const item = $derived(data.item);
	const borrowRequests = $derived(data.borrowRequests);
	// const borrows = $derived(data.borrows);
</script>

<PageContent>
	<PageHeader title="Borrow {item.name}" />

	<div class={stack({ gap: '4', direction: 'row' })}>
		<section class={stack({ width: '60%' })}>
			<form method="post" action="?/request" use:enhance>
				<Fieldset legend="Request to borrow">
					<input type="date" name="startDate" />
					<input type="date" name="endDate" />
					<TextArea name="description" placeholder="Description" />
					<Button type="submit">Request to borrow</Button>
				</Fieldset>
			</form>
		</section>

		<section class={stack({ width: '40%' })}>
			<Card>
				{#snippet header()}
					<h3>History</h3>
				{/snippet}

				{#if data.userOwnsItem}
					<ul>
						{#each borrowRequests as request (request.id)}
							<li>{request.startDate} - {request.endDate} - {request.status}</li>
						{/each}
					</ul>
				{:else}
					{data.borrowRequestsCount} current request{data.borrowRequestsCount === 1 ? '' : 's'} to borrow
					this item
				{/if}
			</Card>
		</section>
	</div>
</PageContent>
