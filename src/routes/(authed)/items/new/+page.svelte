<script lang="ts">
	import { enhance } from '$app/forms';
	import TagsInput from '$lib/components/TagsInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import TextArea from '$lib/components/TextArea.svelte';

	import TagsCombobox from '$lib/components/TagsCombobox.svelte';

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
			<TextArea autoresize name="description" placeholder="Description" />
		</Field>

		<Field label="Communities">
			<TagsCombobox
				defaultItems={communities}
				itemToValue={(c) => String(c.id)}
				itemToString={(c) => c.name}
				id="communities-combobox"
				openOnClick
			/>
		</Field>

		<Field label="Tags">
			<TagsInput {topTags} />
		</Field>

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
