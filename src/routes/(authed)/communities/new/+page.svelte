<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';

	let { form } = $props();
</script>

<div>
	<h1>Create New Community</h1>
	<a href="/communities">Back to Communities</a>

	<form method="post" use:enhance>
		<div>
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required />
		</div>

		<div>
			<label for="description">Description</label>
			<textarea id="description" name="description"></textarea>
		</div>

		<Button type="submit">Create Community</Button>
	</form>

	{#if form?.error}
		<p>{form.error}</p>
	{/if}
</div>
