<script lang="ts">
	import { FileUpload, useFileUpload } from '@ark-ui/svelte/file-upload';
	import { fileUpload } from 'styled-system/recipes';

	type ImageData = {
		id: number;
		url: string;
	};

	let {
		name = 'images',
		images = [],
		onFilesChange,
		onImageRemove
	}: {
		name?: string;
		images?: ImageData[];
		onFilesChange?: (files: File[]) => void;
		onImageRemove?: (imageId: number) => void;
	} = $props();

	const recipe = fileUpload();

	const fileUploadState = useFileUpload(() => ({
		name,
		accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
		maxFileSize: 10 * 1024 * 1024,
		maxFiles: 10,
		onFileChange: handleFileChange
	}));

	function handleFileChange(details: { acceptedFiles: File[] }) {
		onFilesChange?.(details.acceptedFiles);
	}

	function handleImageRemove(imageId: number) {
		onImageRemove?.(imageId);
	}

	const acceptedFiles = $derived(fileUploadState().acceptedFiles);
</script>

<div class={recipe.root}>
	{#if images.length > 0}
		<div class={recipe.itemGroup}>
			{#each images as image (image.id)}
				<div class={recipe.item}>
					<div class={recipe.itemPreview}>
						<img src={image.url} alt="Uploaded" class={recipe.itemPreviewImage} />
					</div>
					<button
						type="button"
						class={recipe.itemDeleteTrigger}
						onclick={() => handleImageRemove(image.id)}
					>
						&times;
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<FileUpload.RootProvider value={fileUploadState}>
		<FileUpload.Dropzone class={recipe.dropzone}>
			<span>Drag and drop images here</span>
			<FileUpload.Trigger class={recipe.trigger}>or click to browse</FileUpload.Trigger>
		</FileUpload.Dropzone>

		{#if acceptedFiles.length > 0}
			<FileUpload.ItemGroup class={recipe.itemGroup}>
				{#each acceptedFiles as file (file.name)}
					<FileUpload.Item {file} class={recipe.item}>
						<FileUpload.ItemPreview type="image/*" class={recipe.itemPreview}>
							<FileUpload.ItemPreviewImage class={recipe.itemPreviewImage} />
						</FileUpload.ItemPreview>
						<FileUpload.ItemName class={recipe.itemName} />
						<FileUpload.ItemSizeText class={recipe.itemSizeText} />
						<FileUpload.ItemDeleteTrigger class={recipe.itemDeleteTrigger}>
							&times;
						</FileUpload.ItemDeleteTrigger>
					</FileUpload.Item>
				{/each}
			</FileUpload.ItemGroup>

			<FileUpload.ClearTrigger class={recipe.clearTrigger}>Clear all</FileUpload.ClearTrigger>
		{/if}

		<FileUpload.HiddenInput />
	</FileUpload.RootProvider>
</div>
