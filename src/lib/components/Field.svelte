<script lang="ts">
	import {
		FieldRoot,
		FieldLabel,
		FieldErrorText,
		FieldHelperText,
		type FieldRootBaseProps,
		fieldAnatomy
	} from '@ark-ui/svelte/field';
	import type { Snippet } from 'svelte';
	import { sva } from 'styled-system/css';

	const recipe = sva({
		slots: fieldAnatomy.keys(),
		base: {
			root: {
				display: 'flex',
				flexDirection: 'column',
				gap: '1.5'
			},
			label: {
				alignItems: 'center',
				color: 'fg.default',
				display: 'flex',
				gap: '0.5',
				textAlign: 'start',
				userSelect: 'none',
				textStyle: 'label',
				_disabled: {
					layerStyle: 'disabled'
				}
			},
			requiredIndicator: {
				color: 'colorPalette.solid'
			},
			helperText: {
				color: 'fg.muted',
				textStyle: 'sm',
				_disabled: {
					layerStyle: 'disabled'
				}
			},
			errorText: {
				color: 'error',
				textStyle: 'sm'
			}
		}
	});

	const field = recipe();

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

<FieldRoot {invalid} {disabled} {required} {readOnly} class={field.root}>
	<FieldLabel class={field.label}>{label}</FieldLabel>
	{@render children()}
	{#if helperText}
		<FieldHelperText class={field.helperText}>{helperText}</FieldHelperText>
	{/if}
	{#if errorText}
		<FieldErrorText class={field.errorText}>{errorText}</FieldErrorText>
	{/if}
</FieldRoot>
