<script lang="ts">
	import { FieldInput } from '@ark-ui/svelte/field';
	import { input } from 'styled-system/recipes';

	let props = $props();

	const [variantProps, htmlProps] = $derived(input.splitVariantProps(props));

	const recipe = $derived(input(variantProps));
</script>

<FieldInput {...htmlProps} class={recipe} />
