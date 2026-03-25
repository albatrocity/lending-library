<script lang="ts">
	import type { PageServerData } from './$types';
	import ItemListItem from '$lib/components/ItemListItem.svelte';
	import TagsInput from '$lib/components/TagsInput.svelte';
	import CommunityCombobox from '$lib/components/CommunityCombobox.svelte';
	import OwnerCombobox from '$lib/components/OwnerCombobox.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import {
		CheckboxRoot,
		CheckboxControl,
		CheckboxIndicator,
		CheckboxLabel,
		CheckboxHiddenInput
	} from '@ark-ui/svelte/checkbox';

	import Field from '$lib/components/Field.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	let { data }: { data: PageServerData } = $props();

	const initialTags = $derived(data.filters.tagNames.map((name: string) => ({ name })));

	let formEl = $state<HTMLFormElement>();
	let searchDebounceTimer: ReturnType<typeof setTimeout>;

	function submitForm() {
		formEl?.requestSubmit();
	}

	function onSearchInput() {
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(submitForm, 300);
	}
</script>

<form
	method="get"
	action=""
	bind:this={formEl}
	onchange={submitForm}
	data-sveltekit-keepfocus
	data-sveltekit-noscroll
>
	<Fieldset legend="Filters">
		<Field label="Search">
			<TextInput
				name="q"
				value={data.filters.search ?? ''}
				placeholder="Search by title..."
				oninput={onSearchInput}
				onchange={null}
			/>
		</Field>

		<Field label="Community">
			<CommunityCombobox
				communities={data.communities}
				selectedCommunityId={data.filters.communityId}
				onchange={submitForm}
			/>
		</Field>

		<Field label="Tags">
			<TagsInput topTags={data.topTags} {initialTags} creatable={false} onchange={submitForm} />
		</Field>

		<Field label="Owner">
			<OwnerCombobox
				topOwners={data.topOwners}
				selectedOwnerId={data.filters.ownerId}
				onchange={submitForm}
			/>
		</Field>

		<div>
			<CheckboxRoot name="available" value="1" defaultChecked={data.filters.availableToday}>
				<CheckboxControl>
					<CheckboxIndicator>✓</CheckboxIndicator>
				</CheckboxControl>
				<CheckboxLabel>Available today</CheckboxLabel>
				<CheckboxHiddenInput />
			</CheckboxRoot>
		</div>

		<noscript><button type="submit">Apply Filters</button></noscript>
	</Fieldset>
</form>

{#if data.items.length === 0}
	<p>No items found matching your criteria.</p>
{:else}
	<div>
		{#each data.items as item (item.id)}
			<ItemListItem {...item} />
		{/each}
	</div>

	<Pagination page={data.page} count={data.total} pageSize={data.limit} />
{/if}
