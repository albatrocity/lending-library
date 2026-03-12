import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	HeadBucketCommand,
	CreateBucketCommand
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

const s3Client = new S3Client({
	endpoint: env.S3_ENDPOINT,
	region: env.S3_REGION || 'us-east-1',
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY || '',
		secretAccessKey: env.S3_SECRET_KEY || ''
	},
	forcePathStyle: true
});

const bucket = env.S3_BUCKET || 'lending-library';

async function ensureBucketExists(): Promise<void> {
	try {
		await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
	} catch (error) {
		if ((error as { name?: string }).name === 'NotFound') {
			await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
		}
	}
}

export function generateKey(itemId: number, filename: string): string {
	const timestamp = Date.now();
	const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
	return `items/${itemId}/${timestamp}-${sanitizedFilename}`;
}

export async function uploadFile(
	file: File,
	key: string
): Promise<{ url: string; key: string }> {
	await ensureBucketExists();

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: buffer,
			ContentType: file.type
		})
	);

	return {
		url: getPublicUrl(key),
		key
	};
}

export async function deleteFile(key: string): Promise<void> {
	await s3Client.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: key
		})
	);
}

export function getPublicUrl(key: string): string {
	const endpoint = env.S3_ENDPOINT || 'http://localhost:9000';
	return `${endpoint}/${bucket}/${key}`;
}
