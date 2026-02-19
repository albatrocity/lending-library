<script lang="ts">
	import { enhance } from '$app/forms';

	let { form, data } = $props();

	const communities = $derived(data.communities);
</script>

<div>
	<h1>New Item</h1>
	<form method="post" action="?/createItem" use:enhance>
		<input type="text" name="name" placeholder="Name" />
		<input type="text" name="description" placeholder="Description" />

		<select name="communityIds" multiple>
			{#each communities as community}
				<option value={community.id}>{community.name}</option>
			{/each}
		</select>

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
