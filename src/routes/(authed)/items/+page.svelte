<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<div>
	{#each data.items as item}
		<div>
			<h2>{item.name}</h2>
			<p>{item.description}</p>
		</div>
	{/each}
</div>
