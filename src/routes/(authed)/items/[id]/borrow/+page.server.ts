import { getItem, getUserAccessToItem } from '$lib/server/services/itemsService';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from '../../[id]/borrow/$types';

import {
	createBorrowRequest,
	getBorrowRequestsByItemId,
	getBorrowRequestsCountByItemId,
	getUserItemBorrowRequest
} from '$lib/server/services/borrowRequestsService';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	if (!getUserAccessToItem(user.id, Number(params.id))) {
		return error(403, 'You do not have access to this item');
	}

	const item = await getItem(Number(params.id));

	if (!item) {
		return error(404, 'Item not found');
	}

	const userOwnsItem = item?.ownerId === user.id;

	const borrowRequests = userOwnsItem ? await getBorrowRequestsByItemId(Number(params.id)) : [];
	const borrowRequestsCount = await getBorrowRequestsCountByItemId(Number(params.id), 'pending');

	const pendingBorrowRequest = await getUserItemBorrowRequest({
		userId: user.id,
		itemId: Number(params.id),
		status: 'pending'
	});

	return { item, user, borrowRequestsCount, borrowRequests, userOwnsItem, pendingBorrowRequest };
};

export const actions: Actions = {
	request: async (event) => {
		const { request, params, locals } = event;

		if (!locals?.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		if (!(await getUserAccessToItem(locals.user.id, Number(params.id)))) {
			return fail(403, { error: 'You do not have access to this item' });
		}

		const formData = await request.formData();
		const startDate = formData.get('startDate');
		const endDate = formData.get('endDate');
		const description = formData.get('description')?.toString();

		if (!startDate) {
			return fail(400, { error: 'Please enter a start date' });
		}

		await createBorrowRequest({
			userId: locals.user.id,
			itemId: Number(params.id),
			startDate: new Date(startDate as string),
			endDate: endDate ? new Date(endDate as string) : undefined,
			description
		});

		return redirect(302, `/items/${params.id}`);
	}
};
