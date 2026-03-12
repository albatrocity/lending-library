<script lang="ts">
	import Button from './Button.svelte';

	type Image = {
		id: number;
		url: string;
	};

	let {
		itemId,
		images = [],
		onImagesChange
	}: {
		itemId?: number;
		images?: Image[];
		onImagesChange?: (images: Image[]) => void;
	} = $props();

	let currentImages = $state<Image[]>([]);
	let pendingFiles = $state<File[]>([]);
	let uploading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		currentImages = [...images];
	});

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;

		const files = Array.from(input.files);
		const validFiles = files.filter((file) => {
			if (!file.type.startsWith('image/')) {
				error = 'Only image files are allowed';
				return false;
			}
			if (file.size > 10 * 1024 * 1024) {
				error = 'Files must be less than 10MB';
				return false;
			}
			return true;
		});

		pendingFiles = [...pendingFiles, ...validFiles];
		error = null;
		input.value = '';
	}

	function removePendingFile(index: number) {
		pendingFiles = pendingFiles.filter((_, i) => i !== index);
	}

	async function uploadPendingFiles() {
		if (!itemId || pendingFiles.length === 0) return;

		uploading = true;
		error = null;

		try {
			const uploaded: Image[] = [];
			for (const file of pendingFiles) {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('itemId', String(itemId));

				const response = await fetch('/api/images', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.message || 'Upload failed');
				}

				const image = await response.json();
				uploaded.push(image);
			}

			currentImages = [...currentImages, ...uploaded];
			pendingFiles = [];
			onImagesChange?.(currentImages);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Upload failed';
		} finally {
			uploading = false;
		}
	}

	async function deleteImage(imageId: number) {
		try {
			const response = await fetch(`/api/images?id=${imageId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Delete failed');
			}

			currentImages = currentImages.filter((img) => img.id !== imageId);
			onImagesChange?.(currentImages);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Delete failed';
		}
	}

	function getPreviewUrl(file: File): string {
		return URL.createObjectURL(file);
	}
</script>

<div>
	{#if error}
		<div>{error}</div>
	{/if}

	<div>
		{#each currentImages as image (image.id)}
			<div>
				<img src={image.url} alt="Uploaded item" />
				<button type="button" onclick={() => deleteImage(image.id)}>
					&times;
				</button>
			</div>
		{/each}

		{#each pendingFiles as file, index (index)}
			<div>
				<img src={getPreviewUrl(file)} alt="Pending upload preview" />
				<button type="button" onclick={() => removePendingFile(index)}>
					&times;
				</button>
			</div>
		{/each}
	</div>

	<div>
		<label>
			<input
				type="file"
				accept="image/jpeg,image/png,image/gif,image/webp"
				multiple
				onchange={handleFileSelect}
				disabled={uploading}
			/>
			<span>Select Images</span>
		</label>

		{#if itemId && pendingFiles.length > 0}
			<Button type="button" onclick={uploadPendingFiles} disabled={uploading}>
				{uploading ? 'Uploading...' : `Upload ${pendingFiles.length} image${pendingFiles.length > 1 ? 's' : ''}`}
			</Button>
		{/if}
	</div>

	{#if !itemId && pendingFiles.length > 0}
		<p>Images will be uploaded after saving the item.</p>
	{/if}
</div>
