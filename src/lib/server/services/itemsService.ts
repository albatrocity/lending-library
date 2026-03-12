import { db } from '$lib/server/db';
import {
	communityItems,
	communities,
	communityMemberships,
	items,
	tags,
	tagsToItems,
	borrows,
	images
} from '$lib/server/db/schema';
import {
	createItemSchema,
	createItemWithCommunitiesSchema,
	updateItemSchema
} from '$lib/schemas/items';

import type { z } from 'zod';
import { and, eq, inArray, ilike, notExists, count as drizzleCount, asc } from 'drizzle-orm';

async function getImagesForItems(itemIds: number[]) {
	if (itemIds.length === 0) return new Map<number, typeof images.$inferSelect[]>();

	const allImages = await db
		.select()
		.from(images)
		.where(and(eq(images.imageableType, 'items'), inArray(images.imageableId, itemIds)));

	const imagesByItemId = new Map<number, typeof images.$inferSelect[]>();
	for (const image of allImages) {
		const existing = imagesByItemId.get(image.imageableId) || [];
		existing.push(image);
		imagesByItemId.set(image.imageableId, existing);
	}
	return imagesByItemId;
}

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

	const itemIds = results.map((item) => item.id);
	const imagesByItemId = await getImagesForItems(itemIds);

	return results.map(({ tagsToItems, ...rest }) => {
		const itemImages = imagesByItemId.get(rest.id) || [];
		return {
			...rest,
			tags: tagsToItems.map((t) => t.tag),
			thumbnailUrl: itemImages[0]?.url || null
		};
	});
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

	const imagesByItemId = await getImagesForItems([id]);
	const { tagsToItems, ...rest } = result;
	return {
		...rest,
		tags: tagsToItems.map((t) => t.tag),
		images: imagesByItemId.get(id) || []
	};
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

function communityItemIdsForUser(userId: string, communityId?: number) {
	const memberCommunityIds = db
		.select({ id: communityMemberships.communityId })
		.from(communityMemberships)
		.where(eq(communityMemberships.userId, userId));

	return db
		.select({ id: communityItems.itemId })
		.from(communityItems)
		.where(
			and(
				inArray(communityItems.communityId, memberCommunityIds),
				communityId ? eq(communityItems.communityId, communityId) : undefined
			)
		);
}

type CommunityItemsParams = {
	userId: string;
	page?: number;
	limit?: number;
	tagNames?: string[];
	communityId?: number;
	ownerId?: string;
	search?: string;
	availableToday?: boolean;
};

export const getItemsForUserCommunities = async (params: CommunityItemsParams) => {
	const { userId, page = 1, limit = 20, tagNames, communityId, ownerId, search, availableToday } = params;
	const offset = (page - 1) * limit;

	const whereClause = and(
		inArray(items.id, communityItemIdsForUser(userId, communityId)),
		ownerId ? eq(items.ownerId, ownerId) : undefined,
		search?.trim() ? ilike(items.name, `%${search.trim()}%`) : undefined,
		tagNames?.length
			? inArray(
					items.id,
					db
						.select({ id: tagsToItems.itemId })
						.from(tagsToItems)
						.innerJoin(tags, eq(tagsToItems.tagId, tags.id))
						.where(inArray(tags.name, tagNames))
				)
			: undefined,
		availableToday
			? notExists(
					db
						.select({ id: borrows.id })
						.from(borrows)
						.where(and(eq(borrows.itemId, items.id), eq(borrows.status, 'active')))
				)
			: undefined
	);

	const [countResult, itemResults] = await Promise.all([
		db.select({ total: drizzleCount() }).from(items).where(whereClause),
		db.query.items.findMany({
			where: whereClause,
			with: {
				tagsToItems: { with: { tag: true } },
				lender: true
			},
			orderBy: [asc(items.name)],
			limit,
			offset
		})
	]);

	const itemIds = itemResults.map((item) => item.id);
	const imagesByItemId = await getImagesForItems(itemIds);

	return {
		items: itemResults.map(({ tagsToItems, lender, ...rest }) => {
			const itemImages = imagesByItemId.get(rest.id) || [];
			return {
				...rest,
				tags: tagsToItems.map((t) => t.tag),
				ownerName: lender.name,
				ownerEmail: lender.email,
				thumbnailUrl: itemImages[0]?.url || null
			};
		}),
		total: countResult[0]?.total ?? 0,
		page,
		limit
	};
};

export const getUserAccessToItem = async (userId: string, itemId: number) => {
	const item = await getItem(itemId);
	if (!item) return false;

	return item.ownerId === userId || (await isItemInUserCommunities(userId, itemId));
};

async function isItemInUserCommunities(userId: string, itemId: number) {
	const result = await db
		.select({ id: items.id })
		.from(items)
		.where(and(eq(items.id, itemId), inArray(items.id, communityItemIdsForUser(userId))));

	return result.length > 0;
}
