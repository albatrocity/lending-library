import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import TagsCombobox from './TagsCombobox.svelte';

// The debounced $effect calls fetch when inputValue is non-empty.
// For render-only tests inputValue stays empty so no fetch is triggered,
// but we stub it globally so any accidental call won't hit a real network.
beforeEach(() => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue([]) }));
});

const topTags = [
	{ id: 1, name: 'svelte' },
	{ id: 2, name: 'typescript' },
	{ id: 3, name: 'drizzle' }
];

describe('TagsCombobox', () => {
	it('renders the tags input field', async () => {
		render(TagsCombobox, { props: { topTags } });
		const input = page.getByPlaceholder('Add tags...');
		await expect.element(input).toBeInTheDocument();
	});

	it('renders with no tag pills when initialTags is omitted', async () => {
		const { container } = render(TagsCombobox, { props: { topTags } });
		const pills = container.querySelectorAll('[data-part="item-preview"]');
		expect(pills.length).toBe(0);
	});

	it('renders tag pills for each item in initialTags', async () => {
		const initialTags = [{ name: 'svelte' }, { name: 'typescript' }];
		render(TagsCombobox, { props: { topTags, initialTags } });

		await expect.element(page.getByText('svelte')).toBeInTheDocument();
		await expect.element(page.getByText('typescript')).toBeInTheDocument();
	});

	it('renders a hidden input for each initial tag', async () => {
		const initialTags = [{ name: 'svelte' }, { name: 'typescript' }];
		const { container } = render(TagsCombobox, { props: { topTags, initialTags } });

		const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="tags"]');
		expect(hiddenInputs.length).toBe(2);

		const values = Array.from(hiddenInputs).map((el) => (el as HTMLInputElement).value);
		expect(values).toContain('svelte');
		expect(values).toContain('typescript');
	});

	it('renders no hidden inputs when initialTags is empty', async () => {
		const { container } = render(TagsCombobox, { props: { topTags, initialTags: [] } });
		const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="tags"]');
		expect(hiddenInputs.length).toBe(0);
	});

	it('renders a delete trigger for each initial tag', async () => {
		const initialTags = [{ name: 'svelte' }];
		const { container } = render(TagsCombobox, { props: { topTags, initialTags } });
		const deleteTriggers = container.querySelectorAll('[data-part="item-delete-trigger"]');
		expect(deleteTriggers.length).toBe(1);
	});
});
