import { getItem } from '$lib/server/services/itemsService';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from '../../[id]/borrow/$types';
import { createBorrowRequestSchema } from '$lib/schemas/borrowRequests';
import {
	createBorrowRequest,
	getBorrowRequestsByItemId,
	getBorrowRequestsCountByItemId
} from '$lib/server/services/borrowRequestsService';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const item = await getItem(Number(params.id));
	const userOwnsItem = item?.ownerId === user.id;

	const borrowRequests = userOwnsItem ? await getBorrowRequestsByItemId(Number(params.id)) : [];
	const borrowRequestsCount = await getBorrowRequestsCountByItemId(Number(params.id), 'pending');

	if (!item) {
		return error(404, 'Item not found');
	}

	return { item, user, borrowRequestsCount, borrowRequests, userOwnsItem };
};

export const actions: Actions = {
	async request(event) {
		if (!event.locals.user) {
			return fail(401, 'Unauthorized');
		}

		const { request, params } = event;
		const formData = Object.fromEntries(await request.formData());
		const item = await getItem(Number(event.params.id));
		if (!item) {
			return fail(404, 'Item not found');
		}

		const { data, success, error } = createBorrowRequestSchema.safeParse({
			...formData,
			startDate: new Date(formData.startDate as string),
			endDate: new Date(formData.endDate as string),
			userId: event.locals.user.id,
			itemId: item.id
		});

		if (error || !success || !data) {
			return fail(400, { errors: error?.message ?? 'Invalid data' });
		}

		await createBorrowRequest(data);

		return redirect(302, `/items/${params.id}`);
	}
};
