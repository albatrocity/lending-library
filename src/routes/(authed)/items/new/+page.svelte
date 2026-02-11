<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div>
	<h1>New Item</h1>
	<form method="post" action="?/createItem" use:enhance>
		<input type="text" name="name" placeholder="Name" />
		<input type="text" name="description" placeholder="Description" />
		<button type="submit">Create</button>
	</form>

	{#if form?.errors}
		{#each form.errors as error}
			<div>
				<p>{error}</p>
			</div>
		{/each}
	{/if}
</div>
