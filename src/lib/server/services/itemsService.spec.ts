import { vi, describe, it, expect, beforeEach } from 'vitest';

const makeSelectChain = (resolveValue: unknown = []) => {
	const chain: Record<string, unknown> = {
		from: vi.fn(() => chain),
		where: vi.fn(() => chain),
		innerJoin: vi.fn(() => chain),
		then: (resolve: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(resolve),
		catch: (reject: (e: unknown) => unknown) => Promise.resolve(resolveValue).catch(reject),
		finally: (fn: () => void) => Promise.resolve(resolveValue).finally(fn)
	};
	return chain;
};

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(),
		query: {
			items: {
				findMany: vi.fn(),
				findFirst: vi.fn()
			}
		}
	}
}));

vi.mock('$lib/server/db/schema', () => ({
	communityItems: { communityId: 'communityItems.communityId', itemId: 'communityItems.itemId' },
	communities: { id: 'communities.id', name: 'communities.name' },
	communityMemberships: {
		communityId: 'communityMemberships.communityId',
		userId: 'communityMemberships.userId'
	},
	items: { id: 'items.id', name: 'items.name', ownerId: 'items.ownerId' },
	tagsToItems: { itemId: 'tagsToItems.itemId', tagId: 'tagsToItems.tagId' },
	borrows: { id: 'borrows.id', itemId: 'borrows.itemId', status: 'borrows.status' }
}));

vi.mock('$lib/schemas/items', () => ({
	createItemSchema: { parse: vi.fn() },
	createItemWithCommunitiesSchema: { parse: vi.fn() },
	updateItemSchema: { parse: vi.fn() }
}));

vi.mock('drizzle-orm', () => ({
	and: vi.fn((...args: unknown[]) => args.filter(Boolean)),
	eq: vi.fn((a: unknown, b: unknown) => ({ type: 'eq', left: a, right: b })),
	inArray: vi.fn((a: unknown, b: unknown) => ({ type: 'inArray', left: a, right: b })),
	ilike: vi.fn((a: unknown, b: unknown) => ({ type: 'ilike', left: a, right: b })),
	notExists: vi.fn((a: unknown) => ({ type: 'notExists', query: a })),
	count: vi.fn(),
	asc: vi.fn()
}));

import { db } from '$lib/server/db';
import { getItemsForUserCommunities } from '$lib/server/services/itemsService';
import { eq, ilike, notExists } from 'drizzle-orm';

const mockDb = db as {
	select: ReturnType<typeof vi.fn>;
	query: { items: { findMany: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn> } };
};

const now = new Date('2025-01-01');

function makeRelationalItem(overrides: Record<string, unknown> = {}) {
	return {
		id: 1,
		name: 'Widget',
		description: 'A fine widget',
		ownerId: 'owner-1',
		createdAt: now,
		updatedAt: now,
		tagsToItems: [{ tag: { id: 10, name: 'electronics', createdAt: now, updatedAt: now } }],
		lender: { id: 'owner-1', name: 'Alice', email: 'alice@example.com' },
		...overrides
	};
}

describe('getItemsForUserCommunities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockDb.select.mockImplementation(() => makeSelectChain([{ total: 1 }]));
		mockDb.query.items.findMany.mockResolvedValue([makeRelationalItem()]);
	});

	describe('result mapping', () => {
		it('flattens tagsToItems into a tags array', async () => {
			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.items[0].tags).toEqual([
				expect.objectContaining({ id: 10, name: 'electronics' })
			]);
			expect(result.items[0]).not.toHaveProperty('tagsToItems');
		});

		it('extracts ownerName and ownerEmail from lender relation', async () => {
			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.items[0].ownerName).toBe('Alice');
			expect(result.items[0].ownerEmail).toBe('alice@example.com');
			expect(result.items[0]).not.toHaveProperty('lender');
		});

		it('preserves core item fields', async () => {
			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.items[0]).toMatchObject({
				id: 1,
				name: 'Widget',
				description: 'A fine widget',
				ownerId: 'owner-1'
			});
		});

		it('handles items with multiple tags', async () => {
			mockDb.query.items.findMany.mockResolvedValue([
				makeRelationalItem({
					tagsToItems: [
						{ tag: { id: 10, name: 'alpha', createdAt: now, updatedAt: now } },
						{ tag: { id: 11, name: 'beta', createdAt: now, updatedAt: now } }
					]
				})
			]);

			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.items[0].tags).toHaveLength(2);
			expect(result.items[0].tags.map((t: { name: string }) => t.name)).toEqual([
				'alpha',
				'beta'
			]);
		});

		it('handles items with no tags', async () => {
			mockDb.query.items.findMany.mockResolvedValue([
				makeRelationalItem({ tagsToItems: [] })
			]);

			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.items[0].tags).toEqual([]);
		});
	});

	describe('pagination', () => {
		it('defaults to page 1 and limit 20', async () => {
			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.page).toBe(1);
			expect(result.limit).toBe(20);
			expect(mockDb.query.items.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ limit: 20, offset: 0 })
			);
		});

		it('calculates offset from page and limit', async () => {
			await getItemsForUserCommunities({ userId: 'u1', page: 3, limit: 10 });

			expect(mockDb.query.items.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ limit: 10, offset: 20 })
			);
		});

		it('returns total from the count query', async () => {
			mockDb.select.mockImplementation(() => makeSelectChain([{ total: 42 }]));

			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.total).toBe(42);
		});

		it('returns 0 total when count result is empty', async () => {
			mockDb.select.mockImplementation(() => makeSelectChain([]));

			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.total).toBe(0);
		});
	});

	describe('filters', () => {
		it('applies owner filter when ownerId is provided', async () => {
			await getItemsForUserCommunities({ userId: 'u1', ownerId: 'owner-5' });

			expect(eq).toHaveBeenCalledWith('items.ownerId', 'owner-5');
		});

		it('does not apply owner filter when ownerId is omitted', async () => {
			await getItemsForUserCommunities({ userId: 'u1' });

			expect(eq).not.toHaveBeenCalledWith('items.ownerId', expect.anything());
		});

		it('applies search filter with ilike when search term is provided', async () => {
			await getItemsForUserCommunities({ userId: 'u1', search: 'widget' });

			expect(ilike).toHaveBeenCalledWith('items.name', '%widget%');
		});

		it('trims search term before applying', async () => {
			await getItemsForUserCommunities({ userId: 'u1', search: '  gadget  ' });

			expect(ilike).toHaveBeenCalledWith('items.name', '%gadget%');
		});

		it('does not apply search filter when search is whitespace-only', async () => {
			await getItemsForUserCommunities({ userId: 'u1', search: '   ' });

			expect(ilike).not.toHaveBeenCalled();
		});

		it('does not apply search filter when search is omitted', async () => {
			await getItemsForUserCommunities({ userId: 'u1' });

			expect(ilike).not.toHaveBeenCalled();
		});

		it('applies tag filter when tagId is provided', async () => {
			await getItemsForUserCommunities({ userId: 'u1', tagId: 7 });

			expect(eq).toHaveBeenCalledWith('tagsToItems.tagId', 7);
		});

		it('does not apply tag filter when tagId is omitted', async () => {
			await getItemsForUserCommunities({ userId: 'u1' });

			expect(eq).not.toHaveBeenCalledWith('tagsToItems.tagId', expect.anything());
		});

		it('applies community filter when communityId is provided', async () => {
			await getItemsForUserCommunities({ userId: 'u1', communityId: 3 });

			expect(eq).toHaveBeenCalledWith('communityItems.communityId', 3);
		});

		it('applies availableToday filter with notExists when true', async () => {
			await getItemsForUserCommunities({ userId: 'u1', availableToday: true });

			expect(notExists).toHaveBeenCalled();
			expect(eq).toHaveBeenCalledWith('borrows.status', 'active');
		});

		it('does not apply availableToday filter when false', async () => {
			await getItemsForUserCommunities({ userId: 'u1', availableToday: false });

			expect(notExists).not.toHaveBeenCalled();
		});

		it('does not apply availableToday filter when omitted', async () => {
			await getItemsForUserCommunities({ userId: 'u1' });

			expect(notExists).not.toHaveBeenCalled();
		});
	});

	describe('empty results', () => {
		it('returns empty items array when findMany returns nothing', async () => {
			mockDb.select.mockImplementation(() => makeSelectChain([{ total: 0 }]));
			mockDb.query.items.findMany.mockResolvedValue([]);

			const result = await getItemsForUserCommunities({ userId: 'u1' });

			expect(result.items).toEqual([]);
			expect(result.total).toBe(0);
		});
	});
});
