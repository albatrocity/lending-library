import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('$lib/server/services/tagsService', () => ({
	searchTags: vi.fn()
}));

import { searchTags } from '$lib/server/services/tagsService';
import { GET } from './+server';

const mockSearchTags = vi.mocked(searchTags);

describe('GET /tags', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns tags from searchTags as JSON', async () => {
		const fakeTags = [
			{ id: 1, name: 'svelte', usageCount: 5 },
			{ id: 2, name: 'typescript', usageCount: 3 }
		];
		mockSearchTags.mockResolvedValue(fakeTags);

		const response = await GET({
			url: new URL('http://localhost/tags?q=sv')
		} as Parameters<typeof GET>[0]);

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toEqual(fakeTags);
	});

	it('passes the q param to searchTags', async () => {
		mockSearchTags.mockResolvedValue([]);

		await GET({
			url: new URL('http://localhost/tags?q=rust')
		} as Parameters<typeof GET>[0]);

		expect(mockSearchTags).toHaveBeenCalledWith('rust');
	});

	it('passes an empty string when q is absent', async () => {
		mockSearchTags.mockResolvedValue([]);

		await GET({
			url: new URL('http://localhost/tags')
		} as Parameters<typeof GET>[0]);

		expect(mockSearchTags).toHaveBeenCalledWith('');
	});

	it('returns an empty array when no tags match', async () => {
		mockSearchTags.mockResolvedValue([]);

		const response = await GET({
			url: new URL('http://localhost/tags?q=zzznomatch')
		} as Parameters<typeof GET>[0]);

		const body = await response.json();
		expect(body).toEqual([]);
	});
});
