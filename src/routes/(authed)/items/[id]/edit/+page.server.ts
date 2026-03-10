import { getItem, updateItem } from '$lib/server/services/itemsService';
import { searchTags, setItemTags } from '$lib/server/services/tagsService';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../../[id]/edit/$types';
import { updateItemSchema } from '$lib/schemas/items';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const [item, topTags] = await Promise.all([
		getItem(Number(params.id)),
		searchTags(undefined, 10)
	]);

	if (!item) {
		return error(404, 'Item not found');
	}

	if (item.ownerId !== user.id) {
		return error(403, 'You are not the owner of this item');
	}

	return { item, topTags };
};

export const actions: Actions = {
	async default(event) {
		const { request, params } = event;
		const rawFormData = await request.formData();
		const formData = Object.fromEntries(rawFormData);
		const tagNames = rawFormData.getAll('tags').map(String);

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

		await setItemTags(item.id, tagNames);

		return redirect(302, `/items`);
	}
};
