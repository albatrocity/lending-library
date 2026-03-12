<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Item } from '$lib/schemas/items';
	import TagsInput from './TagsInput.svelte';
	import Button from './Button.svelte';
	import Field from './Field.svelte';
	import TextInput from './TextInput.svelte';

	type Tag = { id: number; name: string };

	let {
		action,
		item,
		topTags
	}: { action: string; item?: Item & { tags?: Tag[] }; topTags: Tag[] } = $props();
</script>

<div>
	<form method="post" {action} use:enhance>
		<Field label="Name">
			<TextInput name="name" placeholder="Name" value={item?.name} />
		</Field>
		<Field label="Description">
			<TextInput name="description" placeholder="Description" value={item?.description} />
		</Field>
		<Field label="Tags">
			<TagsInput {topTags} initialTags={item?.tags} />
		</Field>
		<Button type="submit">Save</Button>
	</form>
</div>
