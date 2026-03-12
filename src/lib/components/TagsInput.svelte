<script lang="ts">
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

	async function search(q: string): Promise<Tag[]> {
		const res = await fetch(`/tags?q=${encodeURIComponent(q)}`);
		return res.json();
	}
</script>

<TagsCombobox
	defaultItems={topTags}
	{search}
	itemToValue={(t) => t.name}
	itemToString={(t) => t.name}
	defaultValue={initialTags.map((t) => t.name)}
	createItem={(v) => ({ id: -1, name: v })}
	name="tags"
	id="tags-input"
	openOnClick
	closeOnSelect={false}
	{creatable}
	{onchange}
/>
