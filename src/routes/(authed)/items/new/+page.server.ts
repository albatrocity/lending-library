import { createItemInCommunities } from '$lib/server/services/itemsService';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createItemWithCommunitiesSchema } from '$lib/schemas/items';
import { getUserCommunities } from '$lib/server/services/communitiesService';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const communities = await getUserCommunities(user.id);

	return { communities };
};

export const actions: Actions = {
	createItem: async (event) => {
		if (!event.locals.user) {
			return fail(401, { errors: 'Unauthorized' });
		}

		const formData = Object.fromEntries(await event.request.formData());

		const { data, success, error } = createItemWithCommunitiesSchema.safeParse({
			...formData,
			ownerId: event.locals.user.id
		});

		if (error || !success || !data) {
			return fail(400, { errors: error?.message ?? 'Invalid data' });
		}

		await createItemInCommunities(data);

		redirect(302, '/items');
	}
};
