<script lang="ts">
	import {
		FieldsetRoot,
		FieldsetLegend,
		FieldsetErrorText,
		FieldsetHelperText,
		type FieldsetRootBaseProps
	} from '@ark-ui/svelte/fieldset';
	import { sva } from 'styled-system/css';
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

	const recipe = sva({
		slots: ['root', 'legend', 'helperText', 'errorText'],
		base: {
			root: {
				display: 'flex',
				flexDirection: 'column',
				gap: '4'
			},
			legend: {
				textStyle: 'md',
				color: 'primary.solid.fg',
				fontWeight: 500,
				marginBottom: '2'
			},
			helperText: {
				color: 'fg.muted',
				textStyle: 'sm'
			},
			errorText: {
				color: 'error',
				textStyle: 'sm'
			}
		}
	});

	const classes = recipe();
</script>

<FieldsetRoot class={classes.root} {invalid} {disabled}>
	<FieldsetLegend class={classes.legend}>{legend}</FieldsetLegend>
	{#if helperText}
		<FieldsetHelperText class={classes.helperText}>{helperText}</FieldsetHelperText>
	{/if}
	{@render children()}
	{#if errorText}
		<FieldsetErrorText class={classes.errorText}>{errorText}</FieldsetErrorText>
	{/if}
</FieldsetRoot>
