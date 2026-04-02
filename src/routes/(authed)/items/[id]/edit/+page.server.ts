import { getItem, getItemCommunities, updateItem } from '$lib/server/services/itemsService';
import { searchTags, setItemTags } from '$lib/server/services/tagsService';
import { uploadItemImages, deleteItemImages } from '$lib/server/services/imagesService';
import { getUserCommunities } from '$lib/server/services/communitiesService';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../../[id]/edit/$types';
import { updateItemSchema } from '$lib/schemas/items';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();

	const [item, topTags, communities] = await Promise.all([
		getItem(Number(params.id)),
		searchTags(undefined, 10),
		getUserCommunities(user.id)
	]);

	if (!item) {
		return error(404, 'Item not found');
	}

	if (item.ownerId !== user.id) {
		return error(403, 'You are not the owner of this item');
	}

	const itemCommunities = await getItemCommunities(item.id);

	return { item, topTags, communities, itemCommunities };
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

		// Handle image deletions
		const imagesToRemoveJson = rawFormData.get('imagesToRemove') as string;
		const imagesToRemove: number[] = imagesToRemoveJson ? JSON.parse(imagesToRemoveJson) : [];

		if (imagesToRemove.length > 0) {
			await deleteItemImages(imagesToRemove);
		}

		// Handle new image uploads
		const imageFiles = rawFormData.getAll('images') as File[];
		const filesToUpload = imageFiles.filter((f) => f.size > 0);

		if (filesToUpload.length > 0) {
			await uploadItemImages(item.id, filesToUpload);
		}

		return redirect(302, `/items/${item.id}`);
	}
};
