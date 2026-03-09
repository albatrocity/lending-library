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

	type Tag = { id: number; name: string };

	let { topTags, initialTags = [] }: { topTags: Tag[]; initialTags?: { name: string }[] } =
		$props();

	let searchResults = $state<Tag[] | null>(null);
	let inputValue = $state('');

	const tagItems = $derived(searchResults ?? topTags);

	const tagsInput = useTagsInput(() => ({
		id: 'tags-combobox',
		defaultValue: initialTags.map((t) => t.name),
		onInputValueChange: ({ inputValue: v }) => {
			inputValue = v;
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
		allowCustomValue: true,
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

	const showCreateOption = $derived(inputValue.trim().length > 0 && !hasExactMatch);

	const createOptionItem: Tag = $derived({ id: -1, name: inputValue.trim() });

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
		<TagsInputControl>
			{#snippet asChild(tagsInputControlProps)}
				<ComboboxControl {...tagsInputControlProps()}>
					{#each tagsInput().value as tag, index (tag)}
						<TagsInputItem {index} value={tag}>
							<TagsInputItemPreview>
								<TagsInputItemText>{tag}</TagsInputItemText>
								<TagsInputItemDeleteTrigger>×</TagsInputItemDeleteTrigger>
							</TagsInputItemPreview>
						</TagsInputItem>
					{/each}
					<TagsInputInput placeholder="Add tags...">
						{#snippet asChild(tagsInputProps)}
							<ComboboxInput {...tagsInputProps()} />
						{/snippet}
					</TagsInputInput>
				</ComboboxControl>
			{/snippet}
		</TagsInputControl>

		<Portal>
			<ComboboxPositioner>
				<ComboboxContent>
					{#each tagItems as item (item.name)}
						<ComboboxItem {item}>
							<ComboboxItemText>{item.name}</ComboboxItemText>
						</ComboboxItem>
					{/each}
					{#if showCreateOption}
						<ComboboxItem item={createOptionItem}>
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
