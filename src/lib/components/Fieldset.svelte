<script lang="ts">
	import {
		FieldsetRoot,
		FieldsetLegend,
		FieldsetErrorText,
		FieldsetHelperText,
		type FieldsetRootBaseProps
	} from '@ark-ui/svelte/fieldset';
	import { stack } from 'styled-system/patterns';
	import type { Snippet } from 'svelte';

	let {
		legend,
		children,
		helperText,
		errorText,
		invalid = false,
		disabled = false
	}: FieldsetRootBaseProps & {
		legend: string;
		children: Snippet;
		helperText?: string;
		errorText?: string;
	} = $props();
</script>

<FieldsetRoot class={stack({ gap: '4' })} {invalid} {disabled}>
	<FieldsetLegend>{legend}</FieldsetLegend>
	{#if helperText}
		<FieldsetHelperText>{helperText}</FieldsetHelperText>
	{/if}
	{@render children()}
	{#if errorText}
		<FieldsetErrorText>{errorText}</FieldsetErrorText>
	{/if}
</FieldsetRoot>
