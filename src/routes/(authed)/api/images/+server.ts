import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getItem } from '$lib/server/services/itemsService';
import { uploadFile, generateKey } from '$lib/server/services/storageService';
import { createImage, deleteImage, getImage } from '$lib/server/services/imagesService';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const itemId = formData.get('itemId') as string | null;

	if (!file || !itemId) {
		return error(400, 'File and itemId are required');
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return error(400, 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
	}

	if (file.size > MAX_FILE_SIZE) {
		return error(400, 'File too large. Maximum size is 10MB');
	}

	const item = await getItem(Number(itemId));
	if (!item) {
		return error(404, 'Item not found');
	}

	if (item.ownerId !== locals.user.id) {
		return error(403, 'You do not own this item');
	}

	const key = generateKey(Number(itemId), file.name);
	const { url } = await uploadFile(file, key);

	const image = await createImage({
		url,
		imageableType: 'items',
		imageableId: Number(itemId)
	});

	return json(image, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

	const imageId = url.searchParams.get('id');
	if (!imageId) {
		return error(400, 'Image ID is required');
	}

	const image = await getImage(Number(imageId));
	if (!image) {
		return error(404, 'Image not found');
	}

	if (image.imageableType !== 'items') {
		return error(400, 'Can only delete item images through this endpoint');
	}

	const item = await getItem(image.imageableId);
	if (!item || item.ownerId !== locals.user.id) {
		return error(403, 'You do not own this item');
	}

	await deleteImage(Number(imageId));

	return json({ success: true });
};
