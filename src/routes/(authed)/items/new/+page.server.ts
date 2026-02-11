import { createItem } from '$lib/server/services/itemsService';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createItemSchema } from '$lib/schemas/items';

export const actions: Actions = {
	createItem: async (event) => {
		if (!event.locals.user) {
			return fail(401, { errors: 'Unauthorized' });
		}

		const formData = Object.fromEntries(await event.request.formData());

		const { data, success, error } = createItemSchema.safeParse({
			...formData,
			ownerId: event.locals.user.id
		});

		if (error || !success || !data) {
			return fail(400, { errors: error?.message ?? 'Invalid data' });
		}

		await createItem(data);

		redirect(302, '/items');
	}
};
