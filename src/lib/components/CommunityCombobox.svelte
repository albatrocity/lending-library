<script lang="ts">
	import {
		useCombobox,
		ComboboxRootProvider,
		ComboboxControl,
		ComboboxInput,
		ComboboxTrigger,
		ComboboxClearTrigger,
		ComboboxPositioner,
		ComboboxContent,
		ComboboxItem,
		ComboboxItemText,
		createListCollection
	} from '@ark-ui/svelte/combobox';
	import { Portal } from '@ark-ui/svelte/portal';
	import { tick } from 'svelte';

	type Community = { id: number; name: string };

	let {
		communities,
		selectedCommunityId,
		onchange
	}: { communities: Community[]; selectedCommunityId?: number; onchange?: () => void } = $props();

	let inputValue = $state('');

	const filteredItems = $derived(
		inputValue.trim()
			? communities.filter((c) => c.name.toLowerCase().includes(inputValue.trim().toLowerCase()))
			: communities
	);

	const collection = $derived(
		createListCollection({
			items: filteredItems,
			itemToValue: (item: Community) => String(item.id),
			itemToString: (item: Community) => item.name
		})
	);

	const initialValue = $derived(selectedCommunityId ? [String(selectedCommunityId)] : []);

	const combobox = useCombobox(() => ({
		id: 'community-filter',
		collection,
		defaultValue: initialValue,
		onInputValueChange: ({ inputValue: v }: { inputValue: string }) => {
			inputValue = v;
		},
		onValueChange: async () => {
			await tick();
			onchange?.();
		},
		openOnClick: true
	}));

	const selectedValue = $derived(combobox().value[0] ?? '');
</script>

<ComboboxRootProvider value={combobox}>
	<ComboboxControl>
		<ComboboxInput placeholder="Filter by community..." />
		<ComboboxTrigger>▼</ComboboxTrigger>
		{#if selectedValue}
			<ComboboxClearTrigger>✕</ComboboxClearTrigger>
		{/if}
	</ComboboxControl>

	<Portal>
		<ComboboxPositioner>
			<ComboboxContent>
				{#each filteredItems as item (item.id)}
					<ComboboxItem {item}>
						<ComboboxItemText>{item.name}</ComboboxItemText>
					</ComboboxItem>
				{/each}
			</ComboboxContent>
		</ComboboxPositioner>
	</Portal>

	<input type="hidden" name="community" value={selectedValue} />
</ComboboxRootProvider>
