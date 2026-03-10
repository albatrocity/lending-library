<script lang="ts">
	import type { PageServerData } from './$types';
	import ItemListItem from '$lib/components/ItemListItem.svelte';
	import TagsCombobox from '$lib/components/TagsCombobox.svelte';
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
	import { FieldInput } from '@ark-ui/svelte/field';
	import Field from '$lib/components/Field.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';

	let { data }: { data: PageServerData } = $props();

	const selectedTag = $derived(
		data.filters.tagId
			? data.topTags.find((t: { id: number; name: string }) => t.id === data.filters.tagId)
			: undefined
	);
</script>

<form method="get" action="">
	<Fieldset legend="Filters">
		<Field label="Search">
			<FieldInput name="q" value={data.filters.search ?? ''} placeholder="Search by title..." />
		</Field>

		<Field label="Community">
			<CommunityCombobox
				communities={data.communities}
				selectedCommunityId={data.filters.communityId}
			/>
		</Field>

		<Field label="Tags">
			<TagsCombobox
				topTags={data.topTags}
				initialTags={selectedTag ? [{ name: selectedTag.name }] : []}
				creatable={false}
			/>
		</Field>

		<Field label="Owner">
			<OwnerCombobox
				topOwners={data.topOwners}
				selectedOwnerId={data.filters.ownerId}
			/>
		</Field>

		<div>
			<CheckboxRoot
				name="available"
				value="1"
				defaultChecked={data.filters.availableToday}
			>
				<CheckboxControl>
					<CheckboxIndicator>✓</CheckboxIndicator>
				</CheckboxControl>
				<CheckboxLabel>Available today</CheckboxLabel>
				<CheckboxHiddenInput />
			</CheckboxRoot>
		</div>

		<button type="submit">Apply Filters</button>
	</Fieldset>
</form>

{#if data.items.length === 0}
	<p>No items found matching your criteria.</p>
{:else}
	<div>
		{#each data.items as item (item.id)}
			<ItemListItem {...item} currentUserId={data.user.id} />
		{/each}
	</div>

	<Pagination page={data.page} count={data.total} pageSize={data.limit} />
{/if}
