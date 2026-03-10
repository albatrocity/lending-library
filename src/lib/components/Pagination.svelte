<script lang="ts">
	import {
		PaginationRoot,
		PaginationPrevTrigger,
		PaginationNextTrigger,
		PaginationItem,
		PaginationEllipsis,
		PaginationContext
	} from '@ark-ui/svelte/pagination';
	import { page as pageStore } from '$app/state';

	let {
		page,
		count,
		pageSize
	}: { page: number; count: number; pageSize: number } = $props();

	function getPageUrl(details: { page: number }) {
		const url = new URL(pageStore.url);
		if (details.page === 1) {
			url.searchParams.delete('page');
		} else {
			url.searchParams.set('page', String(details.page));
		}
		return url.pathname + url.search;
	}
</script>

{#if count > pageSize}
	<PaginationRoot {count} {pageSize} {page} type="link" {getPageUrl}>
		<PaginationPrevTrigger>← Previous</PaginationPrevTrigger>

		<PaginationContext>
			{#snippet render(context)}
				{#each context().pages as p, idx}
					{#if p.type === 'page'}
						<PaginationItem type="page" value={p.value}>{p.value}</PaginationItem>
					{:else}
						<PaginationEllipsis index={idx}>…</PaginationEllipsis>
					{/if}
				{/each}
			{/snippet}
		</PaginationContext>

		<PaginationNextTrigger>Next →</PaginationNextTrigger>
	</PaginationRoot>
{/if}
