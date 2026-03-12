<script lang="ts">
	import { useAsyncList } from '@ark-ui/svelte/collection';
	import { createListCollection } from '@ark-ui/svelte/combobox';
	import type { ValueChangeDetails } from '@zag-js/combobox';
	import { tick, untrack } from 'svelte';
	import TagsCombobox from './TagsCombobox.svelte';

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

	const asyncList = useAsyncList<Tag>(() => ({
		initialItems: topTags,
		async load({ filterText, signal }) {
			if (!filterText.trim()) return { items: topTags };
			const res = await fetch(`/tags?q=${encodeURIComponent(filterText)}`, { signal });
			return { items: await res.json() };
		}
	}));

	let selectedValues: string[] = $state(untrack(() => initialTags.map((t) => t.name)));

	const collection = $derived(
		createListCollection({
			items: asyncList().items.filter((item) => !selectedValues.includes(item.name)),
			itemToValue: (t) => t.name,
			itemToString: (t) => t.name
		})
	);

	function handleInputValueChange(details: { inputValue: string; reason?: string }) {
		if (details.reason === 'input-change') {
			asyncList().setFilterText(details.inputValue);
		}
	}

	async function handleValueChange(details: ValueChangeDetails<Tag>) {
		selectedValues = details.value;
		await tick();
		onchange?.();
	}
</script>

<TagsCombobox
	{collection}
	itemToValue={(t) => t.name}
	itemToString={(t) => t.name}
	defaultValue={initialTags.map((t) => t.name)}
	createItem={(v) => ({ id: -1, name: v })}
	name="tags"
	openOnClick
	closeOnSelect={false}
	loading={asyncList().loading}
	{creatable}
	oninputvaluechange={handleInputValueChange}
	onvaluechange={handleValueChange}
/>
