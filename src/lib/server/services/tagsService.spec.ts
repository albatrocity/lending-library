import { vi, describe, it, expect, beforeEach } from 'vitest';

// Build a reusable thenable chain helper so `await values(...)` and
// `await values(...).onConflictDoNothing()` both work.
const makeInsertValuesResult = () => ({
	onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
	then: (resolve: (v: undefined) => unknown) => Promise.resolve(undefined).then(resolve),
	catch: (reject: (e: unknown) => unknown) => Promise.resolve(undefined).catch(reject),
	finally: (fn: () => void) => Promise.resolve(undefined).finally(fn)
});

vi.mock('$lib/server/db', () => ({
	db: {
		insert: vi.fn(),
		delete: vi.fn(),
		query: {
			tags: {
				findFirst: vi.fn()
			}
		}
	}
}));

// Drizzle schema objects are passed as arguments to query builder calls;
// the mock db ignores them, so empty objects suffice here.
vi.mock('$lib/server/db/schema', () => ({
	tags: {},
	tagsToItems: {}
}));

vi.mock('drizzle-orm', () => ({
	count: vi.fn(),
	desc: vi.fn(),
	asc: vi.fn(),
	eq: vi.fn(),
	ilike: vi.fn()
}));

import { db } from '$lib/server/db';
import { getOrCreateTag, setItemTags } from '$lib/server/services/tagsService';

const mockDb = db as {
	insert: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
	query: { tags: { findFirst: ReturnType<typeof vi.fn> } };
};

describe('getOrCreateTag', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		const valuesResult = makeInsertValuesResult();
		mockDb.insert.mockReturnValue({ values: vi.fn().mockReturnValue(valuesResult) });
		mockDb.query.tags.findFirst.mockResolvedValue({ id: 1, name: 'test' });
	});

	it('normalises the tag name to lowercase before inserting', async () => {
		await getOrCreateTag('Svelte');
		const insertCall = mockDb.insert.mock.calls[0];
		expect(insertCall).toBeDefined();
		const valuesArg = mockDb.insert.mock.results[0].value.values.mock.calls[0][0];
		expect(valuesArg.name).toBe('svelte');
	});

	it('trims whitespace before normalising', async () => {
		await getOrCreateTag('  TypeScript  ');
		const valuesArg = mockDb.insert.mock.results[0].value.values.mock.calls[0][0];
		expect(valuesArg.name).toBe('typescript');
	});

	it('returns the tag id from the database', async () => {
		mockDb.query.tags.findFirst.mockResolvedValue({ id: 42, name: 'svelte' });
		const id = await getOrCreateTag('svelte');
		expect(id).toBe(42);
	});

	it('queries for the normalised name after insert', async () => {
		mockDb.query.tags.findFirst.mockResolvedValue({ id: 7, name: 'rust' });
		await getOrCreateTag('RUST');
		const findArgs = mockDb.query.tags.findFirst.mock.calls[0][0];
		expect(findArgs.where.name).toBe('rust');
	});
});

describe('setItemTags', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// delete chain
		mockDb.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

		// insert chain — values() must be thenable for the direct `await insert().values()` call
		const valuesResult = makeInsertValuesResult();
		mockDb.insert.mockReturnValue({ values: vi.fn().mockReturnValue(valuesResult) });

		// getOrCreateTag sub-call: findFirst returns a tag
		mockDb.query.tags.findFirst.mockResolvedValue({ id: 1, name: 'svelte' });
	});

	it('deletes existing tags for the item before setting new ones', async () => {
		await setItemTags(10, ['svelte']);
		expect(mockDb.delete).toHaveBeenCalledOnce();
		const whereCall = mockDb.delete.mock.results[0].value.where;
		expect(whereCall).toHaveBeenCalledOnce();
	});

	it('does not insert when tagNames is empty', async () => {
		await setItemTags(10, []);
		// delete still runs to clear previous tags
		expect(mockDb.delete).toHaveBeenCalledOnce();
		// but insert must not be called
		expect(mockDb.insert).not.toHaveBeenCalled();
	});

	it('inserts one row per tag', async () => {
		mockDb.query.tags.findFirst
			.mockResolvedValueOnce({ id: 1, name: 'svelte' })
			.mockResolvedValueOnce({ id: 2, name: 'typescript' });

		await setItemTags(5, ['svelte', 'typescript']);

		// Each getOrCreateTag + the final junction insert all share the same
		// values() mock (mockReturnValue returns the same object). The junction
		// insert is the last values() call.
		const allValuesCalls = mockDb.insert.mock.results[0].value.values.mock.calls;
		const junctionValuesArg = allValuesCalls.at(-1)![0];
		expect(junctionValuesArg).toEqual(
			expect.arrayContaining([
				{ tagId: 1, itemId: 5 },
				{ tagId: 2, itemId: 5 }
			])
		);
	});

	it('calls getOrCreateTag for each tag name', async () => {
		mockDb.query.tags.findFirst
			.mockResolvedValueOnce({ id: 10, name: 'foo' })
			.mockResolvedValueOnce({ id: 11, name: 'bar' });

		await setItemTags(1, ['foo', 'bar']);

		// insert was called for each tag (via getOrCreateTag) + once for junction rows
		expect(mockDb.insert).toHaveBeenCalledTimes(3);
	});
});
