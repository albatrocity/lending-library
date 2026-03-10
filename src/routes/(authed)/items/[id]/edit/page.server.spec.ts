import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('$lib/server/services/itemsService', () => ({
	getItem: vi.fn(),
	updateItem: vi.fn()
}));

vi.mock('$lib/server/services/tagsService', () => ({
	searchTags: vi.fn(),
	setItemTags: vi.fn()
}));

import { getItem, updateItem } from '$lib/server/services/itemsService';
import { searchTags, setItemTags } from '$lib/server/services/tagsService';
import { actions, load } from './+page.server';

const mockGetItem = vi.mocked(getItem);
const mockUpdateItem = vi.mocked(updateItem);
const mockSearchTags = vi.mocked(searchTags);
const mockSetItemTags = vi.mocked(setItemTags);

const mockUser = { id: 'user-1', name: 'Alice' };
const mockItem = { id: 7, name: 'Widget', description: 'A widget', ownerId: mockUser.id };

function makeEvent(
	formData: Record<string, string | string[]>,
	user = mockUser,
	params = { id: '7' }
) {
	const fd = new FormData();
	for (const [key, value] of Object.entries(formData)) {
		if (Array.isArray(value)) {
			for (const v of value) fd.append(key, v);
		} else {
			fd.append(key, value);
		}
	}
	return {
		locals: { user },
		params,
		request: { formData: vi.fn().mockResolvedValue(fd) }
	} as unknown as Parameters<(typeof actions)['default']>[0];
}

describe('load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetItem.mockResolvedValue({ ...mockItem, tags: [] } as any);
		mockSearchTags.mockResolvedValue([]);
	});

	it('returns topTags from searchTags(undefined, 10)', async () => {
		const fakeTags = [{ id: 1, name: 'svelte', usageCount: 4 }];
		mockSearchTags.mockResolvedValue(fakeTags);

		const result = await load({
			params: { id: '7' },
			parent: vi.fn().mockResolvedValue({ user: mockUser })
		} as unknown as Parameters<typeof load>[0]);

		expect(mockSearchTags).toHaveBeenCalledWith(undefined, 10);
		expect(result.topTags).toEqual(fakeTags);
	});

	it('returns 404 when item does not exist', async () => {
		mockGetItem.mockResolvedValue(undefined);

		const fn = () =>
			load({
				params: { id: '999' },
				parent: vi.fn().mockResolvedValue({ user: mockUser })
			} as unknown as Parameters<typeof load>[0]);

		await expect(fn()).rejects.toMatchObject({ status: 404 });
	});

	it('returns 403 when user does not own the item', async () => {
		mockGetItem.mockResolvedValue({ ...mockItem, ownerId: 'other-user', tags: [] } as any);

		const fn = () =>
			load({
				params: { id: '7' },
				parent: vi.fn().mockResolvedValue({ user: mockUser })
			} as unknown as Parameters<typeof load>[0]);

		await expect(fn()).rejects.toMatchObject({ status: 403 });
	});
});

describe('default action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetItem.mockResolvedValue({ ...mockItem, tags: [] } as any);
		mockUpdateItem.mockResolvedValue({ ...mockItem } as any);
		mockSetItemTags.mockResolvedValue(undefined);
	});

	it('returns 401 when user is not authenticated', async () => {
		const event = makeEvent({ name: 'Widget', description: '' }, null as any);
		const result = await actions.default(event);
		expect(result).toMatchObject({ status: 401 });
	});

	it('returns 403 when user does not own the item', async () => {
		mockGetItem.mockResolvedValue({ ...mockItem, ownerId: 'other-user', tags: [] } as any);
		const event = makeEvent({ name: 'Widget', description: '' });
		const result = await actions.default(event);
		expect(result).toMatchObject({ status: 403 });
	});

	it('returns 404 when item does not exist', async () => {
		mockGetItem.mockResolvedValue(undefined);
		const event = makeEvent({ name: 'Widget', description: '' });
		const result = await actions.default(event);
		expect(result).toMatchObject({ status: 404 });
	});

	it('calls setItemTags with tags from FormData after updating the item', async () => {
		const event = makeEvent({
			name: 'Widget',
			description: 'Updated',
			tags: ['svelte', 'typescript']
		});

		try {
			await actions.default(event);
		} catch {
			// redirect
		}

		expect(mockSetItemTags).toHaveBeenCalledWith(mockItem.id, ['svelte', 'typescript']);
	});

	it('calls setItemTags with an empty array when no tags are submitted', async () => {
		const event = makeEvent({ name: 'Widget', description: 'Updated' });

		try {
			await actions.default(event);
		} catch {
			// redirect
		}

		expect(mockSetItemTags).toHaveBeenCalledWith(mockItem.id, []);
	});

	it('does not call setItemTags when updateItem fails', async () => {
		mockUpdateItem.mockResolvedValue(undefined);
		const event = makeEvent({ name: 'Widget', description: '', tags: ['svelte'] });

		await actions.default(event);

		expect(mockSetItemTags).not.toHaveBeenCalled();
	});

	it('calls setItemTags after updateItem succeeds (correct order)', async () => {
		const callOrder: string[] = [];
		mockUpdateItem.mockImplementation(async () => {
			callOrder.push('updateItem');
			return mockItem as any;
		});
		mockSetItemTags.mockImplementation(async () => {
			callOrder.push('setItemTags');
		});

		const event = makeEvent({ name: 'Widget', description: '', tags: ['fun'] });
		try {
			await actions.default(event);
		} catch {
			// redirect
		}

		expect(callOrder).toEqual(['updateItem', 'setItemTags']);
	});
});
