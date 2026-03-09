import { searchTags } from '$lib/server/services/tagsService';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const tags = await searchTags(q);
	return json(tags);
};
