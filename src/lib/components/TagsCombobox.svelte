<script lang="ts">
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
	import { tick } from 'svelte';

	type Tag = { id: number; name: string };

	let {
		topTags,
		initialTags = [],
		creatable = true,
		onchange
	}: {
		topTags: Tag[];
		initialTags?: { name: string }[];
		creatable?: boolean;
		onchange?: () => void;
	} = $props();

	let searchResults = $state<Tag[] | null>(null);
	let inputValue = $state('');

	const tagItems = $derived(searchResults ?? topTags);

	const tagsInput = useTagsInput(() => ({
		id: 'tags-combobox',
		defaultValue: initialTags.map((t) => t.name),
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
			items: tagItems,
			itemToValue: (item: Tag) => item.name,
			itemToString: (item: Tag) => item.name
		})
	);

	const combobox = useCombobox(() => ({
		id: 'tags-combobox-listbox',
		collection,
		// The rendered control element ends up with the TagsInput's control ID
		// (mergeProps overwrites with the later arg). Point the Combobox machine
		// at that same ID so getControlEl() can find the anchor for positioning.
		ids: { control: tagsInput().getControlProps().id ?? undefined },
		selectionBehavior: 'clear',
		onValueChange: ({ value }) => {
			const selectedName = value[0];
			if (selectedName) {
				tagsInput().addValue(selectedName);
				tagsInput().clearInputValue();
			}
		}
	}));

	const hasExactMatch = $derived(
		tagItems.some((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase())
	);

	const showCreateOption = $derived(creatable && inputValue.trim().length > 0 && !hasExactMatch);

	const createOptionItem: Tag = $derived({ id: -1, name: inputValue.trim() });

	const comboRecipe = comboboxRecipe();
	const tagsRecipe = tagsInputRecipe();

	$effect(() => {
		const q = inputValue;
		if (!q.trim()) {
			searchResults = null;
			return;
		}
		const timer = setTimeout(async () => {
			const res = await fetch(`/tags?q=${encodeURIComponent(q)}`);
			searchResults = await res.json();
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
					<TagsInputInput placeholder="Add tags..." class={tagsRecipe.input}>
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
					{#each tagItems as item (item.name)}
						<ComboboxItem {item} class={comboRecipe.item}>
							<ComboboxItemText>{item.name}</ComboboxItemText>
						</ComboboxItem>
					{/each}
					{#if showCreateOption}
						<ComboboxItem item={createOptionItem} class={comboRecipe.item}>
							<ComboboxItemText>+ Create "{inputValue.trim()}"</ComboboxItemText>
						</ComboboxItem>
					{/if}
				</ComboboxContent>
			</ComboboxPositioner>
		</Portal>

		{#each tagsInput().value as tag (tag)}
			<input type="hidden" name="tags" value={tag} />
		{/each}
	</ComboboxRootProvider>
</TagsInputRootProvider>
