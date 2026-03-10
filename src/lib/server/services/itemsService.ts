import { db } from '$lib/server/db';
import {
	communityItems,
	communities,
	communityMemberships,
	items,
	tags,
	tagsToItems,
	borrows,
	user
} from '$lib/server/db/schema';
import {
	createItemSchema,
	createItemWithCommunitiesSchema,
	updateItemSchema
} from '$lib/schemas/items';

import type { z } from 'zod';
import { and, eq, inArray, ilike, notExists, count as drizzleCount } from 'drizzle-orm';

export const getAllItems = async () => {
	const results = await db.query.items.findMany({
		with: { tagsToItems: { with: { tag: true } } }
	});
	return results.map(({ tagsToItems, ...rest }) => ({
		...rest,
		tags: tagsToItems.map((t) => t.tag)
	}));
};

export const getAllItemsByOwnerId = async (ownerId: string) => {
	const results = await db.query.items.findMany({
		with: { tagsToItems: { with: { tag: true } } },
		where: (t, { eq }) => eq(t.ownerId, ownerId)
	});
	return results.map(({ tagsToItems, ...rest }) => ({
		...rest,
		tags: tagsToItems.map((t) => t.tag)
	}));
};

export const createItem = async (payload: z.infer<typeof createItemSchema>) => {
	const params = createItemSchema.parse(payload);

	return await db.insert(items).values(params);
};

export const createItemInCommunities = async (
	payload: z.infer<typeof createItemWithCommunitiesSchema>
) => {
	const params = createItemWithCommunitiesSchema.parse(payload);

	const { communityIds, ...itemParams } = params;

	return await db.transaction(async (tx) => {
		const item = (await tx.insert(items).values(itemParams).returning()).at(0);

		if (!item) {
			throw new Error('Failed to create item');
		}

		if (communityIds.length > 0) {
			await tx.insert(communityItems).values(
				communityIds.map((communityId) => ({
					communityId,
					itemId: item.id
				}))
			);
		}

		return item;
	});
};

export const deleteItem = async (id: number) => {
	return await db.delete(items).where(eq(items.id, id));
};

export const getItem = async (id: number) => {
	const result = await db.query.items.findFirst({
		where: (t, { eq }) => eq(t.id, id),
		with: { tagsToItems: { with: { tag: true } } }
	});
	if (!result) return undefined;
	const { tagsToItems, ...rest } = result;
	return { ...rest, tags: tagsToItems.map((t) => t.tag) };
};

export const updateItem = async (id: number, payload: z.infer<typeof updateItemSchema>) => {
	const params = updateItemSchema.parse(payload);

	const updated = (await db.update(items).set(params).where(eq(items.id, id)).returning()).at(0);

	return updated;
};

export const getItemCommunities = async (itemId: number) => {
	return await db
		.select({
			id: communities.id,
			name: communities.name
		})
		.from(communityItems)
		.innerJoin(communities, eq(communityItems.communityId, communities.id))
		.where(eq(communityItems.itemId, itemId));
};

type CommunityItemsParams = {
	userId: string;
	page?: number;
	limit?: number;
	tagId?: number;
	communityId?: number;
	ownerId?: string;
	search?: string;
	availableToday?: boolean;
};

export const getItemsForUserCommunities = async (params: CommunityItemsParams) => {
	const { userId, page = 1, limit = 20, tagId, communityId, ownerId, search, availableToday } = params;

	const userCommunityIds = db
		.select({ id: communityMemberships.communityId })
		.from(communityMemberships)
		.where(eq(communityMemberships.userId, userId));

	const communityItemIds = db
		.select({ id: communityItems.itemId })
		.from(communityItems)
		.where(
			communityId
				? and(
						inArray(communityItems.communityId, userCommunityIds),
						eq(communityItems.communityId, communityId)
					)
				: inArray(communityItems.communityId, userCommunityIds)
		);

	const conditions = [inArray(items.id, communityItemIds)];

	if (ownerId) {
		conditions.push(eq(items.ownerId, ownerId));
	}

	if (search?.trim()) {
		conditions.push(ilike(items.name, `%${search.trim()}%`));
	}

	if (tagId) {
		const itemsWithTag = db
			.select({ id: tagsToItems.itemId })
			.from(tagsToItems)
			.where(eq(tagsToItems.tagId, tagId));
		conditions.push(inArray(items.id, itemsWithTag));
	}

	if (availableToday) {
		conditions.push(
			notExists(
				db
					.select({ id: borrows.id })
					.from(borrows)
					.where(and(eq(borrows.itemId, items.id), eq(borrows.status, 'active')))
			)
		);
	}

	const whereClause = and(...conditions);
	const offset = (page - 1) * limit;

	const [countResult, itemResults] = await Promise.all([
		db
			.select({ total: drizzleCount() })
			.from(items)
			.where(whereClause),
		db
			.select({
				id: items.id,
				name: items.name,
				description: items.description,
				ownerId: items.ownerId,
				ownerName: user.name,
				ownerEmail: user.email,
				createdAt: items.createdAt,
				updatedAt: items.updatedAt
			})
			.from(items)
			.innerJoin(user, eq(items.ownerId, user.id))
			.where(whereClause)
			.orderBy(items.name)
			.limit(limit)
			.offset(offset)
	]);

	const total = countResult[0]?.total ?? 0;

	const itemIds = itemResults.map((i) => i.id);
	const tagRows =
		itemIds.length > 0
			? await db
					.select({
						itemId: tagsToItems.itemId,
						tagId: tags.id,
						tagName: tags.name,
						tagCreatedAt: tags.createdAt,
						tagUpdatedAt: tags.updatedAt
					})
					.from(tagsToItems)
					.innerJoin(tags, eq(tagsToItems.tagId, tags.id))
					.where(inArray(tagsToItems.itemId, itemIds))
			: [];

	const tagsByItem = new Map<number, { id: number; name: string; createdAt: Date; updatedAt: Date }[]>();
	for (const row of tagRows) {
		const arr = tagsByItem.get(row.itemId) ?? [];
		arr.push({ id: row.tagId, name: row.tagName, createdAt: row.tagCreatedAt, updatedAt: row.tagUpdatedAt });
		tagsByItem.set(row.itemId, arr);
	}

	const itemsWithTags = itemResults.map((item) => ({
		...item,
		tags: tagsByItem.get(item.id) ?? []
	}));

	return { items: itemsWithTags, total, page, limit };
};

export const getUserAccessToItem = async (userId: string, itemId: number) => {
	const item = await getItem(itemId);

	if (!item) {
		return false;
	}

	const isOwner = item.ownerId === userId;

	const userCommunityIds = db
		.select({ id: communityMemberships.communityId })
		.from(communityMemberships)
		.where(eq(communityMemberships.userId, userId));

	const records = await db
		.select()
		.from(communityItems)
		.where(
			and(eq(communityItems.itemId, itemId), inArray(communityItems.communityId, userCommunityIds))
		);

	return records.length > 0 || isOwner;
};
