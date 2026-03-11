import { searchCommunityMembers } from '$lib/server/services/communitiesService';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const q = url.searchParams.get('q') ?? '';
	const users = await searchCommunityMembers(locals.user!.id, q);
	return json(users);
};
