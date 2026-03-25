import { db } from '$lib/server/db';
import { borrows } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { recordItemActivity } from './activityService';

export const getActiveBorrowForItem = async (itemId: number) => {
	return await db.query.borrows.findFirst({
		where: (t, { eq, and }) => and(eq(t.itemId, itemId), eq(t.status, 'active')),
		columns: { borrowerId: true, id: true }
	});
};

export const getBorrowByRequestId = async (borrowRequestId: number) => {
	return await db.query.borrows.findFirst({
		where: (t, { eq }) => eq(t.borrowRequestId, borrowRequestId)
	});
};

export const getActiveBorrowsForBorrower = async (borrowerId: string) => {
	return await db.query.borrows.findMany({
		where: (t, { eq, and }) => and(eq(t.borrowerId, borrowerId), eq(t.status, 'active')),
		with: { item: true }
	});
};

export const activateBorrow = async (id: number, actorId: string) => {
	return await db.transaction(async (tx) => {
		const borrow = (
			await tx
				.update(borrows)
				.set({ status: 'active', updatedAt: new Date() })
				.where(eq(borrows.id, id))
				.returning()
		).at(0);

		await recordItemActivity(
			{
				actorId,
				actorType: 'user',
				itemId: borrow!.itemId,
				activityType: 'borrowed',
				relatedId: borrow!.id,
				relatedType: 'borrow',
				message: 'Received the item'
			},
			tx
		);

		return borrow;
	});
};
