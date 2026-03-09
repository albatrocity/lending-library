import { db } from '$lib/server/db';
import { tags, tagsToItems } from '$lib/server/db/schema';
import { count, desc, asc, eq, ilike } from 'drizzle-orm';

export const searchTags = async (query?: string, limit?: number) => {
	const baseQuery = db
		.select({
			id: tags.id,
			name: tags.name,
			usageCount: count(tagsToItems.tagId)
		})
		.from(tags)
		.leftJoin(tagsToItems, eq(tags.id, tagsToItems.tagId))
		.groupBy(tags.id, tags.name)
		.orderBy(desc(count(tagsToItems.tagId)), asc(tags.name));

	const withFilter = query?.trim()
		? db
				.select({
					id: tags.id,
					name: tags.name,
					usageCount: count(tagsToItems.tagId)
				})
				.from(tags)
				.leftJoin(tagsToItems, eq(tags.id, tagsToItems.tagId))
				.where(ilike(tags.name, `%${query.trim()}%`))
				.groupBy(tags.id, tags.name)
				.orderBy(desc(count(tagsToItems.tagId)), asc(tags.name))
		: baseQuery;

	const results = limit ? await withFilter.limit(limit) : await withFilter;
	return results;
};

export const getOrCreateTag = async (name: string): Promise<number> => {
	const normalised = name.trim().toLowerCase();
	await db.insert(tags).values({ name: normalised }).onConflictDoNothing();
	const tag = await db.query.tags.findFirst({ where: { name: normalised } });
	return tag!.id;
};

export const setItemTags = async (itemId: number, tagNames: string[]): Promise<void> => {
	await db.delete(tagsToItems).where(eq(tagsToItems.itemId, itemId));
	if (tagNames.length === 0) return;
	const tagIds = await Promise.all(tagNames.map(getOrCreateTag));
	await db.insert(tagsToItems).values(tagIds.map((tagId) => ({ tagId, itemId })));
};
