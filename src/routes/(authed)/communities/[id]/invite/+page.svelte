<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<div>
	<a href="/communities/{data.community.id}">Back to {data.community.name}</a>

	<h1>Invite Members to {data.community.name}</h1>

	<form method="post" use:enhance>
		<div>
			<label for="email">User Email</label>
			<input type="email" id="email" name="email" required placeholder="Enter email address" />
		</div>

		<button type="submit">Invite</button>
	</form>

	{#if form?.error}
		<p>{form.error}</p>
	{/if}

	{#if form?.success}
		<p>Successfully invited {form.invitedEmail} to the community!</p>
	{/if}
</div>

