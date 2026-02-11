import { db } from '$lib/server/db';
import { items } from '$lib/server/db/schema';
import { createItemSchema, updateItemSchema } from '$lib/schemas/items';
import type { z } from 'zod';
import { eq } from 'drizzle-orm';

export const getAllItems = async () => {
	return await db.query.items.findMany({
		with: {
			tags: true
		}
	});
};

export const createItem = async (payload: z.infer<typeof createItemSchema>) => {
	const params = createItemSchema.parse(payload);

	return await db.insert(items).values(params);
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
