import { db } from '$lib/server/db';
import { images } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteFile } from './storageService';
import { env } from '$env/dynamic/private';

type ImageableType = 'items' | 'users' | 'borrowRequests' | 'borrows';

export type CreateImageParams = {
	url: string;
	imageableType: ImageableType;
	imageableId: number;
};

export async function createImage(params: CreateImageParams) {
	const [image] = await db.insert(images).values(params).returning();
	return image;
}

export async function getImagesForItem(itemId: number) {
	return await db
		.select()
		.from(images)
		.where(and(eq(images.imageableType, 'items'), eq(images.imageableId, itemId)));
}

export async function getImage(id: number) {
	const result = await db.select().from(images).where(eq(images.id, id));
	return result[0];
}

export async function deleteImage(id: number) {
	const image = await getImage(id);
	if (!image) return false;

	const key = extractKeyFromUrl(image.url);
	if (key) {
		try {
			await deleteFile(key);
		} catch {
			// Log error but continue with database deletion
		}
	}

	await db.delete(images).where(eq(images.id, id));
	return true;
}

export async function deleteImagesForItem(itemId: number) {
	const itemImages = await getImagesForItem(itemId);

	for (const image of itemImages) {
		await deleteImage(image.id);
	}
}

function extractKeyFromUrl(url: string): string | null {
	const endpoint = env.S3_ENDPOINT || 'http://localhost:9000';
	const bucket = env.S3_BUCKET || 'lending-library';
	const prefix = `${endpoint}/${bucket}/`;

	if (url.startsWith(prefix)) {
		return url.slice(prefix.length);
	}
	return null;
}
