<script lang="ts">
	import { badge } from 'styled-system/recipes';

	type BadgeProps = {
		status: 'borrowed' | 'unavailable';
		label: string;
	};

	const { status, label }: BadgeProps = $props();
</script>

<span class={badge({ status })}>{label}</span>
