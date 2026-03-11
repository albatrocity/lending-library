<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';

	let { data, form } = $props();
</script>

<div>
	<a href="/communities/{data.community.id}">Back to {data.community.name}</a>

	<h1>Create New Item in {data.community.name}</h1>

	<form method="post" use:enhance>
		<div>
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required />
		</div>

		<div>
			<label for="description">Description</label>
			<textarea id="description" name="description" required></textarea>
		</div>

		<Button type="submit">Create Item</Button>
	</form>

	{#if form?.error}
		<p>{form.error}</p>
	{/if}
</div>
