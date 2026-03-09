import {
	acceptBorrowRequest,
	cancelBorrowRequest,
	getBorrowRequestWithRelations,
	rejectBorrowRequest
} from '$lib/server/services/borrowRequestsService';
import { activateBorrow, getBorrowByRequestId } from '$lib/server/services/borrowsService';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		return redirect(302, '/login');
	}

	const user = locals.user;
	const borrowRequest = await getBorrowRequestWithRelations(Number(params.id));

	if (!borrowRequest) {
		return error(404, 'Borrow request not found');
	}

	const borrow =
		borrowRequest.status === 'accepted'
			? await getBorrowByRequestId(borrowRequest.id)
			: undefined;

	return { borrowRequest, borrow, isOutgoing: borrowRequest.userId === user.id };
};

export const actions: Actions = {
	accept: async (event) => {
		const { params } = event;
		const { id } = params;
		await acceptBorrowRequest(Number(id));
		return { success: true };
	},
	reject: async (event) => {
		const { params } = event;
		const { id } = params;
		await rejectBorrowRequest(Number(id));
		return { success: true };
	},
	cancel: async (event) => {
		const { params } = event;
		const { id } = params;
		await cancelBorrowRequest(Number(id));
		return { success: true };
	},
	markReceived: async (event) => {
		const { params, locals } = event;
		const user = locals.user;

		if (!user) {
			return error(401, 'Unauthorized');
		}

		const borrowRequest = await getBorrowRequestWithRelations(Number(params.id));

		if (!borrowRequest) {
			return error(404, 'Borrow request not found');
		}

		const isLender = borrowRequest.item!.ownerId === user.id;
		const isBorrower = borrowRequest.userId === user.id;

		if (!isLender && !isBorrower) {
			return error(403, 'Forbidden');
		}

		if (borrowRequest.status !== 'accepted') {
			return error(400, 'Borrow request is not in an accepted state');
		}

		const borrow = await getBorrowByRequestId(borrowRequest.id);

		if (!borrow) {
			return error(404, 'Borrow record not found');
		}

		if (borrow.status === 'active') {
			return { delivered: true };
		}

		await activateBorrow(borrow.id);
		return { delivered: true };
	}
};
