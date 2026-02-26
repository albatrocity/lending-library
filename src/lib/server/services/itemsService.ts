import { db } from '$lib/server/db';
import { communityItems, communities, items } from '$lib/server/db/schema';
import {
	createItemSchema,
	createItemWithCommunitiesSchema,
	updateItemSchema
} from '$lib/schemas/items';
import type { z } from 'zod';
import { eq } from 'drizzle-orm';

export const getAllItems = async () => {
	return await db.query.items.findMany({
		with: {
			tags: true
		}
	});
};

export const getAllItemsByOwnerId = async (ownerId: string) => {
	return await db.query.items.findMany({
		with: {
			tags: true
		},
		where: {
			ownerId
		}
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
	return await db.query.items.findFirst({
		where: {
			id: id
		},
		with: {
			tags: true
		}
	});
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
