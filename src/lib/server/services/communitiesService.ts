import { db } from '$lib/server/db';
import { communities, communityMemberships, communityItems, items, user } from '$lib/server/db/schema';
import type { CreateCommunity } from '$lib/schemas/communities';

import { eq, inArray, and, notInArray } from 'drizzle-orm';

export const getCommunitiesCreatedByUserId = async (userId: string) => {
	return await db.query.communities.findMany({
		where: {
			ownerId: userId
		}
	});
};

export const getUserCommunities = async (userId: string) => {
	const userCommunityIds = db
		.select({ id: communityMemberships.communityId })
		.from(communityMemberships)
		.where(eq(communityMemberships.userId, userId));

	return await db.select().from(communities).where(inArray(communities.id, userCommunityIds));
};

export const createCommunity = async (data: CreateCommunity & { ownerId: string }) => {
	const [community] = await db.insert(communities).values(data).returning();

	// Auto-add owner as member
	await db.insert(communityMemberships).values({
		communityId: community.id,
		userId: data.ownerId
	});

	return community;
};

export const getCommunityById = async (id: number) => {
	const community = await db.query.communities.findFirst({
		where: { id }
	});

	if (!community) {
		return null;
	}

	// Get members
	const memberships = await db
		.select({
			userId: communityMemberships.userId,
			userName: user.name,
			userEmail: user.email
		})
		.from(communityMemberships)
		.innerJoin(user, eq(communityMemberships.userId, user.id))
		.where(eq(communityMemberships.communityId, id));

	return {
		...community,
		members: memberships
	};
};

export const addMemberToCommunity = async (communityId: number, userId: string) => {
	// Check if already a member using select query
	const existing = await db
		.select()
		.from(communityMemberships)
		.where(
			and(
				eq(communityMemberships.communityId, communityId),
				eq(communityMemberships.userId, userId)
			)
		)
		.limit(1);

	if (existing.length > 0) {
		return { alreadyMember: true };
	}

	await db.insert(communityMemberships).values({
		communityId,
		userId
	});

	return { alreadyMember: false };
};

export const isUserCommunityOwner = async (userId: string, communityId: number) => {
	const community = await db
		.select()
		.from(communities)
		.where(and(eq(communities.id, communityId), eq(communities.ownerId, userId)))
		.limit(1);

	return community.length > 0;
};

export const isUserCommunityMember = async (userId: string, communityId: number) => {
	const membership = await db
		.select()
		.from(communityMemberships)
		.where(
			and(
				eq(communityMemberships.communityId, communityId),
				eq(communityMemberships.userId, userId)
			)
		)
		.limit(1);

	return membership.length > 0;
};

export const addItemToCommunity = async (communityId: number, itemId: number) => {
	// Check if already in community
	const existing = await db
		.select()
		.from(communityItems)
		.where(and(eq(communityItems.communityId, communityId), eq(communityItems.itemId, itemId)))
		.limit(1);

	if (existing.length > 0) {
		return { alreadyInCommunity: true };
	}

	await db.insert(communityItems).values({
		communityId,
		itemId
	});

	return { alreadyInCommunity: false };
};

export const getCommunityItems = async (communityId: number) => {
	return await db
		.select({
			id: items.id,
			name: items.name,
			description: items.description,
			ownerId: items.ownerId,
			ownerName: user.name
		})
		.from(communityItems)
		.innerJoin(items, eq(communityItems.itemId, items.id))
		.innerJoin(user, eq(items.ownerId, user.id))
		.where(eq(communityItems.communityId, communityId));
};

export const getOwnerItemsNotInCommunity = async (ownerId: string, communityId: number) => {
	const itemsInCommunity = db
		.select({ id: communityItems.itemId })
		.from(communityItems)
		.where(eq(communityItems.communityId, communityId));

	return await db
		.select()
		.from(items)
		.where(and(eq(items.ownerId, ownerId), notInArray(items.id, itemsInCommunity)));
};

export const getCommunitiesForItemAssignment = async (userId: string, itemId: number) => {
	// Get communities the item is already in
	const itemCommunityIds = db
		.select({ id: communityItems.communityId })
		.from(communityItems)
		.where(eq(communityItems.itemId, itemId));

	// Return communities user owns that don't have this item
	return await db
		.select()
		.from(communities)
		.where(and(eq(communities.ownerId, userId), notInArray(communities.id, itemCommunityIds)));
};

export const removeItemFromCommunity = async (communityId: number, itemId: number) => {
	await db
		.delete(communityItems)
		.where(and(eq(communityItems.communityId, communityId), eq(communityItems.itemId, itemId)));
};
