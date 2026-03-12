<script lang="ts" generics="T extends import('@ark-ui/svelte/combobox').CollectionItem">
	import type { Snippet } from 'svelte';
	import type { ListCollection } from '@ark-ui/svelte/combobox';
	import type { InputValueChangeDetails, ValueChangeDetails } from '@zag-js/combobox';
	import { untrack } from 'svelte';
	import {
		useCombobox,
		createListCollection,
		ComboboxRootProvider,
		ComboboxControl,
		ComboboxEmpty,
		ComboboxInput,
		ComboboxPositioner,
		ComboboxContent,
		ComboboxItem,
		ComboboxItemText,
		ComboboxTrigger
	} from '@ark-ui/svelte/combobox';
	import { Portal } from '@ark-ui/svelte/portal';
	import { combobox as comboboxRecipe, tagsInput as tagsInputRecipe } from 'styled-system/recipes';
	import { css, cx } from 'styled-system/css';
	import { SvelteMap } from 'svelte/reactivity';

	type Props = {
		id?: string;
		collection: ListCollection<T>;
		itemToValue: (item: T) => string;
		itemToString: (item: T) => string;
		defaultValue?: string[];
		creatable?: boolean;
		/** Required when creatable is true — constructs a synthetic T for the "create" option */
		createItem?: (value: string) => T;
		inputBehavior?: 'none' | 'autohighlight' | 'autocomplete';
		loading?: boolean;
		placeholder?: string;
		/** Name attribute for hidden form inputs. If omitted, no hidden inputs are rendered. */
		name?: string;
		openOnClick?: boolean;
		closeOnSelect?: boolean;
		row?: Snippet<[T]>;
		emptyMessage?: string;
		oninputvaluechange?: (details: InputValueChangeDetails) => void;
		onvaluechange?: (details: ValueChangeDetails<T>) => void;
	};

	const uid = $props.id();

	let {
		id = uid,
		collection,
		itemToValue,
		itemToString,
		defaultValue = [],
		creatable = false,
		createItem,
		inputBehavior = 'none',
		loading = false,
		placeholder = 'Add tags...',
		name,
		openOnClick = false,
		closeOnSelect = true,
		row,
		emptyMessage,
		oninputvaluechange,
		onvaluechange
	}: Props = $props();

	let inputValue = $state('');

	// Created items aren't in the collection so Zag can't resolve them back from
	// value → item. Keep a local cache so we can populate selectedItems ourselves.
	const createdItemCache = new SvelteMap<string, T>();

	// Zag does not fire onValueChange for defaultValue, so we resolve the initial
	// selected items ourselves. defaultValue items may be absent from collection
	// (e.g. TagsInput filters them out), so fall back to createItem when needed.
	let selectedItems: T[] = $state(
		untrack(() =>
			defaultValue
				.map((v) => {
					const found = collection.items.find((i) => itemToValue(i) === v);
					if (found) return found;
					if (createItem) {
						const created = createItem(v);
						createdItemCache.set(v, created);
						return created;
					}
					return null;
				})
				.filter((i): i is T => i != null)
		)
	);

	const hasExactMatch = $derived(
		collection.items.some(
			(item) => itemToString(item).toLowerCase() === inputValue.trim().toLowerCase()
		)
	);

	const showCreateOption = $derived(
		creatable && !!createItem && inputValue.trim().length > 0 && !hasExactMatch
	);

	const createOptionItem = $derived(createItem ? createItem(inputValue.trim()) : null);

	// Include the create option in the collection so Zag's keyboard navigation
	// can reach it. The ComboboxItem in the template renders the special label.
	const effectiveCollection = $derived(
		showCreateOption && createOptionItem
			? createListCollection({
					items: [...collection.items, createOptionItem],
					itemToValue,
					itemToString
				})
			: collection
	);

	const combobox = useCombobox<T>(() => ({
		id,
		collection: effectiveCollection,
		multiple: true,
		selectionBehavior: 'clear',
		inputBehavior,
		openOnClick,
		closeOnSelect,
		defaultValue,
		allowCustomValue: creatable,
		onInputValueChange(details) {
			inputValue = details.inputValue;
			oninputvaluechange?.(details);
		},
		onValueChange(details) {
			if (creatable && createItem) {
				const resolvedValues = new Set(details.items.map((i) => itemToValue(i)));
				for (const v of details.value) {
					if (!resolvedValues.has(v) && !createdItemCache.has(v)) {
						createdItemCache.set(v, createItem(v));
					}
				}
				for (const v of createdItemCache.keys()) {
					if (!details.value.includes(v)) createdItemCache.delete(v);
				}
			}
			selectedItems = details.value
				.map((v) => details.items.find((i) => itemToValue(i) === v) ?? createdItemCache.get(v))
				.filter((i): i is T => i != null);
			onvaluechange?.(details);
			if (closeOnSelect) {
				combobox().setInputValue('');
			}
		}
	}));

	function removeTag(value: string) {
		combobox().clearValue(value);
	}

	const comboRecipe = comboboxRecipe();
	const tagsRecipe = tagsInputRecipe();
</script>

<ComboboxRootProvider
	immediate
	value={combobox}
	onkeydown={(e: KeyboardEvent) => {
		if (e.key === 'Enter') e.preventDefault();
	}}
>
	<div
		class={cx(
			comboRecipe.control,
			css({ display: 'inline-flex', flexWrap: 'wrap', width: '100%' })
		)}
	>
		<div class={comboRecipe.tagList}>
			{#each selectedItems as item (itemToValue(item))}
				<span class={tagsRecipe.itemPreview}>
					<span class={tagsRecipe.itemText}>{itemToString(item)}</span>
					<button
						type="button"
						class={tagsRecipe.itemDeleteTrigger}
						onclick={() => removeTag(itemToValue(item))}
					>
						&times;
					</button>
				</span>
			{/each}
			<ComboboxControl class={css({ flex: 1 })}>
				<ComboboxInput {placeholder} class={cx(comboRecipe.input, css({ flex: 1 }))} />
				<div class={comboRecipe.indicatorGroup}>
					<ComboboxTrigger class={comboRecipe.trigger}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />
						</svg>
					</ComboboxTrigger>
				</div>
			</ComboboxControl>
		</div>
	</div>

	<Portal>
		<ComboboxPositioner>
			<ComboboxContent class={comboRecipe.content}>
				{#if emptyMessage}
					<ComboboxEmpty class={comboRecipe.empty}>{emptyMessage}</ComboboxEmpty>
				{/if}
				{#if loading}
					<div class={css({ layerStyle: 'disabled', textStyle: 'sm', px: '2', py: '2' })}>
						Searching…
					</div>
				{:else}
					{#each collection.items as item (itemToValue(item))}
						<ComboboxItem {item} class={comboRecipe.item}>
							<ComboboxItemText>
								{#if row}
									{@render row(item)}
								{:else}
									{itemToString(item)}
								{/if}
							</ComboboxItemText>
						</ComboboxItem>
					{/each}
					{#if showCreateOption && createOptionItem}
						<ComboboxItem item={createOptionItem} class={comboRecipe.item}>
							<ComboboxItemText>+ Create "{inputValue.trim()}"</ComboboxItemText>
						</ComboboxItem>
					{/if}
				{/if}
			</ComboboxContent>
		</ComboboxPositioner>
	</Portal>

	{#if name}
		{#each combobox().value as value (value)}
			<input type="hidden" {name} {value} />
		{/each}
	{/if}
</ComboboxRootProvider>
