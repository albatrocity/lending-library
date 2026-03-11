<script lang="ts">
	import {
		FieldRoot,
		FieldLabel,
		FieldErrorText,
		FieldHelperText,
		type FieldRootBaseProps
	} from '@ark-ui/svelte/field';
	import type { Snippet } from 'svelte';

	let {
		label,
		children,
		helperText,
		errorText,
		invalid = false,
		disabled = false,
		required = false,
		readOnly = false
	}: FieldRootBaseProps & {
		label: string;
		children: Snippet;
		helperText?: string;
		errorText?: string;
	} = $props();
</script>

<FieldRoot {invalid} {disabled} {required} {readOnly}>
	<FieldLabel>{label}</FieldLabel>
	{@render children()}
	{#if helperText}
		<FieldHelperText>{helperText}</FieldHelperText>
	{/if}
	{#if errorText}
		<FieldErrorText>{errorText}</FieldErrorText>
	{/if}
</FieldRoot>
