import { db } from '$lib/server/db';
import { borrowRequests, borrowRequestStatus, borrows } from '$lib/server/db/schema';
import {
	createBorrowRequestSchema,
	updateBorrowRequestSchema,
	type BorrowRequestStatus
} from '$lib/schemas/borrowRequests';
import { recordItemActivity } from './activityService';

import type { z } from 'zod';
import { eq, and } from 'drizzle-orm';

export const getBorrowRequestsByItemId = async (itemId: number) => {
	return await db.query.borrowRequests.findMany({
		where: (t, { eq }) => eq(t.itemId, itemId),
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

	return await db.transaction(async (tx) => {
		const borrowRequest = (await tx.insert(borrowRequests).values(params).returning()).at(0);

		await recordItemActivity(
			{
				actorId: params.userId,
				actorType: 'user',
				itemId: params.itemId,
				activityType: 'requested',
				relatedId: borrowRequest!.id,
				relatedType: 'borrowRequest',
				message: 'Requested to borrow this item'
			},
			tx
		);

		return borrowRequest;
	});
};

export const deleteBorrowRequest = async (id: number) => {
	return await db.delete(borrowRequests).where(eq(borrowRequests.id, id));
};

export const getBorrowRequest = async (id: number) => {
	return await db.query.borrowRequests.findFirst({
		where: (t, { eq }) => eq(t.id, id)
	});
};

export const getBorrowRequestWithRelations = async (id: number) => {
	return await db.query.borrowRequests.findFirst({
		where: (t, { eq }) => eq(t.id, id),
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
		where: (t, { eq, and }) =>
			and(
				eq(t.userId, payload.userId),
				eq(t.itemId, payload.itemId),
				eq(t.status, payload.status)
			)
	});
};

export const getBorrowRequestsForUser = async (
	userId: string,
	status: BorrowRequestStatus = 'pending'
) => {
	const items = await db.query.items.findMany({
		where: (t, { eq }) => eq(t.ownerId, userId),
		with: {
			borrowRequests: {
				with: { user: true },
				where: (t, { eq }) => eq(t.status, status)
			}
		}
	});

	return items.filter((item) => item.borrowRequests.length > 0);
};

export const getBorrowRequestsFromUser = async (
	userId: string,
	status: BorrowRequestStatus = 'pending'
) => {
	return await db.query.borrowRequests.findMany({
		where: (t, { eq, and }) => and(eq(t.userId, userId), eq(t.status, status)),
		with: { user: true, item: true }
	});
};

export const acceptBorrowRequest = async (id: number, actorId: string) => {
	await db.transaction(async (tx) => {
		const borrowRequest = (
			await tx
				.update(borrowRequests)
				.set({ status: 'accepted' })
				.where(eq(borrowRequests.id, id))
				.returning()
		).at(0);

		const item = await tx.query.items.findFirst({
			where: (t, { eq }) => eq(t.id, borrowRequest!.itemId)
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

		await recordItemActivity(
			{
				actorId,
				actorType: 'user',
				itemId: borrowRequest!.itemId,
				activityType: 'accepted',
				relatedId: borrowRequest!.id,
				relatedType: 'borrowRequest',
				message: 'Accepted the borrow request'
			},
			tx
		);
	});
};

export const rejectBorrowRequest = async (id: number, actorId: string) => {
	await db.transaction(async (tx) => {
		const borrowRequest = (
			await tx
				.update(borrowRequests)
				.set({ status: 'rejected' })
				.where(eq(borrowRequests.id, id))
				.returning()
		).at(0);

		await recordItemActivity(
			{
				actorId,
				actorType: 'user',
				itemId: borrowRequest!.itemId,
				activityType: 'rejected',
				relatedId: borrowRequest!.id,
				relatedType: 'borrowRequest',
				message: 'Rejected the borrow request'
			},
			tx
		);
	});
};

export const cancelBorrowRequest = async (id: number, actorId: string) => {
	await db.transaction(async (tx) => {
		const borrowRequest = (
			await tx
				.update(borrowRequests)
				.set({ status: 'cancelled' })
				.where(eq(borrowRequests.id, id))
				.returning()
		).at(0);

		await recordItemActivity(
			{
				actorId,
				actorType: 'user',
				itemId: borrowRequest!.itemId,
				activityType: 'cancelled',
				relatedId: borrowRequest!.id,
				relatedType: 'borrowRequest',
				message: 'Cancelled the borrow request'
			},
			tx
		);
	});
};
