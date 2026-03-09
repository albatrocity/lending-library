import { db } from '$lib/server/db';
import { borrows } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const getBorrowByRequestId = async (borrowRequestId: number) => {
	return await db.query.borrows.findFirst({
		where: { borrowRequestId }
	});
};

export const getActiveBorrowsForBorrower = async (borrowerId: string) => {
	return await db.query.borrows.findMany({
		where: { borrowerId, status: 'active' },
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
