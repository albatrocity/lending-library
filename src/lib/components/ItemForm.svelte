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
		item?: Item & { tags?: Tag[]; images?: ImageData[] };
		topTags: Tag[];
		itemCommunities: Community[];
		allCommunities: Community[];
	} = $props();

	let pendingFiles = $state<File[]>([]);
	let imagesToRemove = $state<number[]>([]);
	const currentImages = $derived(
		(item?.images ?? []).filter((img) => !imagesToRemove.includes(img.id))
	);

	const communityList = useListCollection(() => ({
		initialItems: allCommunities,
		itemToValue: (c) => String(c.id),
		itemToString: (c) => c.name,
		filter: (itemString, filterText) => itemString.toLowerCase().includes(filterText.toLowerCase())
	}));

	function handleFilesChange(files: File[]) {
		pendingFiles = files;
	}

	function handleImageRemove(imageId: number) {
		imagesToRemove = [...imagesToRemove, imageId];
	}

	async function uploadPendingFiles(itemId: number) {
		for (const file of pendingFiles) {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('itemId', String(itemId));

			await fetch('/api/images', {
				method: 'POST',
				body: formData
			});
		}
		pendingFiles = [];
	}

	async function deleteRemovedImages() {
		for (const imageId of imagesToRemove) {
			await fetch(`/api/images?id=${imageId}`, {
				method: 'DELETE'
			});
		}
		imagesToRemove = [];
	}
</script>

<div>
	<form
		method="post"
		{action}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'redirect' || result.type === 'success') {
					if (item?.id) {
						await deleteRemovedImages();
						await uploadPendingFiles(item.id);
					}
				}
				await update();
			};
		}}
	>
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
					placeholder="Add communities"
					emptyMessage="No communities found"
					oninputvaluechange={(d) => {
						if (d.reason === 'input-change') communityList.filter(d.inputValue);
					}}
				/>
			</Field>
			<Field label="Tags">
				<TagsInput {topTags} initialTags={item?.tags} />
			</Field>
			{#if item?.id}
				<Field label="Images">
					<FileUpload
						images={currentImages}
						onFilesChange={handleFilesChange}
						onImageRemove={handleImageRemove}
					/>
				</Field>
			{/if}
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
