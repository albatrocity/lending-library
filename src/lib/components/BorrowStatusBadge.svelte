<script lang="ts">
	import Badge from './Badge.svelte';
	import { getUserContext } from '$lib/contexts/user.svelte';

	const { activeBorrowerId }: { activeBorrowerId?: string | null } = $props();

	const getUser = getUserContext();
	const status = $derived(
		activeBorrowerId === getUser().id
			? 'borrowed'
			: activeBorrowerId
				? 'unavailable'
				: null
	);
</script>

{#if status === 'borrowed'}
	<Badge status="borrowed" label="Borrowing" />
{:else if status === 'unavailable'}
	<Badge status="unavailable" label="Unavailable" />
{/if}
