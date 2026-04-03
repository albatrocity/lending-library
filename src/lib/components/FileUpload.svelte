<script lang="ts">
	import { onDestroy } from 'svelte';
	import { FileUpload, useFileUpload } from '@ark-ui/svelte/file-upload';
	import { fileUpload } from 'styled-system/recipes';
	import { css } from 'styled-system/css';

	type ImageData = {
		id: number;
		url: string;
	};

	type UnifiedImage =
		| { type: 'saved'; id: number; url: string }
		| { type: 'pending'; file: File; previewUrl: string };

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

	let previewUrls = $state<Map<File, string>>(new Map());

	$effect(() => {
		const currentFiles = acceptedFiles;
		const newMap = new Map<File, string>();

		for (const file of currentFiles) {
			const existingUrl = previewUrls.get(file);
			if (existingUrl) {
				newMap.set(file, existingUrl);
			} else {
				newMap.set(file, URL.createObjectURL(file));
			}
		}

		for (const [file, url] of previewUrls) {
			if (!newMap.has(file)) {
				URL.revokeObjectURL(url);
			}
		}

		previewUrls = newMap;
	});

	onDestroy(() => {
		for (const url of previewUrls.values()) {
			URL.revokeObjectURL(url);
		}
	});

	const unifiedImages = $derived<UnifiedImage[]>([
		...images.map((img): UnifiedImage => ({ type: 'saved', id: img.id, url: img.url })),
		...acceptedFiles.map(
			(file): UnifiedImage => ({
				type: 'pending',
				file,
				previewUrl: previewUrls.get(file) ?? ''
			})
		)
	]);
</script>

<div class={recipe.root}>
	{#if unifiedImages.length > 0}
		<div class={recipe.itemGroup}>
			{#each unifiedImages as image (image.type === 'saved' ? `saved-${image.id}` : `pending-${image.file.name}`)}
				{#if image.type === 'saved'}
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
				{:else}
					<div class={recipe.item} data-pending>
						<div class={recipe.itemPreview}>
							<img src={image.previewUrl} alt={image.file.name} class={recipe.itemPreviewImage} />
						</div>
						<span class={css({ fontSize: 'xs', color: 'fg.muted', fontStyle: 'italic' })}>Pending</span>
						<button
							type="button"
							class={recipe.itemDeleteTrigger}
							onclick={() => fileUploadState().deleteFile(image.file)}
						>
							&times;
						</button>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	<FileUpload.RootProvider value={fileUploadState}>
		<FileUpload.Dropzone class={recipe.dropzone}>
			<span>Drag and drop images here</span>
			<FileUpload.Trigger class={recipe.trigger}>or click to browse</FileUpload.Trigger>
		</FileUpload.Dropzone>

		<FileUpload.HiddenInput />
	</FileUpload.RootProvider>
</div>
