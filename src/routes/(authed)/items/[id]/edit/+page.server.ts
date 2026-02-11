import { getItem, updateItem } from '$lib/server/services/itemsService';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { updateItemSchema } from '$lib/schemas/items';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const item = await getItem(Number(params.id));
	if (!item) {
		return error(404, 'Item not found');
	}

	if (item.ownerId !== user.id) {
		return error(403, 'You are not the owner of this item');
	}

	return { item };
};

export const actions: Actions = {
	async default(event) {
		const { request, params } = event;
		const formData = Object.fromEntries(await request.formData());
		const item = await getItem(Number(params.id));
		if (!item) {
			return fail(404, 'Item not found');
		}

		if (!event.locals.user) {
			return fail(401, 'Unauthorized');
		}

		if (item.ownerId !== event.locals.user.id) {
			return fail(403, 'You are not the owner of this item');
		}

		const { data, success, error } = updateItemSchema.safeParse({
			...formData,
			ownerId: event.locals.user.id
		});

		if (error || !success || !data) {
			return fail(400, { errors: error?.message ?? 'Invalid data' });
		}

		const updated = await updateItem(item.id, data);

		if (!updated) {
			return fail(500, { errors: 'Failed to update item' });
		}

		return redirect(302, `/items`);
	}
};
