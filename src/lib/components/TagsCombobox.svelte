<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import {
		useTagsInput,
		TagsInputRootProvider,
		TagsInputControl,
		TagsInputItem,
		TagsInputItemPreview,
		TagsInputItemText,
		TagsInputItemDeleteTrigger,
		TagsInputInput
	} from '@ark-ui/svelte/tags-input';
	import {
		useCombobox,
		ComboboxRootProvider,
		ComboboxControl,
		ComboboxInput,
		ComboboxPositioner,
		ComboboxContent,
		ComboboxItem,
		ComboboxItemText,
		createListCollection
	} from '@ark-ui/svelte/combobox';
	import { Portal } from '@ark-ui/svelte/portal';
	import { combobox as comboboxRecipe, tagsInput as tagsInputRecipe } from 'styled-system/recipes';
	import { tick, untrack } from 'svelte';

	type Props = {
		defaultItems: T[];
		itemToValue: (item: T) => string;
		itemToString: (item: T) => string;
		id: string;
		defaultValue?: string[];
		creatable?: boolean;
		/** Required when creatable is true — constructs a synthetic T for the "create" option */
		createItem?: (value: string) => T;
		placeholder?: string;
		/** Name attribute for hidden form inputs. If omitted, no hidden inputs are rendered. */
		name?: string;
		onchange?: () => void;
		row?: Snippet<[T]>;
		openOnClick?: boolean;
		closeOnSelect?: boolean;

		// Provide at most one of these for search behaviour:
		/** Async search called with a 300 ms debounce when the input changes */
		search?: (query: string) => Promise<T[]>;
		/** Finite list filtered client-side when the input changes */
		items?: T[];
		/** Custom filter predicate used with `items` (default: case-insensitive itemToString.includes) */
		filterFn?: (item: T, query: string) => boolean;
	};

	let {
		defaultItems,
		itemToValue,
		itemToString,
		defaultValue = [],
		creatable = true,
		createItem,
		placeholder = 'Add tags...',
		name,
		id,
		openOnClick = false,
		closeOnSelect = true,
		onchange,
		row,
		search,
		items,
		filterFn
	}: Props = $props();

	let asyncResults = $state<T[] | null>(null);
	let inputValue = $state('');

	// Resolve a stored form value back to its display label using defaultItems.
	// Falls back to the value itself when the item isn't found (e.g. label === value).
	function valueToLabel(value: string): string {
		const item = defaultItems.find((i) => itemToValue(i) === value);
		return item ? itemToString(item) : value;
	}

	// Maps display label → form value so TagsInput can show labels while
	// hidden inputs emit the correct underlying values.
	let labelToValue = $state<Record<string, string>>(
		untrack(() => Object.fromEntries(defaultValue.map((v) => [valueToLabel(v), v])))
	);

	// Synchronous client-side filter — computed reactively, no side-effects
	const syncResults = $derived.by(() => {
		if (!items || !inputValue.trim()) return null;
		const q = inputValue;
		const fn =
			filterFn ??
			((item: T, query: string) => itemToString(item).toLowerCase().includes(query.toLowerCase()));
		return items.filter((item) => fn(item, q));
	});

	const visibleItems = $derived(asyncResults ?? syncResults ?? defaultItems);

	const tagsInput = useTagsInput(() => ({
		id,
		// TagsInput stores and displays labels; values are tracked separately in labelToValue.
		defaultValue: defaultValue.map(valueToLabel),
		onInputValueChange: ({ inputValue: v }) => {
			inputValue = v;
		},
		onValueChange: async () => {
			await tick();
			onchange?.();
		}
	}));

	const collection = $derived(
		createListCollection({
			items: visibleItems,
			itemToValue,
			itemToString
		})
	);

	const combobox = useCombobox(() => ({
		id,
		collection,
		// The actual control and input elements belong to the TagsInput machine —
		// tell the Combobox machine where to find them so positioning and openOnClick work.
		ids: {
			control: tagsInput().getControlProps().id ?? undefined,
			input: tagsInput().getInputProps().id ?? undefined
		},
		openOnClick,
		closeOnSelect,
		selectionBehavior: 'clear',
		onValueChange: ({ value }) => {
			const selectedValue = value[0];
			if (selectedValue) {
				const item = visibleItems.find((i) => itemToValue(i) === selectedValue);
				const label = item ? itemToString(item) : selectedValue;
				labelToValue[label] = selectedValue;
				tagsInput().addValue(label);
				tagsInput().clearInputValue();
			}
		}
	}));

	const hasExactMatch = $derived(
		visibleItems.some(
			(item) => itemToString(item).toLowerCase() === inputValue.trim().toLowerCase()
		)
	);

	const showCreateOption = $derived(
		creatable && !!createItem && inputValue.trim().length > 0 && !hasExactMatch
	);

	const createOptionItem = $derived(createItem ? createItem(inputValue.trim()) : null);

	const comboRecipe = comboboxRecipe();
	const tagsRecipe = tagsInputRecipe();

	// Async search with debounce — must use $effect since it involves a timer and async fetch
	$effect(() => {
		const q = inputValue;
		if (!q.trim() || !search) {
			asyncResults = null;
			return;
		}
		const timer = setTimeout(async () => {
			asyncResults = await search(q);
		}, 300);
		return () => clearTimeout(timer);
	});
</script>

<TagsInputRootProvider value={tagsInput}>
	<ComboboxRootProvider value={combobox}>
		<TagsInputControl class={tagsRecipe.control}>
			{#snippet asChild(tagsInputControlProps)}
				<ComboboxControl {...tagsInputControlProps()} class={comboRecipe.control}>
					{#each tagsInput().value as tag, index (tag)}
						<TagsInputItem {index} value={tag} class={tagsRecipe.item}>
							<TagsInputItemPreview class={tagsRecipe.itemPreview}>
								<TagsInputItemText class={tagsRecipe.itemText}>{tag}</TagsInputItemText>
								<TagsInputItemDeleteTrigger class={tagsRecipe.itemDeleteTrigger}
									>×</TagsInputItemDeleteTrigger
								>
							</TagsInputItemPreview>
						</TagsInputItem>
					{/each}
					<TagsInputInput {placeholder} class={tagsRecipe.input}>
						{#snippet asChild(tagsInputProps)}
							<ComboboxInput {...tagsInputProps()} class={comboRecipe.input} />
						{/snippet}
					</TagsInputInput>
				</ComboboxControl>
			{/snippet}
		</TagsInputControl>

		<Portal>
			<ComboboxPositioner>
				<ComboboxContent class={comboRecipe.content}>
					{#each visibleItems as item (itemToValue(item))}
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
				</ComboboxContent>
			</ComboboxPositioner>
		</Portal>

		{#if name}
			{#each tagsInput().value as label (label)}
				<input type="hidden" {name} value={labelToValue[label] ?? label} />
			{/each}
		{/if}
	</ComboboxRootProvider>
</TagsInputRootProvider>
