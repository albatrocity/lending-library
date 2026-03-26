<script lang="ts">
	import {
		CheckboxRoot,
		CheckboxControl,
		CheckboxIndicator,
		CheckboxLabel,
		CheckboxHiddenInput
	} from '@ark-ui/svelte/checkbox';

	type Props = {
		name: string;
		value: string;
		defaultChecked: boolean;
		label: string;
	};

	let { name, value = $bindable(''), defaultChecked, label }: Props = $props();
</script>

<CheckboxRoot {name} {value} {defaultChecked}>
	<CheckboxControl>
		<CheckboxIndicator>✓</CheckboxIndicator>
	</CheckboxControl>
	<CheckboxLabel>{label}</CheckboxLabel>
	<CheckboxHiddenInput />
</CheckboxRoot>
