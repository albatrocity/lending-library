import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from '../../[id]/delete/$types';
import { deleteItem, getItem } from '$lib/server/services/itemsService';

export const actions: Actions = {
	async default(event) {
		if (!event.locals.user) {
			return fail(401, { errors: 'Unauthorized' });
		}

		const id = Number(event.params.id);

		const found = await getItem(id);

		if (!found) {
			return fail(404, { errors: 'Item not found' });
		}

		if (found.ownerId !== event.locals.user.id) {
			return fail(403, { errors: 'You are not the owner of this item' });
		}

		await deleteItem(id);

		redirect(302, '/items');
	}
};
