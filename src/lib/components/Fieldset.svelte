<script lang="ts">
	import {
		FieldsetRoot,
		FieldsetLegend,
		FieldsetErrorText,
		FieldsetHelperText
	} from '@ark-ui/svelte/fieldset';
	import type { Snippet } from 'svelte';

	let {
		legend,
		children,
		helperText,
		errorText,
		invalid = false,
		disabled = false
	}: {
		legend: string;
		children: Snippet;
		helperText?: string;
		errorText?: string;
		invalid?: boolean;
		disabled?: boolean;
	} = $props();
</script>

<FieldsetRoot {invalid} {disabled}>
	<FieldsetLegend>{legend}</FieldsetLegend>
	{#if helperText}
		<FieldsetHelperText>{helperText}</FieldsetHelperText>
	{/if}
	{@render children()}
	{#if errorText}
		<FieldsetErrorText>{errorText}</FieldsetErrorText>
	{/if}
</FieldsetRoot>
