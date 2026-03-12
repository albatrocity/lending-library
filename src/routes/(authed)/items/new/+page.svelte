<script lang="ts">
	import { enhance } from '$app/forms';
	import TagsCombobox from '$lib/components/TagsCombobox.svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	let { form, data } = $props();

	const communities = $derived(data.communities);
	const topTags = $derived(data.topTags);
</script>

<div>
	<h1>New Item</h1>
	<form method="post" action="?/createItem" use:enhance>
		<Field label="Name">
			<TextInput name="name" placeholder="Name" />
		</Field>
		<Field label="Description">
			<TextInput name="description" placeholder="Description" />
		</Field>

		<select name="communityIds" multiple>
			{#each communities as community (community.id)}
				<option value={community.id}>{community.name}</option>
			{/each}
		</select>

		<TagsCombobox {topTags} />

		<Button type="submit">Create</Button>
	</form>

	{#if form?.errors}
		{#each form.errors as error (error)}
			<div>
				<p>{error}</p>
			</div>
		{/each}
	{/if}
</div>
