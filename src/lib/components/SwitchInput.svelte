<script lang="ts">
	import { Switch } from '@ark-ui/svelte/switch';
	import { switchInput } from 'styled-system/recipes';

	type Props = {
		name: string;
		value: string;
		defaultChecked: boolean;
		label: string;
	};

	let { name, value = $bindable(''), defaultChecked, label }: Props = $props();

	const recipe = switchInput();
</script>

<Switch.Root class={recipe.root}>
	<Switch.Control class={recipe.control}>
		<Switch.Thumb class={recipe.thumb} />
	</Switch.Control>
	<Switch.Label class={recipe.label}>{label}</Switch.Label>
	<Switch.HiddenInput {name} {value} {defaultChecked} />
</Switch.Root>
