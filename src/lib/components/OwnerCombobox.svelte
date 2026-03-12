<script lang="ts">
	import Combobox from './Combobox.svelte';
	import { tick } from 'svelte';

	type Owner = { id: string; name: string; email: string };

	let {
		topOwners,
		selectedOwnerId,
		onchange
	}: { topOwners: Owner[]; selectedOwnerId?: string; onchange?: () => void } = $props();

	let searchResults = $state<Owner[] | null>(null);
	let inputValue = $state('');
	let selectedValue = $state(selectedOwnerId ?? '');

	const ownerItems = $derived(searchResults ?? topOwners);

	$effect(() => {
		const q = inputValue;
		if (!q.trim()) {
			searchResults = null;
			return;
		}
		const timer = setTimeout(async () => {
			const res = await fetch(`/users?q=${encodeURIComponent(q)}`);
			searchResults = await res.json();
		}, 300);
		return () => clearTimeout(timer);
	});
</script>

<Combobox
	items={ownerItems}
	itemToValue={(o) => o.id}
	itemToString={(o) => o.name}
	itemKey={(o) => o.id}
	placeholder="Filter by owner..."
	id="owner-filter"
	defaultValue={selectedOwnerId ? [selectedOwnerId] : []}
	oninputvaluechange={(v) => (inputValue = v)}
	onvaluechange={async (v) => {
		selectedValue = v;
		await tick();
		onchange?.();
	}}
>
	{#snippet row(item)}
		{item.name} ({item.email})
	{/snippet}

	<input type="hidden" name="owner" value={selectedValue} />
</Combobox>
