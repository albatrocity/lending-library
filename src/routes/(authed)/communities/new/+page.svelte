<script lang="ts">
	import { enhance } from '$app/forms';

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

		<button type="submit">Create Community</button>
	</form>

	{#if form?.error}
		<p>{form.error}</p>
	{/if}
</div>

