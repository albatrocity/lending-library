import {
	acceptBorrowRequest,
	cancelBorrowRequest,
	getBorrowRequestWithRelations,
	rejectBorrowRequest
} from '$lib/server/services/borrowRequestsService';
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

	return { borrowRequest, isOutgoing: borrowRequest.userId === user.id };
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
	}
};
