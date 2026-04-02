<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Item } from '$lib/schemas/items';
	import TagsInput from './TagsInput.svelte';
	import Button from './Button.svelte';
	import Field from './Field.svelte';
	import TextInput from './TextInput.svelte';
	import TextArea from './TextArea.svelte';
	import TagsCombobox from './TagsCombobox.svelte';
	import FileUpload from './FileUpload.svelte';
	import { useListCollection } from '@ark-ui/svelte';
	import { stack } from 'styled-system/patterns';

	type Tag = { id: number; name: string };
	type Community = { id: number; name: string };
	type ImageData = { id: number; url: string };
	type Prefilled = { name: string; description: string; tags: string[] };

	let {
		action,
		form,
		item,
		topTags,
		itemCommunities,
		allCommunities,
		prefilled,
		pendingImage
	}: {
		action: string;
		form?: { errors?: string | string[] } | null;
		item?: Item & { tags?: Tag[]; images?: ImageData[] };
		topTags: Tag[];
		itemCommunities: Community[];
		allCommunities: Community[];
		prefilled?: Prefilled | null;
		pendingImage?: File | null;
	} = $props();

	let imagesToRemove = $state<number[]>([]);
	const currentImages = $derived(
		(item?.images ?? []).filter((img) => !imagesToRemove.includes(img.id))
	);

	const prefilledTags = $derived(
		prefilled?.tags?.map((name, index) => ({ id: -index - 1, name })) ?? []
	);

	const communityList = useListCollection(() => ({
		initialItems: allCommunities,
		itemToValue: (c) => String(c.id),
		itemToString: (c) => c.name,
		filter: (itemString, filterText) => itemString.toLowerCase().includes(filterText.toLowerCase())
	}));

	function handleImageRemove(imageId: number) {
		imagesToRemove = [...imagesToRemove, imageId];
	}
</script>

<div>
	<form
		method="post"
		{action}
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			// Add pending image from AI flow if present
			if (pendingImage) {
				formData.append('pendingImage', pendingImage);
			}
		}}
	>
		<div class={stack({ gap: 4 })}>
			<Field label="Name">
				<TextInput name="name" placeholder="Name" value={item?.name ?? prefilled?.name} />
			</Field>
			<Field label="Description">
				<TextArea
					autoresize
					name="description"
					placeholder="Description"
					value={item?.description ?? prefilled?.description}
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
					placeholder="Add communities"
					emptyMessage="No communities found"
					oninputvaluechange={(d) => {
						if (d.reason === 'input-change') communityList.filter(d.inputValue);
					}}
				/>
			</Field>
			<Field label="Tags">
				<TagsInput {topTags} initialTags={item?.tags ?? prefilledTags} />
			</Field>
			<Field label="Images">
				<FileUpload
					images={currentImages}
					onImageRemove={handleImageRemove}
				/>
			</Field>

			<input type="hidden" name="imagesToRemove" value={JSON.stringify(imagesToRemove)} />

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
