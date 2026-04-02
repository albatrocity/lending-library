import { createItemInCommunities } from '$lib/server/services/itemsService';
import { searchTags, setItemTags } from '$lib/server/services/tagsService';
import { uploadItemImages } from '$lib/server/services/imagesService';
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

		// Handle image uploads
		const imageFiles = rawFormData.getAll('images') as File[];
		const pendingImage = rawFormData.get('pendingImage') as File | null;

		const filesToUpload = [
			...(pendingImage && pendingImage.size > 0 ? [pendingImage] : []),
			...imageFiles.filter((f) => f.size > 0)
		];

		if (filesToUpload.length > 0) {
			await uploadItemImages(item.id, filesToUpload);
		}

		redirect(302, `/items/${item.id}`);
	}
};
