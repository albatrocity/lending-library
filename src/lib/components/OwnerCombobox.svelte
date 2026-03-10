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

	type Owner = { id: string; name: string; email: string };

	let {
		topOwners,
		selectedOwnerId
	}: { topOwners: Owner[]; selectedOwnerId?: string } = $props();

	let searchResults = $state<Owner[] | null>(null);
	let inputValue = $state('');

	const ownerItems = $derived(searchResults ?? topOwners);

	const collection = $derived(
		createListCollection({
			items: ownerItems,
			itemToValue: (item: Owner) => item.id,
			itemToString: (item: Owner) => item.name
		})
	);

	const initialValue = $derived(selectedOwnerId ? [selectedOwnerId] : []);

	const combobox = useCombobox(() => ({
		id: 'owner-filter',
		collection,
		defaultValue: initialValue,
		onInputValueChange: ({ inputValue: v }: { inputValue: string }) => {
			inputValue = v;
		},
		openOnClick: true
	}));

	const selectedValue = $derived(combobox().value[0] ?? '');

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

<ComboboxRootProvider value={combobox}>
	<ComboboxControl>
		<ComboboxInput placeholder="Filter by owner..." />
		<ComboboxTrigger>▼</ComboboxTrigger>
		{#if selectedValue}
			<ComboboxClearTrigger>✕</ComboboxClearTrigger>
		{/if}
	</ComboboxControl>

	<Portal>
		<ComboboxPositioner>
			<ComboboxContent>
				{#each ownerItems as item (item.id)}
					<ComboboxItem {item}>
						<ComboboxItemText>{item.name} ({item.email})</ComboboxItemText>
					</ComboboxItem>
				{/each}
			</ComboboxContent>
		</ComboboxPositioner>
	</Portal>

	<input type="hidden" name="owner" value={selectedValue} />
</ComboboxRootProvider>
