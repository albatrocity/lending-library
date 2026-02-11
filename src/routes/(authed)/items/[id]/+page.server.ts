import { getItem } from '$lib/server/services/itemsService';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../[id]/$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();
	const item = await getItem(Number(params.id));

	if (!item) {
		return error(404, 'Item not found');
	}

	return { item, user };
};
