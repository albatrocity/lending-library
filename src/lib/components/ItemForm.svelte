<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Item } from '$lib/schemas/items';
	import TagsCombobox from './TagsCombobox.svelte';

	type Tag = { id: number; name: string };

	let {
		action,
		item,
		topTags
	}: { action: string; item?: Item & { tags?: Tag[] }; topTags: Tag[] } = $props();
</script>

<div>
	<form method="post" {action} use:enhance>
		<input type="text" name="name" placeholder="Name" value={item?.name} />
		<input type="text" name="description" placeholder="Description" value={item?.description} />
		<TagsCombobox {topTags} initialTags={item?.tags} />
		<button type="submit">Save</button>
	</form>
</div>
