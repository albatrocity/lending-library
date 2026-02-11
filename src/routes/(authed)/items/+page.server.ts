import { getAllItems } from '$lib/server/services/itemsService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	return {
		items: await getAllItems(),
		user: user
	};
};
