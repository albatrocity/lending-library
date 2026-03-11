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
	import { combobox as comboboxRecipe } from 'styled-system/recipes';

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
	const recipe = comboboxRecipe();
</script>

<ComboboxRootProvider value={combobox}>
	<ComboboxControl class={recipe.control}>
		<ComboboxInput class={recipe.input} placeholder="Filter by community..." />
		<ComboboxTrigger class={recipe.trigger}>▼</ComboboxTrigger>
		{#if selectedValue}
			<ComboboxClearTrigger class={recipe.clearTrigger}>✕</ComboboxClearTrigger>
		{/if}
	</ComboboxControl>

	<Portal>
		<ComboboxPositioner class={recipe.positioner}>
			<ComboboxContent class={recipe.content}>
				{#each filteredItems as item (item.id)}
					<ComboboxItem {item} class={recipe.item}>
						<ComboboxItemText class={recipe.itemText}>{item.name}</ComboboxItemText>
					</ComboboxItem>
				{/each}
			</ComboboxContent>
		</ComboboxPositioner>
	</Portal>

	<input type="hidden" name="community" value={selectedValue} />
</ComboboxRootProvider>
