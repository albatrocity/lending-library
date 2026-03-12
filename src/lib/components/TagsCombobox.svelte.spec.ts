import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import TagsCombobox from './TagsCombobox.svelte';

type Tag = { id: number; name: string };

const itemToValue = (t: Tag) => t.name;
const itemToString = (t: Tag) => t.name;

const defaultItems: Tag[] = [
	{ id: 1, name: 'svelte' },
	{ id: 2, name: 'typescript' },
	{ id: 3, name: 'drizzle' }
];

const baseProps = {
	defaultItems,
	itemToValue,
	itemToString,
	name: 'tags'
};

describe('TagsCombobox', () => {
	it('renders the tags input field', async () => {
		render(TagsCombobox, { props: baseProps });
		const input = page.getByPlaceholder('Add tags...');
		await expect.element(input).toBeInTheDocument();
	});

	it('renders with no tag pills when defaultValue is omitted', async () => {
		const { container } = render(TagsCombobox, { props: baseProps });
		const pills = container.querySelectorAll('[data-part="item-preview"]');
		expect(pills.length).toBe(0);
	});

	it('renders tag pills for each item in defaultValue', async () => {
		render(TagsCombobox, { props: { ...baseProps, defaultValue: ['svelte', 'typescript'] } });

		await expect.element(page.getByText('svelte')).toBeInTheDocument();
		await expect.element(page.getByText('typescript')).toBeInTheDocument();
	});

	it('renders a hidden input for each value in defaultValue', async () => {
		const { container } = render(TagsCombobox, {
			props: { ...baseProps, defaultValue: ['svelte', 'typescript'] }
		});

		const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="tags"]');
		expect(hiddenInputs.length).toBe(2);

		const values = Array.from(hiddenInputs).map((el) => (el as HTMLInputElement).value);
		expect(values).toContain('svelte');
		expect(values).toContain('typescript');
	});

	it('renders no hidden inputs when defaultValue is empty', async () => {
		const { container } = render(TagsCombobox, { props: { ...baseProps, defaultValue: [] } });
		const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="tags"]');
		expect(hiddenInputs.length).toBe(0);
	});

	it('renders no hidden inputs when name prop is omitted', async () => {
		const { itemToValue: _v, itemToString: _s, name: _n, ...propsWithoutName } = baseProps;
		const { container } = render(TagsCombobox, {
			props: { ...propsWithoutName, itemToValue, itemToString, defaultValue: ['svelte'] }
		});
		const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
		expect(hiddenInputs.length).toBe(0);
	});

	it('renders a delete trigger for each item in defaultValue', async () => {
		const { container } = render(TagsCombobox, {
			props: { ...baseProps, defaultValue: ['svelte'] }
		});
		const deleteTriggers = container.querySelectorAll('[data-part="item-delete-trigger"]');
		expect(deleteTriggers.length).toBe(1);
	});
});
