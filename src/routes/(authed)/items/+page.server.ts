import { getAllItems } from '$lib/server/services/itemsService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		items: await getAllItems()
	};
};
