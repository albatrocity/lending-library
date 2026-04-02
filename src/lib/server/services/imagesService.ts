import { db } from '$lib/server/db';
import { images } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { generateKey, uploadFile, deleteFile } from './storageService';

type CreateImageParams = {
	url: string;
	imageableType: 'items' | 'users' | 'borrowRequests' | 'borrows';
	imageableId: number;
};

export async function createImage(params: CreateImageParams) {
	const [image] = await db.insert(images).values(params).returning();
	return image;
}

export async function uploadItemImages(itemId: number, files: File[]) {
	const uploadedImages = [];

	for (const file of files) {
		if (file.size === 0) continue;

		const buffer = Buffer.from(await file.arrayBuffer());
		const key = generateKey(itemId, file.name);
		const url = await uploadFile(key, buffer, file.type);

		const image = await createImage({
			url,
			imageableType: 'items',
			imageableId: itemId
		});

		uploadedImages.push(image);
	}

	return uploadedImages;
}

export async function deleteItemImages(imageIds: number[]) {
	for (const imageId of imageIds) {
		const image = await getImage(imageId);
		if (image) {
			const key = extractKeyFromUrl(image.url);
			if (key) {
				await deleteFile(key);
			}
			await deleteImage(imageId);
		}
	}
}

export async function getImagesForItem(itemId: number) {
	return await db
		.select()
		.from(images)
		.where(and(eq(images.imageableType, 'items'), eq(images.imageableId, itemId)));
}

export async function getImage(id: number) {
	return await db.query.images.findFirst({
		where: (t, { eq }) => eq(t.id, id)
	});
}

export async function deleteImage(id: number) {
	return await db.delete(images).where(eq(images.id, id));
}

export async function deleteImagesForItem(itemId: number) {
	return await db
		.delete(images)
		.where(and(eq(images.imageableType, 'items'), eq(images.imageableId, itemId)));
}

export function extractKeyFromUrl(url: string): string | null {
	const bucket = env.S3_BUCKET || 'lending-library';
	const endpoint = env.S3_ENDPOINT || '';
	const prefix = `${endpoint}/${bucket}/`;

	if (url.startsWith(prefix)) {
		return url.slice(prefix.length);
	}
	return null;
}
