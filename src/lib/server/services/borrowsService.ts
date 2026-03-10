import { db } from '$lib/server/db';
import { borrows } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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

export const activateBorrow = async (id: number) => {
	return (
		await db
			.update(borrows)
			.set({ status: 'active', updatedAt: new Date() })
			.where(eq(borrows.id, id))
			.returning()
	).at(0);
};
