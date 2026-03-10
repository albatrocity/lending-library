import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/services/borrowRequestsService', () => ({
	getBorrowRequestWithRelations: vi.fn(),
	acceptBorrowRequest: vi.fn(),
	rejectBorrowRequest: vi.fn(),
	cancelBorrowRequest: vi.fn()
}));

vi.mock('$lib/server/services/borrowsService', () => ({
	getBorrowByRequestId: vi.fn(),
	activateBorrow: vi.fn()
}));

import { actions } from './+page.server';
import { getBorrowRequestWithRelations } from '$lib/server/services/borrowRequestsService';
import { getBorrowByRequestId, activateBorrow } from '$lib/server/services/borrowsService';

const BORROWER_ID = 'user-borrower';
const LENDER_ID = 'user-lender';
const OTHER_ID = 'user-other';

const mockItem = {
	id: 1,
	name: 'Test Item',
	ownerId: LENDER_ID,
	description: '',
	createdAt: new Date(),
	updatedAt: new Date()
};

const mockBorrowRequest = {
	id: 42,
	userId: BORROWER_ID,
	itemId: 1,
	status: 'accepted' as const,
	item: mockItem,
	user: { id: BORROWER_ID, name: 'Alice' },
	startDate: new Date(),
	endDate: null,
	description: null,
	createdAt: new Date(),
	updatedAt: new Date()
};

const mockBorrow = {
	id: 10,
	borrowRequestId: 42,
	borrowerId: BORROWER_ID,
	lenderId: LENDER_ID,
	itemId: 1,
	status: 'pending' as const,
	startDate: new Date(),
	endDate: null,
	returnDate: null,
	createdAt: new Date(),
	updatedAt: new Date()
};

const makeEvent = (userId: string | null, params = { id: '42' }) =>
	({
		params,
		locals: { user: userId ? { id: userId } : null }
	}) as any;

describe('markReceived action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getBorrowRequestWithRelations).mockResolvedValue(mockBorrowRequest as any);
		vi.mocked(getBorrowByRequestId).mockResolvedValue(mockBorrow as any);
		vi.mocked(activateBorrow).mockResolvedValue({ ...mockBorrow, status: 'active' } as any);
	});

	it('throws 401 when user is not authenticated', async () => {
		await expect(actions.markReceived(makeEvent(null))).rejects.toMatchObject({ status: 401 });
	});

	it('throws 404 when borrow request is not found', async () => {
		vi.mocked(getBorrowRequestWithRelations).mockResolvedValue(undefined);
		await expect(actions.markReceived(makeEvent(BORROWER_ID))).rejects.toMatchObject({
			status: 404
		});
	});

	it('throws 403 when user is neither the borrower nor the lender', async () => {
		await expect(actions.markReceived(makeEvent(OTHER_ID))).rejects.toMatchObject({ status: 403 });
	});

	it('throws 400 when borrow request is not in accepted state', async () => {
		vi.mocked(getBorrowRequestWithRelations).mockResolvedValue({
			...mockBorrowRequest,
			status: 'pending'
		} as any);
		await expect(actions.markReceived(makeEvent(BORROWER_ID))).rejects.toMatchObject({
			status: 400
		});
	});

	it('throws 404 when no borrow record exists for the request', async () => {
		vi.mocked(getBorrowByRequestId).mockResolvedValue(undefined);
		await expect(actions.markReceived(makeEvent(BORROWER_ID))).rejects.toMatchObject({
			status: 404
		});
	});

	it('allows the borrower to activate the borrow', async () => {
		const result = await actions.markReceived(makeEvent(BORROWER_ID));
		expect(activateBorrow).toHaveBeenCalledWith(mockBorrow.id);
		expect(result).toEqual({ delivered: true });
	});

	it('allows the lender to activate the borrow', async () => {
		const result = await actions.markReceived(makeEvent(LENDER_ID));
		expect(activateBorrow).toHaveBeenCalledWith(mockBorrow.id);
		expect(result).toEqual({ delivered: true });
	});

	it('returns delivered without calling activateBorrow when borrow is already active', async () => {
		vi.mocked(getBorrowByRequestId).mockResolvedValue({ ...mockBorrow, status: 'active' } as any);
		const result = await actions.markReceived(makeEvent(BORROWER_ID));
		expect(activateBorrow).not.toHaveBeenCalled();
		expect(result).toEqual({ delivered: true });
	});
});
