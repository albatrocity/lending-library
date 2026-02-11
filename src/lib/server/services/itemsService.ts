import { db } from '$lib/server/db';
import { items } from '$lib/server/db/schema';
import { createItemSchema } from '$lib/schemas/items';
import type { z } from 'zod';

export const getAllItems = async () => {
	return await db.select().from(items);
};

export const createItem = async (payload: z.infer<typeof createItemSchema>) => {
	const params = createItemSchema.parse(payload);

	return await db.insert(items).values(params);
};
