import { createItemInCommunities } from '$lib/server/services/itemsService';
import { searchTags, setItemTags } from '$lib/server/services/tagsService';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createItemWithCommunitiesSchema } from '$lib/schemas/items';
import { getUserCommunities } from '$lib/server/services/communitiesService';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const [communities, topTags] = await Promise.all([
		getUserCommunities(user.id),
		searchTags(undefined, 10)
	]);

	return { communities, topTags };
};

export const actions: Actions = {
	createItem: async (event) => {
		if (!event.locals.user) {
			return fail(401, { errors: 'Unauthorized' });
		}

		const rawFormData = await event.request.formData();
		const formData = Object.fromEntries(rawFormData);
		const communityIds = rawFormData.getAll('communityIds').map(Number);
		const tagNames = rawFormData.getAll('tags').map(String);

		const { data, success, error } = createItemWithCommunitiesSchema.safeParse({
			...formData,
			communityIds,
			ownerId: event.locals.user.id
		});

		if (error || !success || !data) {
			return fail(400, { errors: error?.message ?? 'Invalid data' });
		}

		const item = await createItemInCommunities(data);
		await setItemTags(item.id, tagNames);

		redirect(302, '/users/me/items');
	}
};
