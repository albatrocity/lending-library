import { createInsertSchema } from 'drizzle-orm/zod';
import { items } from '$lib/server/db/schema';

export const createItemSchema = createInsertSchema(items);
