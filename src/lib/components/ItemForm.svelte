<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Item } from '$lib/schemas/items';

	let { action, item }: { action: string; item?: Item } = $props();
</script>

<div>
	<form method="post" {action} use:enhance>
		<input type="text" name="name" placeholder="Name" value={item?.name} />
		<input type="text" name="description" placeholder="Description" value={item?.description} />
		<button type="submit">Save</button>
	</form>

	<!-- {#if form?.errors}
		{#each form.errors as error}
			<div>
				<p>{error}</p>
			</div>
		{/each}
	{/if} -->
</div>
