import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

const s3Client = new S3Client({
	endpoint: env.S3_ENDPOINT,
	region: env.S3_REGION || 'us-east-1',
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY || 'foo',
		secretAccessKey: env.S3_SECRET_KEY || 'bar'
	},
	forcePathStyle: true
});

const bucket = env.S3_BUCKET || 'lending-library';

export function generateKey(itemId: number, filename: string): string {
	const timestamp = Date.now();
	const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
	return `items/${itemId}/${timestamp}-${sanitizedFilename}`;
}

export async function uploadFile(
	key: string,
	file: Buffer,
	contentType: string
): Promise<string> {
	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: file,
			ContentType: contentType
		})
	);

	return getPublicUrl(key);
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
	return `${env.S3_ENDPOINT}/${bucket}/${key}`;
}
