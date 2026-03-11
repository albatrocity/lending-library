import { db } from '$lib/server/db';
import { activities, communityItems, communityMemberships, user } from '$lib/server/db/schema';
import { eq, and, sql, isNotNull } from 'drizzle-orm';
import type {
	ActivityType,
	ActorType,
	ActivitySubjectType,
	ActivityRelatedType
} from '$lib/schemas/activities';

type TxHandle = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface RecordActivityParams {
	actorId: string;
	actorType: ActorType;
	subjectId: number;
	subjectType: ActivitySubjectType;
	activityType: ActivityType;
	communityId: number;
	relatedId?: number;
	relatedType?: ActivityRelatedType;
	message?: string;
	metadata?: unknown;
}

interface RecordItemActivityParams {
	actorId: string;
	actorType: ActorType;
	itemId: number;
	activityType: ActivityType;
	relatedId?: number;
	relatedType?: ActivityRelatedType;
	message?: string;
	metadata?: unknown;
}

export const recordActivity = async (params: RecordActivityParams, tx?: TxHandle) => {
	const executor = tx ?? db;
	return (
		await executor
			.insert(activities)
			.values({
				actorId: params.actorId,
				actorType: params.actorType,
				subjectId: params.subjectId,
				subjectType: params.subjectType,
				activityType: params.activityType,
				communityId: params.communityId,
				relatedId: params.relatedId,
				relatedType: params.relatedType,
				message: params.message,
				metadata: params.metadata
			})
			.returning()
	).at(0);
};

/**
 * Fan-out: inserts one activity row per community the item belongs to.
 * Accepts an optional transaction handle to participate in the caller's transaction.
 */
export const recordItemActivity = async (params: RecordItemActivityParams, tx?: TxHandle) => {
	const executor = tx ?? db;

	const itemCommunities = await executor
		.select({ communityId: communityItems.communityId })
		.from(communityItems)
		.where(eq(communityItems.itemId, params.itemId));

	if (itemCommunities.length === 0) return [];

	const rows = itemCommunities.map((c) => ({
		actorId: params.actorId,
		actorType: params.actorType,
		subjectId: params.itemId,
		subjectType: 'item' as const,
		activityType: params.activityType,
		communityId: c.communityId,
		relatedId: params.relatedId,
		relatedType: params.relatedType,
		message: params.message,
		metadata: params.metadata
	}));

	return await executor.insert(activities).values(rows).returning();
};

/**
 * Returns the activity timeline for an item with actor names conditionally
 * masked based on whether the viewer shares a community with the event.
 *
 * Deduplicates fan-out rows client-side, preferring the row from a community
 * the viewer belongs to (so the actor name is visible).
 */
export const getItemActivity = async (itemId: number, viewerUserId: string) => {
	const viewerMembership = db
		.select({ communityId: communityMemberships.communityId })
		.from(communityMemberships)
		.where(eq(communityMemberships.userId, viewerUserId))
		.as('viewer_membership');

	const rows = await db
		.select({
			id: activities.id,
			actorId: activities.actorId,
			actorType: activities.actorType,
			subjectId: activities.subjectId,
			subjectType: activities.subjectType,
			activityType: activities.activityType,
			communityId: activities.communityId,
			relatedId: activities.relatedId,
			relatedType: activities.relatedType,
			message: activities.message,
			occurredAt: activities.occurredAt,
			metadata: activities.metadata,
			actorName: sql<string>`
				CASE
					WHEN ${viewerMembership.communityId} IS NOT NULL AND ${activities.actorType} = 'user'
					THEN ${user.name}
					ELSE 'Someone'
				END
			`.as('actor_name'),
			isVisible: isNotNull(viewerMembership.communityId)
		})
		.from(activities)
		.leftJoin(user, and(eq(activities.actorId, user.id), eq(activities.actorType, 'user')))
		.leftJoin(viewerMembership, eq(viewerMembership.communityId, activities.communityId))
		.where(and(eq(activities.subjectId, itemId), eq(activities.subjectType, 'item')))
		.orderBy(
			sql`${activities.occurredAt} DESC, ${activities.activityType}, ${activities.actorId}`
		);

	const seen = new Map<string, (typeof rows)[number]>();
	for (const row of rows) {
		const key = `${row.occurredAt?.getTime()}-${row.activityType}-${row.actorId}`;
		const existing = seen.get(key);
		if (!existing || (row.isVisible && !existing.isVisible)) {
			seen.set(key, row);
		}
	}

	return Array.from(seen.values());
};
