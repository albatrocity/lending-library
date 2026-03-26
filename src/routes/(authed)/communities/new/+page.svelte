<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import PageContent from '$lib/components/PageContent.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import TextArea from '$lib/components/TextArea.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	let { form } = $props();
</script>

<PageContent>
	<PageHeader title="Create New Community" />

	<form method="post" use:enhance>
		<Fieldset legend="Community Details">
			<Field label="Name">
				<TextInput name="name" placeholder="Name" required />
			</Field>

			<Field label="Description">
				<TextArea name="description" placeholder="Description" />
			</Field>

			<Button type="submit">Create Community</Button>
		</Fieldset>
	</form>

	{#if form?.error}
		<p>{form.error}</p>
	{/if}
</PageContent>
