import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('$lib/server/services/itemsService', () => ({
	createItemInCommunities: vi.fn()
}));

vi.mock('$lib/server/services/tagsService', () => ({
	searchTags: vi.fn(),
	setItemTags: vi.fn()
}));

vi.mock('$lib/server/services/communitiesService', () => ({
	getUserCommunities: vi.fn()
}));

import { createItemInCommunities } from '$lib/server/services/itemsService';
import { searchTags, setItemTags } from '$lib/server/services/tagsService';
import { getUserCommunities } from '$lib/server/services/communitiesService';
import { actions, load } from './+page.server';

const mockCreateItem = vi.mocked(createItemInCommunities);
const mockSearchTags = vi.mocked(searchTags);
const mockSetItemTags = vi.mocked(setItemTags);
const mockGetUserCommunities = vi.mocked(getUserCommunities);

const mockUser = { id: 'user-1', name: 'Alice' };

function makeEvent(formData: Record<string, string | string[]>, user = mockUser) {
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
		request: { formData: vi.fn().mockResolvedValue(fd) }
	} as unknown as Parameters<(typeof actions)['createItem']>[0];
}

describe('load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUserCommunities.mockResolvedValue([]);
		mockSearchTags.mockResolvedValue([]);
	});

	it('returns topTags from searchTags(undefined, 10)', async () => {
		const fakeTags = [{ id: 1, name: 'svelte', usageCount: 4 }];
		mockSearchTags.mockResolvedValue(fakeTags);

		const result = await load({
			parent: vi.fn().mockResolvedValue({ user: mockUser })
		} as unknown as Parameters<typeof load>[0]);

		expect(mockSearchTags).toHaveBeenCalledWith(undefined, 10);
		expect(result.topTags).toEqual(fakeTags);
	});

	it('returns communities alongside topTags', async () => {
		const fakeCommunities = [{ id: 1, name: 'Makers' }];
		mockGetUserCommunities.mockResolvedValue(fakeCommunities);

		const result = await load({
			parent: vi.fn().mockResolvedValue({ user: mockUser })
		} as unknown as Parameters<typeof load>[0]);

		expect(result.communities).toEqual(fakeCommunities);
	});
});

describe('createItem action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateItem.mockResolvedValue({ id: 99, name: 'Test Item', ownerId: mockUser.id } as any);
		mockSetItemTags.mockResolvedValue(undefined);
	});

	it('returns 401 when user is not authenticated', async () => {
		const event = makeEvent({ name: 'Widget', description: '' }, null as any);
		const result = await actions.createItem(event);
		expect(result).toMatchObject({ status: 401 });
	});

	it('calls setItemTags with tags from FormData after creating the item', async () => {
		const event = makeEvent({
			name: 'Widget',
			description: 'A widget',
			tags: ['svelte', 'typescript']
		});

		try {
			await actions.createItem(event);
		} catch {
			// redirect throws — that's expected
		}

		expect(mockSetItemTags).toHaveBeenCalledWith(99, ['svelte', 'typescript']);
	});

	it('calls setItemTags with an empty array when no tags are submitted', async () => {
		const event = makeEvent({ name: 'Widget', description: 'A widget' });

		try {
			await actions.createItem(event);
		} catch {
			// redirect
		}

		expect(mockSetItemTags).toHaveBeenCalledWith(99, []);
	});

	it('calls setItemTags after the item is created (using its id)', async () => {
		mockCreateItem.mockResolvedValue({ id: 42, name: 'Gadget', ownerId: mockUser.id } as any);
		const event = makeEvent({ name: 'Gadget', description: '', tags: ['fun'] });

		try {
			await actions.createItem(event);
		} catch {
			// redirect
		}

		expect(mockSetItemTags).toHaveBeenCalledWith(42, ['fun']);
	});

	it('does not call setItemTags when item creation fails validation', async () => {
		// Missing required name → schema parse fails
		const event = makeEvent({ description: 'no name field' });
		await actions.createItem(event);
		expect(mockSetItemTags).not.toHaveBeenCalled();
	});
});
