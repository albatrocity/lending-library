import { db } from '$lib/server/db';
import { communities, communityMemberships } from '$lib/server/db/schema';

import { eq, inArray } from 'drizzle-orm';

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
