import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { items } from '$lib/server/db/schema';
import { z } from 'zod';

export const createItemSchema = createInsertSchema(items);
export const updateItemSchema = createUpdateSchema(items);
export const createItemWithCommunitiesSchema = createInsertSchema(items).extend({
	communityIds: z.array(z.number()).optional().default([])
});

export type Item = typeof items.$inferSelect;
