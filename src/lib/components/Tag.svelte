<script lang="ts">
	import { tagsInput } from 'styled-system/recipes';

	const tagsRecipe = tagsInput();

	let { label, onRemove }: { label: string; onRemove?: () => void } = $props();
</script>

<span class={tagsRecipe.itemPreview}>
	<span class={tagsRecipe.itemText}>{label}</span>
	{#if onRemove}
		<button type="button" class={tagsRecipe.itemDeleteTrigger} onclick={onRemove}> &times; </button>
	{/if}
</span>
