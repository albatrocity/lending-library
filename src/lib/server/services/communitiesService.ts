import { db } from '$lib/server/db';
import { communities, communityMemberships, user } from '$lib/server/db/schema';
import type { CreateCommunity } from '$lib/schemas/communities';

import { eq, inArray, and } from 'drizzle-orm';

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
