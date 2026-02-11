import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { items } from '$lib/server/db/schema';

export const createItemSchema = createInsertSchema(items);
export const updateItemSchema = createUpdateSchema(items);
export type Item = typeof items.$inferSelect;
