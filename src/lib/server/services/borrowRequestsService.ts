import { db } from '$lib/server/db';
import { borrowRequests, borrowRequestStatus, borrows } from '$lib/server/db/schema';
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

export const getBorrowRequestWithRelations = async (id: number) => {
	return await db.query.borrowRequests.findFirst({
		where: {
			id: id
		},
		with: { user: true, item: true }
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

export const getBorrowRequestsForUser = async (
	userId: string,
	status: BorrowRequestStatus = 'pending'
) => {
	const items = await db.query.items.findMany({
		where: { ownerId: userId },
		with: { borrowRequests: { with: { user: true }, where: { status } } }
	});

	return items.filter((item) => item.borrowRequests.length > 0);
};

export const getBorrowRequestsFromUser = async (
	userId: string,
	status: BorrowRequestStatus = 'pending'
) => {
	return await db.query.borrowRequests.findMany({
		where: { userId, status },
		with: { user: true, item: true }
	});
};

export const acceptBorrowRequest = async (id: number) => {
	await db.transaction(async (tx) => {
		const borrowRequest = (
			await tx
				.update(borrowRequests)
				.set({ status: 'accepted' })
				.where(eq(borrowRequests.id, id))
				.returning()
		).at(0);

		const item = await tx.query.items.findFirst({
			where: {
				id: borrowRequest!.itemId
			}
		});

		await tx.insert(borrows).values({
			borrowRequestId: id,
			borrowerId: borrowRequest!.userId,
			lenderId: item!.ownerId,
			itemId: borrowRequest!.itemId,
			startDate: borrowRequest!.startDate,
			...(borrowRequest!.endDate && { endDate: borrowRequest!.endDate }),
			status: 'pending'
		});
	});
};

export const rejectBorrowRequest = async (id: number) => {
	return await db
		.update(borrowRequests)
		.set({ status: 'rejected' })
		.where(eq(borrowRequests.id, id));
};

export const cancelBorrowRequest = async (id: number) => {
	return await db
		.update(borrowRequests)
		.set({ status: 'cancelled' })
		.where(eq(borrowRequests.id, id));
};
