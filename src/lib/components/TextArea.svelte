<script lang="ts">
	import { FieldTextarea } from '@ark-ui/svelte/field';
	import { textarea } from 'styled-system/recipes';

	let props = $props();

	const [variantProps, htmlProps] = $derived(textarea.splitVariantProps(props));

	const recipe = $derived(textarea(variantProps));
</script>

<FieldTextarea {...htmlProps} class={recipe} />
