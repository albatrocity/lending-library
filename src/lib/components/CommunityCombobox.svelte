<script lang="ts">
	import Combobox from './Combobox.svelte';
	import { tick } from 'svelte';

	type Community = { id: number; name: string };

	let {
		communities,
		selectedCommunityId,
		onchange
	}: { communities: Community[]; selectedCommunityId?: number; onchange?: () => void } = $props();

	let inputValue = $state('');
	let selectedValue = $state(selectedCommunityId != null ? String(selectedCommunityId) : '');

	const filteredItems = $derived(
		inputValue.trim()
			? communities.filter((c) => c.name.toLowerCase().includes(inputValue.trim().toLowerCase()))
			: communities
	);
</script>

<Combobox
	items={filteredItems}
	itemToValue={(c) => String(c.id)}
	itemToString={(c) => c.name}
	itemKey={(c) => c.id}
	placeholder="Filter by community..."
	id="community-filter"
	defaultValue={selectedCommunityId != null ? [String(selectedCommunityId)] : []}
	oninputvaluechange={(v) => (inputValue = v)}
	onvaluechange={async (v) => {
		selectedValue = v;
		await tick();
		onchange?.();
	}}
>
	{#snippet row(item)}
		{item.name}
	{/snippet}

	<input type="hidden" name="community" value={selectedValue} />
</Combobox>
