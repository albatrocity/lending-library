<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Item } from '$lib/schemas/items';
	import TagsInput from './TagsInput.svelte';
	import Button from './Button.svelte';
	import Field from './Field.svelte';
	import TextInput from './TextInput.svelte';
	import TextArea from './TextArea.svelte';
	import TagsCombobox from './TagsCombobox.svelte';
	import { useListCollection } from '@ark-ui/svelte';
	import { stack } from 'styled-system/patterns';

	type Tag = { id: number; name: string };
	type Community = { id: number; name: string };

	let {
		action,
		form,
		item,
		topTags,
		itemCommunities,
		allCommunities
	}: {
		action: string;
		form?: { errors?: string | string[] } | null;
		item?: Item & { tags?: Tag[] };
		topTags: Tag[];
		itemCommunities: Community[];
		allCommunities: Community[];
	} = $props();

	const communityList = useListCollection(() => ({
		initialItems: allCommunities,
		itemToValue: (c) => String(c.id),
		itemToString: (c) => c.name,
		filter: (itemString, filterText) => itemString.toLowerCase().includes(filterText.toLowerCase())
	}));
</script>

<div>
	<form method="post" {action} use:enhance>
		<div class={stack({ gap: 4 })}>
			<Field label="Name">
				<TextInput name="name" placeholder="Name" value={item?.name} />
			</Field>
			<Field label="Description">
				<TextArea
					autoresize
					name="description"
					placeholder="Description"
					value={item?.description}
				/>
			</Field>
			<Field label="Communities">
				<TagsCombobox
					collection={communityList.collection()}
					defaultValue={itemCommunities.map((c) => String(c.id))}
					name="communityIds"
					itemToValue={(c) => String(c.id)}
					itemToString={(c) => c.name}
					openOnClick
					closeOnSelect={false}
					placeholder="Add communities"
					oninputvaluechange={(d) => {
						if (d.reason === 'input-change') communityList.filter(d.inputValue);
					}}
				/>
			</Field>
			<Field label="Tags">
				<TagsInput {topTags} initialTags={item?.tags} />
			</Field>
			<Button type="submit">{item ? 'Save' : 'Create'}</Button>
		</div>
	</form>

	{#if form?.errors}
		{#each Array.isArray(form.errors) ? form.errors : [form.errors] as error (error)}
			<div>
				<p>{error}</p>
			</div>
		{/each}
	{/if}
</div>
