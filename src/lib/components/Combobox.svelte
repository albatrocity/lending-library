<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
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
	import { combobox as comboboxRecipe } from 'styled-system/recipes';

	type Props = {
		items: T[];
		itemToValue: (item: T) => string;
		itemToString: (item: T) => string;
		itemKey: (item: T) => string | number;
		placeholder?: string;
		id?: string;
		defaultValue?: string[];
		openOnClick?: boolean;
		oninputvaluechange?: (value: string) => void;
		onvaluechange?: (value: string) => void;
		row: Snippet<[T]>;
		children?: Snippet;
	};

	let {
		items,
		itemToValue,
		itemToString,
		itemKey,
		placeholder = '',
		id,
		defaultValue = [],
		openOnClick = true,
		oninputvaluechange,
		onvaluechange,
		row,
		children
	}: Props = $props();

	const collection = $derived(
		createListCollection({ items, itemToValue, itemToString })
	);

	const combobox = useCombobox(() => ({
		id,
		collection,
		defaultValue,
		onInputValueChange: ({ inputValue: v }: { inputValue: string }) => {
			oninputvaluechange?.(v);
		},
		onValueChange: ({ value }: { value: string[] }) => {
			onvaluechange?.(value[0] ?? '');
		},
		openOnClick
	}));

	const selectedValue = $derived(combobox().value[0] ?? '');
	const recipe = comboboxRecipe();
</script>

<ComboboxRootProvider value={combobox}>
	<ComboboxControl class={recipe.control}>
		<ComboboxInput class={recipe.input} {placeholder} />
		<ComboboxTrigger class={recipe.trigger}>▼</ComboboxTrigger>
		{#if selectedValue}
			<ComboboxClearTrigger class={recipe.clearTrigger}>✕</ComboboxClearTrigger>
		{/if}
	</ComboboxControl>

	<Portal>
		<ComboboxPositioner class={recipe.positioner}>
			<ComboboxContent class={recipe.content}>
				{#each items as item (itemKey(item))}
					<ComboboxItem {item} class={recipe.item}>
						<ComboboxItemText class={recipe.itemText}>
							{@render row(item)}
						</ComboboxItemText>
					</ComboboxItem>
				{/each}
			</ComboboxContent>
		</ComboboxPositioner>
	</Portal>

	{@render children?.()}
</ComboboxRootProvider>
