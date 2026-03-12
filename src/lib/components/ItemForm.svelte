<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Item } from '$lib/schemas/items';
	import TagsCombobox from './TagsCombobox.svelte';
	import Button from './Button.svelte';
	import ImageUpload from './ImageUpload.svelte';

	type Tag = { id: number; name: string };
	type Image = { id: number; url: string };

	let {
		action,
		item,
		topTags
	}: {
		action: string;
		item?: Item & { tags?: Tag[]; images?: Image[] };
		topTags: Tag[];
	} = $props();
</script>

<div>
	<form method="post" {action} use:enhance>
		<input type="text" name="name" placeholder="Name" value={item?.name} />
		<input type="text" name="description" placeholder="Description" value={item?.description} />
		<TagsCombobox {topTags} initialTags={item?.tags} />

		{#if item?.id}
			<ImageUpload itemId={item.id} images={item.images ?? []} />
		{:else}
			<p>You can add images after creating the item.</p>
		{/if}

		<Button type="submit">Save</Button>
	</form>
</div>
