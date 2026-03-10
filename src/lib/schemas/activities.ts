import { createInsertSchema } from 'drizzle-zod';
import {
	activities,
	activityType,
	actorType,
	activitySubjectType,
	activityRelatedType
} from '$lib/server/db/schema';

export const createActivitySchema = createInsertSchema(activities);
export type Activity = typeof activities.$inferSelect;
export type ActivityType = (typeof activityType.enumValues)[number];
export type ActorType = (typeof actorType.enumValues)[number];
export type ActivitySubjectType = (typeof activitySubjectType.enumValues)[number];
export type ActivityRelatedType = (typeof activityRelatedType.enumValues)[number];
