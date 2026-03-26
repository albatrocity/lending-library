<script lang="ts">
	import { tagsInput } from 'styled-system/recipes';

	const {
		label,
		onRemove,
		size = 'sm'
	}: { label: string; onRemove?: () => void; size?: 'sm' | 'md' | 'lg' } = $props();

	const tagsRecipe = $derived(
		tagsInput({
			size
		})
	);
</script>

<span class={tagsRecipe.itemPreview}>
	<span class={tagsRecipe.itemText}>{label}</span>
	{#if onRemove}
		<button type="button" class={tagsRecipe.itemDeleteTrigger} onclick={onRemove}> &times; </button>
	{/if}
</span>
