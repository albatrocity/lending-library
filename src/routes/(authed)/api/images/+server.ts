import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getItem } from '$lib/server/services/itemsService';
import { uploadFile, deleteFile, generateKey } from '$lib/server/services/storageService';
import {
	createImage,
	getImage,
	deleteImage,
	extractKeyFromUrl
} from '$lib/server/services/imagesService';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const itemId = Number(formData.get('itemId'));

	if (!file) {
		return error(400, 'No file provided');
	}

	if (isNaN(itemId)) {
		return error(400, 'Invalid item ID');
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return error(400, 'Invalid file type. Allowed: jpeg, png, gif, webp');
	}

	if (file.size > MAX_FILE_SIZE) {
		return error(400, 'File too large. Maximum size is 10MB');
	}

	const item = await getItem(itemId);
	if (!item) {
		return error(404, 'Item not found');
	}

	if (item.ownerId !== locals.user.id) {
		return error(403, 'You do not own this item');
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const key = generateKey(itemId, file.name);
	const url = await uploadFile(key, buffer, file.type);

	const image = await createImage({
		url,
		imageableType: 'items',
		imageableId: itemId
	});

	return json({ id: image.id, url: image.url });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const imageId = Number(url.searchParams.get('id'));
	if (isNaN(imageId)) {
		return error(400, 'Invalid image ID');
	}

	const image = await getImage(imageId);
	if (!image) {
		return error(404, 'Image not found');
	}

	const item = await getItem(image.imageableId);
	if (!item) {
		return error(404, 'Associated item not found');
	}

	if (item.ownerId !== locals.user.id) {
		return error(403, 'You do not own this item');
	}

	const key = extractKeyFromUrl(image.url);
	if (key) {
		await deleteFile(key);
	}

	await deleteImage(imageId);

	return json({ success: true });
};
