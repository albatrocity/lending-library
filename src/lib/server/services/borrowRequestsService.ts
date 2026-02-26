import { db } from '$lib/server/db';
import { borrowRequests, borrowRequestStatus } from '$lib/server/db/schema';
import {
	createBorrowRequestSchema,
	updateBorrowRequestSchema,
	type BorrowRequestStatus
} from '$lib/schemas/borrowRequests';

import type { z } from 'zod';
import { eq, and } from 'drizzle-orm';

export const getBorrowRequestsByItemId = async (itemId: number) => {
	return await db.query.borrowRequests.findMany({
		where: {
			itemId: itemId
		},
		orderBy: (t, { desc }) => [desc(t.createdAt)]
	});
};

export const getBorrowRequestsCountByItemId = async (
	itemId: number,
	status?: (typeof borrowRequestStatus.enumValues)[number]
) => {
	return await db.$count(
		borrowRequests,
		and(eq(borrowRequests.itemId, itemId), status ? eq(borrowRequests.status, status) : undefined)
	);
};

export const createBorrowRequest = async (payload: z.infer<typeof createBorrowRequestSchema>) => {
	const params = createBorrowRequestSchema.parse({
		...payload,
		status: 'pending'
	});

	return (await db.insert(borrowRequests).values(params).returning()).at(0);
};

export const deleteBorrowRequest = async (id: number) => {
	return await db.delete(borrowRequests).where(eq(borrowRequests.id, id));
};

export const getBorrowRequest = async (id: number) => {
	return await db.query.borrowRequests.findFirst({
		where: {
			id: id
		}
	});
};

export const updateBorrowRequest = async (
	id: number,
	payload: z.infer<typeof updateBorrowRequestSchema>
) => {
	const params = updateBorrowRequestSchema.parse(payload);

	const updated = (
		await db.update(borrowRequests).set(params).where(eq(borrowRequests.id, id)).returning()
	).at(0);

	return updated;
};

export const getUserItemBorrowRequest = async (payload: {
	userId: string;
	itemId: number;
	status: BorrowRequestStatus;
}) => {
	return await db.query.borrowRequests.findFirst({
		where: {
			userId: payload.userId,
			itemId: payload.itemId,
			status: payload.status
		}
	});
};
